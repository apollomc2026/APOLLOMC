import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const fixture = {
  missions: [
    { id:'mission-demo', title:'Field Operations Proposal', status:'submitted', readiness:100, current_spec_version:3, updated_at:'2026-09-06T12:00:00.000Z', job:{ id:'job-demo', state:'delivered', progress_percent:100, message:'Document deliverables are ready', artifacts:[{ title:'Field Operations Proposal', web_view_url:'#', version:1 }] } },
    { id:'mission-active', title:'Site Inspection Report', status:'calibrating', readiness:62, current_spec_version:2, updated_at:'2026-09-06T11:00:00.000Z', job:null },
  ],
  metrics:{ total:2, active:1, delivered:1, failed:0, average_readiness:81 },
}

export async function GET() {
  if (process.env.PLAYWRIGHT_TESTING === 'true') return NextResponse.json(fixture)
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error:auth.error }, { status:auth.status })
  const db = await createClient()
  const conversations = await db.from('apollo_conversations').select('id,title,status,readiness,current_spec_version,updated_at').eq('user_id', auth.user.userId).order('updated_at', { ascending:false })
  if (conversations.error) return NextResponse.json({ error:conversations.error.message }, { status:500 })
  const service = await createServiceClient()
  const jobs = await service.from('apollo_document_jobs').select('id,conversation_id,state,progress_percent,status_message,artifacts,created_at').eq('requested_by', auth.user.userId).order('created_at', { ascending:false })
  if (jobs.error) return NextResponse.json({ error:jobs.error.message }, { status:500 })
  const latestJobs = new Map<string, typeof jobs.data[number]>()
  for (const job of jobs.data ?? []) if (!latestJobs.has(job.conversation_id)) latestJobs.set(job.conversation_id, job)
  const missions = (conversations.data ?? []).map(mission => { const job = latestJobs.get(mission.id); return { ...mission, job:job ? { id:job.id, state:job.state, progress_percent:job.progress_percent, message:job.status_message, artifacts:job.artifacts ?? [] } : null } })
  const delivered = (jobs.data ?? []).filter(job => job.state === 'delivered').length
  const failed = (jobs.data ?? []).filter(job => ['failed','blocked','cancelled'].includes(job.state)).length
  return NextResponse.json({ missions, metrics:{ total:missions.length, active:missions.filter(m => !['archived','submitted'].includes(m.status)).length, delivered, failed, average_readiness:missions.length ? Math.round(missions.reduce((sum,m) => sum + m.readiness, 0) / missions.length) : 0 } })
}
