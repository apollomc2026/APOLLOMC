import { createServiceClient } from '@/lib/supabase/server'
import { sendCompletionNotification } from './completion-notification'
import { sendFailureNotification } from './failure-notification'

export const DEFAULT_NOTIFICATION_RECONCILIATION_SINCE = '2026-09-14T00:00:00.000Z'
type Candidate = { id:string; state:'delivered'|'failed'|'blocked' }
type Dependencies = {
  list:(since:string,userId:string|undefined,limit:number)=>Promise<Candidate[]>
  complete:(jobId:string)=>Promise<{sent:boolean;reason?:string}>
  fail:(jobId:string)=>Promise<{sent:boolean;reason?:string}>
}

function reconciliationSince() {
  const configured=process.env.NOTIFICATION_RECONCILIATION_SINCE?.trim()
  return configured && Number.isFinite(Date.parse(configured)) ? new Date(configured).toISOString() : DEFAULT_NOTIFICATION_RECONCILIATION_SINCE
}

async function listCandidates(since:string,userId:string|undefined,limit:number):Promise<Candidate[]> {
  const db=await createServiceClient()
  let query=db.from('apollo_document_jobs').select('id,state').gte('created_at',since)
    .or('and(state.eq.delivered,completion_email_status.neq.sent),and(state.in.(failed,blocked),failure_email_status.neq.sent)')
    .order('created_at',{ ascending:true }).limit(limit)
  if (userId) query=query.eq('requested_by',userId)
  const result=await query
  if (result.error) throw new Error(result.error.message)
  return (result.data??[]).filter((row):row is Candidate=>typeof row.id==='string'&&(row.state==='delivered'||row.state==='failed'||row.state==='blocked'))
}

const productionDependencies:Dependencies={ list:listCandidates, complete:sendCompletionNotification, fail:sendFailureNotification }

export async function reconcileTerminalNotifications(input:{userId?:string;limit?:number}={},dependencies:Dependencies=productionDependencies) {
  const limit=Math.max(1,Math.min(50,input.limit??20))
  const since=reconciliationSince()
  const candidates=await dependencies.list(since,input.userId,limit)
  const results=[]
  for (const candidate of candidates) {
    const result=candidate.state==='delivered' ? await dependencies.complete(candidate.id) : await dependencies.fail(candidate.id)
    results.push({ job_id:candidate.id, state:candidate.state, sent:result.sent, reason:result.reason })
  }
  return { since, checked:candidates.length, sent:results.filter(result=>result.sent).length, results }
}
