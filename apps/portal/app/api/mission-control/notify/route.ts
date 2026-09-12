import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { sendCompletionNotification } from '@/lib/executor/completion-notification'
import { getJob } from '@/lib/executor/ledger'

export async function POST(request: Request) {
  if (process.env.PLAYWRIGHT_TESTING === 'true')
    return NextResponse.json({ sent: false, reason: 'test-fixture' })
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const body = (await request.json().catch(() => null)) as { job_id?: string } | null
  if (!body?.job_id) return NextResponse.json({ error: 'Job id is required' }, { status: 400 })
  const job = await getJob(body.job_id)
  if (!job || job.requested_by !== allowed.user.userId)
    return NextResponse.json({ error: 'Document job was not found' }, { status: 404 })
  if (job.state !== 'delivered')
    return NextResponse.json({ error: 'Only delivered jobs can issue completion notifications' }, { status: 409 })
  const result = await sendCompletionNotification(body.job_id)
  return NextResponse.json(result)
}
