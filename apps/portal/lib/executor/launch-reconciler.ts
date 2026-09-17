import { createServiceClient } from '@/lib/supabase/server'
import { failStaleAcceptedJob } from './ledger'

export const STALE_ACCEPTED_JOB_MINUTES=15
type Candidate={id:string}
type Dependencies={
  list:(cutoff:string,limit:number)=>Promise<Candidate[]>
  fail:(jobId:string,cutoff:string)=>Promise<boolean>
}

async function listStaleAccepted(cutoff:string,limit:number):Promise<Candidate[]>{
  const db=await createServiceClient()
  const result=await db.from('apollo_document_jobs').select('id')
    .eq('state','accepted').is('workflow_run_id',null).lt('created_at',cutoff)
    .order('created_at',{ascending:true}).limit(limit)
  if(result.error)throw new Error(result.error.message)
  return (result.data??[]).filter((row):row is Candidate=>typeof row.id==='string')
}

const productionDependencies:Dependencies={list:listStaleAccepted,fail:failStaleAcceptedJob}

/**
 * Closes the insert-before-workflow crash window. The unique idempotency key
 * prevents a second execution; this reconciler makes the stranded first
 * execution visible and recoverable instead of leaving it silently accepted.
 */
export async function reconcileStaleLaunches(input:{limit?:number;now?:Date}={},dependencies:Dependencies=productionDependencies){
  const limit=Math.max(1,Math.min(50,input.limit??20))
  const now=input.now??new Date()
  const cutoff=new Date(now.getTime()-STALE_ACCEPTED_JOB_MINUTES*60_000).toISOString()
  const candidates=await dependencies.list(cutoff,limit)
  const failed:string[]=[]
  for(const candidate of candidates){
    if(await dependencies.fail(candidate.id,cutoff))failed.push(candidate.id)
  }
  return {cutoff,checked:candidates.length,failed:failed.length,job_ids:failed}
}
