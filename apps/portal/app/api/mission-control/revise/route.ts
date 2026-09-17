import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { acceptWorkOrder, WorkOrderAcceptanceError } from '@/lib/executor/accept'
import { getActiveJobForConversation, getOwnedJob } from '@/lib/executor/ledger'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import { buildRevisionOrder } from '@/lib/mission-control/revision'
import { MissionPersistenceError, refreshExecutionEvidence } from '@/lib/mission-control/repository'

export async function POST(request: Request) {
  if (process.env.PLAYWRIGHT_TESTING === 'true') {
    const body = await request.json().catch(() => null) as { job_id?: string; instruction?: string; request_id?:string } | null
    if (!body?.job_id || !body.instruction?.trim()) return NextResponse.json({ error: 'A job and revision instruction are required' }, { status: 400 })
    return NextResponse.json({ job_id: 'job-revision-demo', state: 'accepted', duplicate: false }, { status: 202 })
  }
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  let body: { job_id?: string; instruction?: string; request_id?:string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  const instruction = body.instruction?.trim()
  if (!body.job_id || !instruction || instruction.length > 4000) return NextResponse.json({ error: 'A job and revision instruction are required' }, { status: 400 })
  if(body.request_id&&!/^[0-9a-f]{8}-[0-9a-f-]{27}$/i.test(body.request_id))return NextResponse.json({error:'Revision request identity is invalid'},{status:400})
  const existing = await getOwnedJob(body.job_id,allowed.user.userId)
  if (!existing) return NextResponse.json({ error: 'Document job was not found' }, { status: 404 })
  if (existing.state !== 'delivered') return NextResponse.json({ error: 'Only a delivered draft can be revised' }, { status: 409 })
  const prior = existing.work_order as DocumentWorkOrder
  try {
    const active=await getActiveJobForConversation({conversationId:prior.conversation_id,requestedBy:allowed.user.userId})
    if(active)return NextResponse.json({accepted:true,job_id:String(active.id),state:String(active.state),workflow_run_id:active.workflow_run_id??null,status_url:`/api/v1/document-jobs/${active.id}`,cancellation_url:`/api/v1/document-jobs/${active.id}/cancel`,duplicate:true},{status:202})
    const sources = await refreshExecutionEvidence({ userId: allowed.user.userId, conversationId: prior.conversation_id, expectedSources: prior.sources })
    // A reflight is a revision of the approved work order, not a new approval.
    // Refresh expiring retrieval URLs only; keep its brand and content identity locked.
    // A client-generated request identity makes one button press retry-safe while
    // allowing a later explicit reflight of the same draft and instruction.
    const order = buildRevisionOrder({ ...prior, sources }, instruction,body.request_id)
    return NextResponse.json(await acceptWorkOrder(order), { status: 202 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Revision could not be accepted' }, { status: error instanceof WorkOrderAcceptanceError ? error.status : error instanceof MissionPersistenceError ? 409 : 500 }) }
}
