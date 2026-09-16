import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient } from '@/lib/supabase/server'
import { deleteFromS3, ensureUploadCors, getFromS3, getUploadPresignedUrl, uploadToS3 } from '@/lib/s3/client'
import { evidenceMagicMatches, extractEvidence, extractEvidenceFacts, MAX_EVIDENCE_BYTES, normalizeEvidenceMime, prepareEvidenceRetrieval, sanitizeEvidenceBytes } from '@/lib/mission-control/evidence'
import { mergeEvidenceIntoSpecification } from '@/lib/mission-control/evidence-specification'
import type { DeliverableSpecification } from '@/lib/mission-control/contracts'

const ALLOWED=new Set(['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/csv','text/plain','image/png','image/jpeg'])
export const maxDuration=60

export async function POST(request:Request){
  const allowed=await requireAllowedUser();if(!allowed.ok)return NextResponse.json({error:allowed.error},{status:allowed.status})
  const body=await request.json() as {conversation_id?:string;name?:string;mime_type?:string;size_bytes?:number}
  const conversationId=body.conversation_id?.trim()??'';const name=body.name?.trim()??'';const size=Number(body.size_bytes)
  const mime=normalizeEvidenceMime(name,body.mime_type??'')
  if(!conversationId||!name||!mime||!ALLOWED.has(mime)||!Number.isFinite(size)||size<=0||size>MAX_EVIDENCE_BYTES)return NextResponse.json({error:'Unsupported file type or file exceeds 20 MB'},{status:415})
  const db=await createClient();const owner=await db.from('apollo_conversations').select('id').eq('id',conversationId).eq('user_id',allowed.user.userId).single()
  if(owner.error||!owner.data)return NextResponse.json({error:'Mission conversation was not found'},{status:404})
  try{await ensureUploadCors(new URL(request.url).origin)}catch(cause){return NextResponse.json({error:`Secure evidence storage is not ready for direct upload: ${cause instanceof Error?cause.message:'configuration failed'}`},{status:503})}
  const id=randomUUID();const safeName=name.replace(/[^a-zA-Z0-9._-]/g,'_');const storageKey=`mission-evidence/${conversationId}/${id}-${safeName}`
  const inserted=await db.from('apollo_conversation_evidence').insert({id,conversation_id:conversationId,user_id:allowed.user.userId,original_name:name,storage_key:storageKey,mime_type:mime,size_bytes:size,extraction_status:'pending',extracted_facts:[]}).select('id').single()
  if(inserted.error)return NextResponse.json({error:inserted.error.message},{status:500})
  try{return NextResponse.json({id,upload_url:await getUploadPresignedUrl(storageKey,mime,600),mime_type:mime},{status:201})}
  catch(cause){await db.from('apollo_conversation_evidence').update({extraction_status:'failed'}).eq('id',id).eq('user_id',allowed.user.userId);return NextResponse.json({error:cause instanceof Error?cause.message:'Secure upload could not be initialized'},{status:500})}
}

export async function PATCH(request:Request){
  const allowed=await requireAllowedUser();if(!allowed.ok)return NextResponse.json({error:allowed.error},{status:allowed.status})
  const body=await request.json() as {conversation_id?:string;evidence_id?:string};const conversationId=body.conversation_id?.trim()??'';const id=body.evidence_id?.trim()??''
  const db=await createClient();const [record,owner]=await Promise.all([
    db.from('apollo_conversation_evidence').select('id,original_name,storage_key,mime_type,size_bytes,extraction_status').eq('id',id).eq('conversation_id',conversationId).eq('user_id',allowed.user.userId).single(),
    db.from('apollo_conversations').select('id,current_spec_version').eq('id',conversationId).eq('user_id',allowed.user.userId).single(),
  ])
  if(record.error||!record.data||owner.error||!owner.data||!record.data.storage_key)return NextResponse.json({error:'Pending evidence upload was not found'},{status:404})
  const row=record.data;let received:Buffer
  try{received=await getFromS3(row.storage_key)}catch{return NextResponse.json({error:'The secured upload could not be retrieved'},{status:409})}
  if(received.length!==Number(row.size_bytes)||received.length>MAX_EVIDENCE_BYTES||!evidenceMagicMatches(received,row.mime_type)){await Promise.allSettled([deleteFromS3(row.storage_key),db.from('apollo_conversation_evidence').update({extraction_status:'failed'}).eq('id',id).eq('user_id',allowed.user.userId)]);return NextResponse.json({error:'Uploaded file failed size or content verification'},{status:415})}
  let bytes:Buffer
  try{bytes=await sanitizeEvidenceBytes(received,row.mime_type);if(!bytes.equals(received))await uploadToS3(row.storage_key,bytes,row.mime_type)}catch{return NextResponse.json({error:'Image could not be safely normalized for evidence custody'},{status:415})}
  const originalHash=createHash('sha256').update(bytes).digest('hex');let status:'verified'|'failed'='verified';let retrievalKey=row.storage_key;let retrievalMime=row.mime_type;let retrievalHash=originalHash;let extractedText:string|undefined;let facts:Awaited<ReturnType<typeof extractEvidenceFacts>>=[]
  try{const extracted=await extractEvidence(bytes,row.mime_type);extractedText=extracted.text;const retrieval=prepareEvidenceRetrieval(bytes,row.mime_type,extracted);retrievalMime=retrieval.mime;retrievalHash=createHash('sha256').update(retrieval.bytes).digest('hex');if(retrieval.derived){retrievalKey=`${row.storage_key}.extracted.txt`;await uploadToS3(retrievalKey,retrieval.bytes,retrievalMime)}}catch{status='failed'}
  const current=await db.from('apollo_specification_versions').select('specification').eq('conversation_id',conversationId).eq('version',owner.data.current_spec_version).single()
  if(current.error||!current.data)return NextResponse.json({error:'Current mission specification was not found'},{status:409})
  const prior=current.data.specification as DeliverableSpecification
  if(status==='verified'){try{facts=await extractEvidenceFacts(extractedText,prior.artifact.recommended_type)}catch{facts=[]};facts=facts.map(fact=>({...fact,source_reference:id,last_editor:allowed.user.userId}))}
  const updated=await db.from('apollo_conversation_evidence').update({content_sha256:originalHash,retrieval_storage_key:retrievalKey,retrieval_mime_type:retrievalMime,retrieval_sha256:retrievalHash,size_bytes:bytes.length,extraction_status:status,extracted_facts:facts}).eq('id',id).eq('user_id',allowed.user.userId)
  if(updated.error)return NextResponse.json({error:updated.error.message},{status:500})
  for(let attempt=0;attempt<4;attempt+=1){const latestOwner=await db.from('apollo_conversations').select('current_spec_version').eq('id',conversationId).eq('user_id',allowed.user.userId).single();if(latestOwner.error||!latestOwner.data)break;const expectedVersion=latestOwner.data.current_spec_version;const latest=await db.from('apollo_specification_versions').select('specification').eq('conversation_id',conversationId).eq('version',expectedVersion).single();if(latest.error||!latest.data)break;const merged=mergeEvidenceIntoSpecification({prior:latest.data.specification as DeliverableSpecification,evidence:{id,name:row.original_name,status,facts}});const committed=await db.rpc('apollo_commit_evidence_specification_v2',{p_conversation_id:conversationId,p_expected_version:expectedVersion,p_specification:merged.specification,p_content_hash:createHash('sha256').update(JSON.stringify(merged.specification)).digest('hex'),p_readiness:merged.readiness,p_status:merged.specification.approval.status});if(!committed.error)return NextResponse.json({id,name:row.original_name,status:merged.effectiveStatus,facts,specification:merged.specification,specification_version:Number(committed.data),readiness:merged.readiness},{status:201});if(committed.error.code!=='40001')return NextResponse.json({error:committed.error.message},{status:500})}
  return NextResponse.json({error:'Mission evidence changed concurrently. The accepted file remains in custody; retry synchronization.'},{status:409})
}
