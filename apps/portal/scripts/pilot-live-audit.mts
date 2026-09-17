import { createClient } from '@supabase/supabase-js'
import { auditPilotRelease, type PilotAuditInput } from '../lib/mission-control/pilot-readiness'

function failAudit(error:unknown):void {
  const message=error instanceof Error?error.message:typeof error==='object'&&error&&'message' in error?String(error.message):String(error)
  let serialized=''
  try{serialized=JSON.stringify(error)}catch{}
  const raw=`${message}\n${serialized}`
  const status=raw.match(/\b(?:error code |status(?: code)?[=: ]+)(\d{3})\b/i)?.[1]
  const timeout=/connection timed out|gateway timeout|\b522\b|\b504\b/i.test(raw)
  console.error(`Live pilot audit failed: ${timeout?'Supabase origin timeout':status?`upstream HTTP ${status}`:'unexpected Supabase response'}. No data was changed.`)
  process.exitCode=1
}
process.once('uncaughtException',failAudit)
process.once('unhandledRejection',failAudit)

const url=process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey=process.env.SUPABASE_SERVICE_ROLE_KEY
if(!url||!serviceRoleKey)throw new Error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')

const boundedFetch:typeof fetch=(input,init)=>fetch(input,{...init,signal:AbortSignal.timeout(30_000)})
const db=createClient(url,serviceRoleKey,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:boundedFetch}})
const inventory=await db.from('apollo_conversations').select('user_id')
if(inventory.error)throw inventory.error
const owners=[...new Set((inventory.data??[]).map(row=>row.user_id).filter((value):value is string=>Boolean(value)))]
const requestedUserId=process.env.APOLLO_PILOT_USER_ID?.trim()
const userId=requestedUserId||(owners.length===1?owners[0]:'')
if(!userId)throw new Error(`APOLLO_PILOT_USER_ID is required when the mission ledger has ${owners.length} owners`)
if(!owners.includes(userId))throw new Error('APOLLO_PILOT_USER_ID does not own an APOLLO mission')

const conversations=await db.from('apollo_conversations').select('id,status,readiness,current_spec_version,created_at,updated_at').eq('user_id',userId)
if(conversations.error)throw conversations.error
const ids=(conversations.data??[]).map(row=>row.id)
if(!ids.length){console.log(JSON.stringify(auditPilotRelease({conversations:[],specifications:[],evidence:[],jobs:[],events:[]}),null,2));process.exit(0)}

const [specifications,evidence,jobs]=await Promise.all([
  db.from('apollo_specification_versions').select('id,conversation_id,version,status,content_hash,specification').in('conversation_id',ids),
  db.from('apollo_conversation_evidence').select('id,conversation_id,extraction_status,content_sha256,retrieval_sha256,extracted_facts,extraction_trace').eq('user_id',userId).in('conversation_id',ids),
  db.from('apollo_document_jobs').select('id,conversation_id,deliverable_type,state,progress_percent,work_order,artifacts,error_code,completion_email_status,failure_email_status,created_at,completed_at').eq('requested_by',userId).in('conversation_id',ids),
])
const queryError=specifications.error??evidence.error??jobs.error
if(queryError)throw queryError
const jobIds=(jobs.data??[]).map(row=>row.id)
const events=jobIds.length?await db.from('apollo_document_job_events').select('job_id,sequence,state,payload').in('job_id',jobIds):{data:[],error:null}
if(events.error)throw events.error

const report=auditPilotRelease({
  conversations:conversations.data,
  specifications:specifications.data??[],
  evidence:evidence.data??[],
  jobs:jobs.data??[],
  events:events.data??[],
} as PilotAuditInput)
console.log(JSON.stringify(report,null,2))
