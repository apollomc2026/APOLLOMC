import { createServiceClient } from '@/lib/supabase/server'
import { failStaleAcceptedJob, failStaleExecutionJob } from './ledger'

export const STALE_ACCEPTED_JOB_MINUTES=15
export const STALE_EXECUTION_JOB_MINUTES=60
type Candidate={id:string}
type Dependencies={
  listAccepted:(cutoff:string,limit:number)=>Promise<Candidate[]>
  failAccepted:(jobId:string,cutoff:string)=>Promise<boolean>
  listExecutions:(cutoff:string,limit:number)=>Promise<Candidate[]>
  failExecution:(jobId:string,cutoff:string)=>Promise<boolean>
}

async function listStaleAccepted(cutoff:string,limit:number):Promise<Candidate[]>{
  const db=await createServiceClient()
  const result=await db.from('apollo_document_jobs').select('id')
    .eq('state','accepted').is('workflow_run_id',null).lt('created_at',cutoff)
    .order('created_at',{ascending:true}).limit(limit)
  if(result.error)throw new Error(result.error.message)
  return (result.data??[]).filter((row):row is Candidate=>typeof row.id==='string')
}

async function listStaleExecutions(cutoff:string,limit:number):Promise<Candidate[]>{
  const db=await createServiceClient()
  const result=await db.from('apollo_document_jobs').select('id')
    .in('state',['queued','validating','generating','verifying','rendering','delivering'])
    .lt('updated_at',cutoff).order('updated_at',{ascending:true}).limit(limit)
  if(result.error)throw new Error(result.error.message)
  return (result.data??[]).filter((row):row is Candidate=>typeof row.id==='string')
}

const productionDependencies:Dependencies={
  listAccepted:listStaleAccepted,
  failAccepted:failStaleAcceptedJob,
  listExecutions:listStaleExecutions,
  failExecution:failStaleExecutionJob,
}

/**
 * Closes the insert-before-workflow crash window. The unique idempotency key
 * prevents a second execution; this reconciler makes the stranded first
 * execution visible and recoverable instead of leaving it silently accepted.
 */
export async function reconcileStaleLaunches(input:{limit?:number;now?:Date}={},dependencies:Dependencies=productionDependencies){
  const limit=Math.max(1,Math.min(50,input.limit??20))
  const now=input.now??new Date()
  const acceptedCutoff=new Date(now.getTime()-STALE_ACCEPTED_JOB_MINUTES*60_000).toISOString()
  const executionCutoff=new Date(now.getTime()-STALE_EXECUTION_JOB_MINUTES*60_000).toISOString()
  const [accepted,executions]=await Promise.all([
    dependencies.listAccepted(acceptedCutoff,limit),
    dependencies.listExecutions(executionCutoff,limit),
  ])
  const failed:string[]=[]
  for(const candidate of accepted){
    if(await dependencies.failAccepted(candidate.id,acceptedCutoff))failed.push(candidate.id)
  }
  for(const candidate of executions){
    if(await dependencies.failExecution(candidate.id,executionCutoff))failed.push(candidate.id)
  }
  return {cutoff:acceptedCutoff,accepted_cutoff:acceptedCutoff,execution_cutoff:executionCutoff,checked:accepted.length+executions.length,failed:failed.length,job_ids:failed}
}
