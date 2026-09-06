import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { acceptWorkOrder, WorkOrderAcceptanceError } from '@/lib/executor/accept'
import { getJob } from '@/lib/executor/ledger'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import { buildRevisionOrder } from '@/lib/mission-control/revision'

export async function POST(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  let body: { job_id?: string; instruction?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  const instruction = body.instruction?.trim()
  if (!body.job_id || !instruction || instruction.length > 4000) return NextResponse.json({ error: 'A job and revision instruction are required' }, { status: 400 })
  const existing = await getJob(body.job_id)
  if (!existing || existing.requested_by !== allowed.user.userId) return NextResponse.json({ error: 'Document job was not found' }, { status: 404 })
  if (existing.state !== 'delivered') return NextResponse.json({ error: 'Only a delivered draft can be revised' }, { status: 409 })
  const prior = existing.work_order as DocumentWorkOrder
  const order = buildRevisionOrder(prior, instruction)
  try { return NextResponse.json(await acceptWorkOrder(order), { status: 202 }) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Revision could not be accepted' }, { status: error instanceof WorkOrderAcceptanceError ? error.status : 500 }) }
}
