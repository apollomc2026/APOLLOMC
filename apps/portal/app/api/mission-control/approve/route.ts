import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { approveSpecification, loadExecutionEvidence, MissionPersistenceError } from '@/lib/mission-control/repository'
import { compileApprovedSpecification } from '@/lib/mission-control/work-order'
import { acceptWorkOrder, WorkOrderAcceptanceError } from '@/lib/executor/accept'

export async function POST(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  let body: { conversation_id?: string; version?: number }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  if (!body.conversation_id || !Number.isInteger(body.version) || Number(body.version) < 1) return NextResponse.json({ error: 'A conversation and positive specification version are required' }, { status: 400 })
  try {
    const approval = await approveSpecification({ userId: allowed.user.userId, conversationId: body.conversation_id, version: Number(body.version) })
    const callbackUrl = process.env.APOLLO_EXECUTOR_CALLBACK_URL
    const driveFolderId = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID
    if (!callbackUrl || !driveFolderId) return NextResponse.json({ ...approval, execution: { state: 'blocked', missing: ['APOLLO_EXECUTOR_CALLBACK_URL', 'GOOGLE_DRIVE_ROOT_FOLDER_ID'] } })
    const sources = await loadExecutionEvidence({ userId: allowed.user.userId, conversationId: body.conversation_id })
    const compiled = compileApprovedSpecification({ specification: approval.specification, specificationId: approval.specification_id, specificationHash: approval.content_hash, conversationId: body.conversation_id, requestedBy: allowed.user.userId, callbackUrl, driveFolderId, sources })
    if (!compiled.ok) return NextResponse.json({ ...approval, execution: { state: 'blocked', missing: compiled.missing } })
    return NextResponse.json({ ...approval, execution: await acceptWorkOrder(compiled.order) })
  } catch (error) {
    const status = error instanceof MissionPersistenceError ? 409 : error instanceof WorkOrderAcceptanceError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Specification approval failed' }, { status })
  }
}
