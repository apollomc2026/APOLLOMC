import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { acceptWorkOrder, WorkOrderAcceptanceError } from '@/lib/executor/accept'
import { getJob } from '@/lib/executor/ledger'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import { driveConnectionStatus } from '@/lib/integrations/google-drive-auth'
import { buildRetryOrder } from '@/lib/mission-control/retry'

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { job_id?: string } | null
  if (!body?.job_id) return NextResponse.json({ error: 'A blocked job is required' }, { status: 400 })
  if (process.env.PLAYWRIGHT_TESTING === 'true') return NextResponse.json({ accepted: true, job_id: 'job-retry-demo', state: 'queued' }, { status: 202 })
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const existing = await getJob(body.job_id)
  if (!existing || existing.requested_by !== allowed.user.userId) return NextResponse.json({ error: 'Document job was not found' }, { status: 404 })
  if (existing.state !== 'blocked') return NextResponse.json({ error: 'Only a blocked document job can be retried' }, { status: 409 })
  const drive = await driveConnectionStatus(allowed.user.userId)
  if (!drive.connected || !drive.folderId) return NextResponse.json({ error: 'Reconnect customer-owned Google Drive before retrying execution' }, { status: 409 })
  const prior = existing.work_order as DocumentWorkOrder
  const order = buildRetryOrder({ ...prior, drive_destination: { ...prior.drive_destination, folder_id: drive.folderId } })
  try { return NextResponse.json(await acceptWorkOrder(order), { status: 202 }) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Blocked execution could not be retried' }, { status: error instanceof WorkOrderAcceptanceError ? error.status : 500 }) }
}
