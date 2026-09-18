import {NextResponse} from 'next/server'
import {PILOT_CANARY_SLUGS,runProductionPilotCanary,type PilotCanarySlug} from '@/lib/pilot/production-canary'

export const dynamic='force-dynamic'
export const maxDuration=300

export async function POST(request:Request){
  const secret=process.env.CRON_SECRET?.trim()
  if(!secret||request.headers.get('authorization')!==`Bearer ${secret}`)return NextResponse.json({error:'Unauthorized'},{status:401})
  const slug=new URL(request.url).searchParams.get('slug') as PilotCanarySlug|null
  if(!slug||!PILOT_CANARY_SLUGS.includes(slug))return NextResponse.json({error:'Unsupported pilot class',supported:PILOT_CANARY_SLUGS},{status:400})
  try{return NextResponse.json(await runProductionPilotCanary(slug))}
  catch(error){console.error('[pilot-canary] failed',{slug,error:error instanceof Error?error.message:'unknown error'});return NextResponse.json({slug,passed:false,error:error instanceof Error?error.message:'Pilot canary failed'},{status:500})}
}
