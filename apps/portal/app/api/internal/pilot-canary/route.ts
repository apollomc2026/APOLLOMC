import {NextResponse} from 'next/server'
import {PILOT_CANARY_SLUGS,runProductionPilotCanary,type PilotCanarySlug} from '@/lib/pilot/production-canary'
import {OrchestrateError} from '@/lib/apollo/orchestrate'
import {createServiceClient} from '@/lib/supabase/server'
import {randomUUID} from 'node:crypto'

export const dynamic='force-dynamic'
export const maxDuration=300

function authorized(request:Request){
  const secret=process.env.CRON_SECRET?.trim()
  return Boolean(secret&&request.headers.get('authorization')===`Bearer ${secret}`)
}

function deploymentId(){
  return process.env.VERCEL_DEPLOYMENT_ID?.trim()||process.env.VERCEL_GIT_COMMIT_SHA?.trim()||'local-development'
}

export async function GET(request:Request){
  if(!authorized(request))return NextResponse.json({error:'Unauthorized'},{status:401})
  const db=await createServiceClient()
  const rows=await db.from('apollo_pilot_canary_runs').select('id,deliverable_type,deployment_id,status,started_at,completed_at,duration_ms,result,error_stage,error_message').order('started_at',{ascending:false}).limit(120)
  if(rows.error)return NextResponse.json({error:rows.error.message},{status:500})
  const latest=new Map<string,unknown>()
  for(const row of rows.data??[])if(!latest.has(row.deliverable_type))latest.set(row.deliverable_type,row)
  return NextResponse.json({runs:[...latest.values()]},{headers:{'Cache-Control':'private, no-store, max-age=0'}})
}

export async function POST(request:Request){
  if(!authorized(request))return NextResponse.json({error:'Unauthorized'},{status:401})
  const slug=new URL(request.url).searchParams.get('slug') as PilotCanarySlug|null
  if(!slug||!PILOT_CANARY_SLUGS.includes(slug))return NextResponse.json({error:'Unsupported pilot class',supported:PILOT_CANARY_SLUGS},{status:400})
  const db=await createServiceClient();const runId=randomUUID();const started=Date.now()
  const inserted=await db.from('apollo_pilot_canary_runs').insert({id:runId,deliverable_type:slug,deployment_id:deploymentId(),status:'running'}).select('id').single()
  if(inserted.error)return NextResponse.json({slug,passed:false,error:`Pilot attestation could not start: ${inserted.error.message}`},{status:500})
  try{
    const result=await runProductionPilotCanary(slug)
    const completedAt=new Date().toISOString();const durationMs=Date.now()-started
    const update=await db.from('apollo_pilot_canary_runs').update({status:'passed',completed_at:completedAt,duration_ms:durationMs,result}).eq('id',runId).eq('status','running')
    if(update.error)throw new Error(`Pilot passed but its attestation could not be committed: ${update.error.message}`)
    return NextResponse.json({...result,attestation:{id:runId,deployment_id:deploymentId(),duration_ms:durationMs}})
  }
  catch(error){
    const message=error instanceof Error?error.message:'unknown error'
    const stage=error instanceof OrchestrateError?error.stage:null
    console.error('[pilot-canary] failed',{
      slug,
      error:message,
      ...(error instanceof OrchestrateError?{stage,details:error.details}:{}),
    })
    const failureResult=error instanceof OrchestrateError&&error.details&&typeof error.details==='object'?error.details:{}
    const update=await db.from('apollo_pilot_canary_runs').update({status:'failed',completed_at:new Date().toISOString(),duration_ms:Date.now()-started,result:failureResult,error_stage:stage,error_message:message}).eq('id',runId).eq('status','running')
    if(update.error)console.error('[pilot-canary] attestation update failed',{slug,runId,error:update.error.message})
    return NextResponse.json({slug,passed:false,error:message},{status:500})
  }
}
