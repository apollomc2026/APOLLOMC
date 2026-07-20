import { NextResponse } from 'next/server'
import { verifyExecutorRequest } from '@/lib/executor/auth'
import { getJob, requestCancellation } from '@/lib/executor/ledger'

export const dynamic = 'force-dynamic'

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const raw = await request.text()
  let auth
  try { auth = verifyExecutorRequest(request, raw) } catch { return NextResponse.json({ error: 'executor authentication is unavailable' }, { status: 503 }) }
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })
  const { id } = await context.params
  const existing = await getJob(id)
  if (!existing) return NextResponse.json({ error: 'job not found' }, { status: 404 })
  if (['delivered', 'failed', 'cancelled'].includes(existing.state as string)) {
    return NextResponse.json({ job_id: id, state: existing.state, cancellation_requested: false })
  }
  const job = await requestCancellation(id)
  return NextResponse.json({ job_id: id, state: job.state, cancellation_requested: true })
}
