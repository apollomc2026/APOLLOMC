import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { getJob } from '@/lib/executor/ledger'

export async function GET(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Job id is required' }, { status: 400 })
  const job = await getJob(id)
  if (!job || job.requested_by !== allowed.user.userId) return NextResponse.json({ error: 'Document job was not found' }, { status: 404 })
  return NextResponse.json({ job_id: job.id, state: job.state, progress_percent: job.progress_percent, message: job.status_message, missing_inputs: job.missing_inputs, artifacts: job.artifacts })
}
