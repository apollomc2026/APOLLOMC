import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { approveSpecification, loadExecutionEvidence, MissionPersistenceError } from '@/lib/mission-control/repository'
import { compileApprovedSpecification } from '@/lib/mission-control/work-order'
import { acceptWorkOrder, WorkOrderAcceptanceError } from '@/lib/executor/accept'
import { driveConnectionStatus } from '@/lib/integrations/google-drive-auth'

export async function POST(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  let body: { conversation_id?: string; version?: number; unresolved_items_accepted?: unknown }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  if (!body.conversation_id || !Number.isInteger(body.version) || Number(body.version) < 1) return NextResponse.json({ error: 'A conversation and positive specification version are required' }, { status: 400 })
  if (!Array.isArray(body.unresolved_items_accepted) || body.unresolved_items_accepted.some(item => typeof item !== 'string' || !item.trim() || item.length > 500) || body.unresolved_items_accepted.length > 20) return NextResponse.json({ error: 'Accepted unresolved items must be an explicit list of current open decisions' }, { status: 400 })
  const unresolvedItemsAccepted = [...new Set(body.unresolved_items_accepted.map(item => String(item).trim()))]
  try {
    const approval = await approveSpecification({ userId: allowed.user.userId, conversationId: body.conversation_id, version: Number(body.version), unresolvedItemsAccepted })
    const drive = await driveConnectionStatus(allowed.user.userId)
    if (!drive.connected || !drive.folderId) return NextResponse.json({ ...approval, execution: { state: 'blocked', missing: [{ key: 'google_drive', label: 'Customer-owned Google Drive', reason: 'Connect Google Drive before executing this mission.' }] } })
    const sources = await loadExecutionEvidence({ userId: allowed.user.userId, conversationId: body.conversation_id })
    const compiled = compileApprovedSpecification({ specification: approval.specification, specificationId: approval.specification_id, specificationHash: approval.content_hash, conversationId: body.conversation_id, requestedBy: allowed.user.userId, driveFolderId: drive.folderId, sources })
    if (!compiled.ok) return NextResponse.json({ ...approval, execution: { state: 'blocked', missing: compiled.missing } })
    return NextResponse.json({ ...approval, execution: await acceptWorkOrder(compiled.order) })
  } catch (error) {
    const status = error instanceof MissionPersistenceError ? 409 : error instanceof WorkOrderAcceptanceError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Specification approval failed' }, { status })
  }
}
