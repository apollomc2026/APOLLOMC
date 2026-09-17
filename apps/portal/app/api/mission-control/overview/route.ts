import { after, NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { reconcileTerminalNotifications } from '@/lib/executor/notification-reconciler'
import { projectControlledArtifacts } from '@/lib/executor/artifact-access'
import type { ArtifactManifest } from '@/lib/executor/contracts'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import { jobMatchesCurrentSpecification, type CurrentSpecificationIdentity } from '@/lib/mission-control/telemetry-authority'
import { flightDisplayIdentity, missionDisplayIdentity } from '@/lib/mission-control/display-identity'
import type { DeliverableSpecification } from '@/lib/mission-control/contracts'

export const dynamic = 'force-dynamic'

const fixture = {
  missions: [
    { id:'mission-demo', title:'Field Operations Proposal', status:'submitted', readiness:100, current_spec_version:3, updated_at:'2026-09-06T12:00:00.000Z', job:{ id:'job-reflight', state:'delivered', progress_percent:100, message:'Document deliverables are ready', artifacts:[{ title:'Field Operations Proposal', storage_file_id:'drive-reflight', web_view_url:'#reflight', version:2 }] }, jobs:[{ id:'job-reflight', state:'delivered', progress_percent:100, message:'Document deliverables are ready', artifacts:[{ title:'Field Operations Proposal', storage_file_id:'drive-reflight', web_view_url:'#reflight', version:2 }], created_at:'2026-09-06T13:00:00.000Z' },{ id:'job-demo', state:'delivered', progress_percent:100, message:'Document deliverables are ready', artifacts:[{ title:'Field Operations Proposal', storage_file_id:'drive-launch', web_view_url:'#launch', version:1 }], created_at:'2026-09-06T12:00:00.000Z' }] },
    { id:'mission-active', title:'Site Inspection Report', status:'calibrating', readiness:62, current_spec_version:2, updated_at:'2026-09-06T11:00:00.000Z', job:null, jobs:[] },
  ],
  metrics:{ total:2, active:1, delivered:2, failed:0, average_progress:81 },
}

export async function GET() {
  if (process.env.PLAYWRIGHT_TESTING === 'true') return NextResponse.json(fixture)
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error:auth.error }, { status:auth.status })
  const db = await createClient()
  const conversations = await db.from('apollo_conversations').select('id,title,status,readiness,current_spec_version,updated_at').eq('user_id', auth.user.userId).order('updated_at', { ascending:false })
  if (conversations.error) return NextResponse.json({ error:conversations.error.message }, { status:500 })
  const specificationCatalog = conversations.data?.length
    ? await serviceSpecificationCatalog(conversations.data.map(mission => mission.id), auth.user.userId)
    : { current:new Map<string,CurrentSpecificationIdentity>(), byId:new Map<string,DeliverableSpecification>() }
  const service = await createServiceClient()
  const jobs = await service.from('apollo_document_jobs').select('id,conversation_id,deliverable_type,state,progress_percent,status_message,artifacts,work_order,created_at').eq('requested_by', auth.user.userId).order('created_at', { ascending:false })
  if (jobs.error) return NextResponse.json({ error:jobs.error.message }, { status:500 })
  const jobsByMission = new Map<string, typeof jobs.data>()
  for (const job of jobs.data ?? []) jobsByMission.set(job.conversation_id, [...(jobsByMission.get(job.conversation_id) ?? []), job])
  const missions = (conversations.data ?? []).map(mission => {
    const missionJobs = jobsByMission.get(mission.id) ?? []
    const identity=specificationCatalog.current.get(mission.id)
    const normalizedJobs = missionJobs.map((job,index) => {
      const workOrder=job.work_order as DocumentWorkOrder|null
      const approvedSpecification=workOrder?.trace?.specification_id?specificationCatalog.byId.get(workOrder.trace.specification_id):undefined
      const flightSpecification=approvedSpecification??identity?.specification
      const flight=flightSpecification?flightDisplayIdentity({specification:flightSpecification,workOrder,sequence:missionJobs.length-index}):null
      return { id:job.id, deliverable_type:job.deliverable_type, state:job.state, progress_percent:job.progress_percent, message:job.status_message, artifacts:projectControlledArtifacts(job.id,((job.artifacts??[]) as ArtifactManifest[])), created_at:job.created_at, is_current_specification:jobMatchesCurrentSpecification({deliverable_type:job.deliverable_type,work_order:workOrder},identity), flight_name:flight?.flightName??null, flight_label:flight?.flightLabel??null, flight_purpose:flight?.purpose??null, revision_of:typeof workOrder?.fields?.revision_of==='string'?workOrder.fields.revision_of:null }
    })
    return { ...mission, title:identity?.display_title ?? identity?.title ?? mission.title, base_title:identity?.title ?? mission.title, mission_context:identity?.display_context ?? '', deliverable_type:identity?.deliverable_type ?? null, activity_at:missionJobs[0]?.created_at??mission.updated_at, job:normalizedJobs.find(job=>job.is_current_specification) ?? null, jobs:normalizedJobs }
  }).sort((left,right)=>new Date(right.activity_at).getTime()-new Date(left.activity_at).getTime())
  const allJobs = missions.flatMap(mission => mission.jobs)
  const metricMissions=missions.filter(mission=>mission.status!=='archived'||mission.jobs.length>0)
  const delivered = allJobs.filter(job => job.state === 'delivered').length
  const failed = allJobs.filter(job => ['failed','blocked','cancelled'].includes(job.state)).length
  const active = allJobs.filter(job => !['delivered','failed','blocked','cancelled'].includes(job.state)).length + missions.filter(mission => mission.status !== 'archived' && !mission.jobs.some(job=>!['delivered','failed','blocked','cancelled'].includes(job.state)) && !mission.job).length
  const averageProgress = metricMissions.length ? Math.round(metricMissions.reduce((sum,mission) => sum + (mission.job?.progress_percent ?? mission.readiness), 0) / metricMissions.length) : 0
  after(() => reconcileTerminalNotifications({ userId:auth.user.userId, limit:5 }).catch(error => console.error('[apollo-notifications] reconciliation failed', error instanceof Error ? error.message : 'unknown error')))
  return NextResponse.json(
    { missions, metrics:{ total:metricMissions.length, active, delivered, failed, average_progress:averageProgress } },
    { headers:{ 'Cache-Control':'private, no-store, max-age=0' } },
  )
}

async function serviceSpecificationCatalog(conversationIds:string[],userId:string) {
  const service=await createServiceClient()
  const rows=await service.from('apollo_specification_versions').select('id,conversation_id,version,content_hash,specification,apollo_conversations!inner(user_id,current_spec_version)').in('conversation_id',conversationIds).eq('apollo_conversations.user_id',userId)
  if(rows.error) throw new Error(rows.error.message)
  const identities=new Map<string,CurrentSpecificationIdentity>()
  const byId=new Map<string,DeliverableSpecification>()
  for(const row of rows.data ?? []){
    const specification=row.specification as DeliverableSpecification
    byId.set(String(row.id),specification)
    const owner=Array.isArray(row.apollo_conversations)?row.apollo_conversations[0]:row.apollo_conversations
    const currentVersion=Number((owner as {current_spec_version?:number}|null)?.current_spec_version)
    const version=(row as {version?:number}).version
    if(Number(version)!==currentVersion)continue
    const title=specification.mission?.title?.trim()
    const deliverableType=specification.artifact?.recommended_type?.trim()
    if(title&&deliverableType){
      const display=missionDisplayIdentity(specification)
      identities.set(String(row.conversation_id),{specification_id:String(row.id),specification_hash:String(row.content_hash),version:currentVersion,title,deliverable_type:deliverableType,display_title:display.displayTitle,display_context:display.context,specification})
    }
  }
  return {current:identities,byId}
}
