import { NextResponse } from 'next/server'
import { verifyExecutorRequest } from '@/lib/executor/auth'
import { getJob } from '@/lib/executor/ledger'

export const dynamic = 'force-dynamic'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  let auth
  try { auth = verifyExecutorRequest(request, '') } catch { return NextResponse.json({ error: 'executor authentication is unavailable' }, { status: 503 }) }
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })
  const { id } = await context.params
  const job = await getJob(id)
  if (!job) return NextResponse.json({ error: 'job not found' }, { status: 404 })
  return NextResponse.json({
    job_id: job.id,
    state: job.state,
    progress_percent: job.progress_percent,
    message: job.status_message,
    retry_count: job.retry_count,
    checkpoint_ref: job.checkpoint_ref,
    missing_inputs: job.missing_inputs,
    artifacts: job.artifacts,
    cancel_requested_at: job.cancel_requested_at,
    created_at: job.created_at,
    updated_at: job.updated_at,
    completed_at: job.completed_at,
  })
}
