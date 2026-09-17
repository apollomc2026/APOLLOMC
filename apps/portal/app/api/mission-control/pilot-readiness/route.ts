import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createServiceClient } from '@/lib/supabase/server'
import { auditPilotRelease } from '@/lib/mission-control/pilot-readiness'
import type { DeliverableSpecification } from '@/lib/mission-control/contracts'
import type { ArtifactManifest, DocumentWorkOrder } from '@/lib/executor/contracts'

export const dynamic='force-dynamic'

export async function GET(){
  const auth=await requireAllowedUser();if(!auth.ok)return NextResponse.json({error:auth.error},{status:auth.status})
  const db=await createServiceClient()
  const conversations=await db.from('apollo_conversations').select('id,status,readiness,current_spec_version,updated_at').eq('user_id',auth.user.userId)
  if(conversations.error)return NextResponse.json({error:conversations.error.message},{status:500})
  const ids=(conversations.data??[]).map(row=>row.id)
  if(!ids.length)return NextResponse.json(auditPilotRelease({conversations:[],specifications:[],evidence:[],jobs:[],events:[]}),{headers:{'Cache-Control':'private, no-store'}})
  const [specifications,evidence,jobs]=await Promise.all([
    db.from('apollo_specification_versions').select('id,conversation_id,version,status,content_hash,specification').in('conversation_id',ids),
    db.from('apollo_conversation_evidence').select('id,conversation_id,extraction_status,content_sha256,retrieval_sha256,extracted_facts,extraction_trace').eq('user_id',auth.user.userId).in('conversation_id',ids),
    db.from('apollo_document_jobs').select('id,conversation_id,deliverable_type,state,progress_percent,work_order,artifacts,error_code,completion_email_status,failure_email_status,created_at,completed_at').eq('requested_by',auth.user.userId).in('conversation_id',ids),
  ])
  const error=specifications.error??evidence.error??jobs.error;if(error)return NextResponse.json({error:error.message},{status:500})
  const jobIds=(jobs.data??[]).map(row=>row.id)
  const events=jobIds.length?await db.from('apollo_document_job_events').select('job_id,sequence,state,payload').in('job_id',jobIds):{data:[],error:null}
  if(events.error)return NextResponse.json({error:events.error.message},{status:500})
  const report=auditPilotRelease({
    conversations:conversations.data,
    specifications:(specifications.data??[]).map(row=>({...row,specification:row.specification as DeliverableSpecification})),
    evidence:(evidence.data??[]).map(row=>({...row,extracted_facts:(Array.isArray(row.extracted_facts)?row.extracted_facts:[]) as import('@/lib/mission-control/contracts').MissionFact[]})),
    jobs:(jobs.data??[]).map(row=>({...row,work_order:row.work_order as DocumentWorkOrder,artifacts:(row.artifacts??[]) as ArtifactManifest[]})),
    events:(events.data??[]).map(row=>({...row,payload:(row.payload??{}) as Record<string,unknown>})),
  })
  return NextResponse.json(report,{headers:{'Cache-Control':'private, no-store, max-age=0'}})
}
