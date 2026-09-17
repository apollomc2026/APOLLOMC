import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { sendCompletionNotification } from '@/lib/executor/completion-notification'
import { sendFailureNotification } from '@/lib/executor/failure-notification'
import { getOwnedJob } from '@/lib/executor/ledger'

export async function POST(request: Request) {
  if (process.env.PLAYWRIGHT_TESTING === 'true')
    return NextResponse.json({ sent: false, reason: 'test-fixture' })
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const body = (await request.json().catch(() => null)) as { job_id?: string } | null
  if (!body?.job_id) return NextResponse.json({ error: 'Job id is required' }, { status: 400 })
  const job = await getOwnedJob(body.job_id,allowed.user.userId)
  if (!job)
    return NextResponse.json({ error: 'Document job was not found' }, { status: 404 })
  if (!['delivered', 'failed'].includes(String(job.state)))
    return NextResponse.json({ error: 'Only terminal delivered or failed jobs can issue notifications' }, { status: 409 })
  const result = job.state === 'delivered'
    ? await sendCompletionNotification(body.job_id)
    : await sendFailureNotification(body.job_id)
  return NextResponse.json(result)
}
