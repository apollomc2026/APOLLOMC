import { after, NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { reconcileTerminalNotifications } from '@/lib/executor/notification-reconciler'

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
  const service = await createServiceClient()
  const jobs = await service.from('apollo_document_jobs').select('id,conversation_id,deliverable_type,state,progress_percent,status_message,artifacts,created_at').eq('requested_by', auth.user.userId).order('created_at', { ascending:false })
  if (jobs.error) return NextResponse.json({ error:jobs.error.message }, { status:500 })
  const jobsByMission = new Map<string, typeof jobs.data>()
  for (const job of jobs.data ?? []) jobsByMission.set(job.conversation_id, [...(jobsByMission.get(job.conversation_id) ?? []), job])
  const missions = (conversations.data ?? []).map(mission => {
    const missionJobs = jobsByMission.get(mission.id) ?? []
    const normalizedJobs = missionJobs.map(job => ({ id:job.id, deliverable_type:job.deliverable_type, state:job.state, progress_percent:job.progress_percent, message:job.status_message, artifacts:job.artifacts ?? [], created_at:job.created_at }))
    const authoritativeType=normalizedJobs[0]?.deliverable_type
    const authoritativeTitle=authoritativeType?String(authoritativeType).split('-').map((part:string)=>part.charAt(0).toUpperCase()+part.slice(1)).join(' '):mission.title
    return { ...mission, title:authoritativeTitle, job:normalizedJobs[0] ?? null, jobs:normalizedJobs }
  })
  const allJobs = missions.flatMap(mission => mission.jobs)
  const delivered = allJobs.filter(job => job.state === 'delivered').length
  const failed = allJobs.filter(job => ['failed','blocked','cancelled'].includes(job.state)).length
  const active = allJobs.filter(job => !['delivered','failed','blocked','cancelled'].includes(job.state)).length + missions.filter(mission => mission.status !== 'archived' && mission.jobs.length === 0).length
  const averageProgress = missions.length ? Math.round(missions.reduce((sum,mission) => sum + (mission.job?.progress_percent ?? mission.readiness), 0) / missions.length) : 0
  after(() => reconcileTerminalNotifications({ userId:auth.user.userId, limit:5 }).catch(error => console.error('[apollo-notifications] reconciliation failed', error instanceof Error ? error.message : 'unknown error')))
  return NextResponse.json(
    { missions, metrics:{ total:missions.length, active, delivered, failed, average_progress:averageProgress } },
    { headers:{ 'Cache-Control':'private, no-store, max-age=0' } },
  )
}
