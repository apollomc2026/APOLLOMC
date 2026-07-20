import { NextResponse } from 'next/server'
import { start } from 'workflow/api'
import { documentJobWorkflow } from '@/workflows/document-job'
import { assertAllowedCallbackUrl } from '@/lib/executor/callback'
import { parseWorkOrder } from '@/lib/executor/contracts'
import { verifyExecutorRequest } from '@/lib/executor/auth'
import { createJob, setWorkflowRun, updateJob } from '@/lib/executor/ledger'
import { findDeliverable } from '@/lib/apollo/packages-loader'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: Request) {
  const raw = await request.text()
  let auth
  try { auth = verifyExecutorRequest(request, raw) } catch { return NextResponse.json({ error: 'executor authentication is unavailable' }, { status: 503 }) }
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })
  let order
  try {
    order = parseWorkOrder(JSON.parse(raw))
    assertAllowedCallbackUrl(order.callback_url)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'invalid work order' }, { status: 400 })
  }
  if (order.sensitivity === 'restricted') return NextResponse.json({ error: 'restricted work orders are not supported' }, { status: 422 })
  if (order.formats.some((format) => format !== 'pdf')) return NextResponse.json({ error: 'this executor version supports PDF only' }, { status: 422 })
  if (!findDeliverable(order.deliverable_type)) return NextResponse.json({ error: 'unknown deliverable_type' }, { status: 422 })

  try {
    const created = await createJob(order)
    const existing = created.job as Record<string, unknown>
    if (created.duplicate) {
      return NextResponse.json(jobAccepted(existing), { status: 202 })
    }
    try {
      const run = await start(documentJobWorkflow, [order])
      await setWorkflowRun(order.work_order_id, run.runId)
      return NextResponse.json(jobAccepted({ ...existing, workflow_run_id: run.runId, state: 'queued' }), { status: 202 })
    } catch (error) {
      await updateJob(order.work_order_id, 'failed', 0, 'Workflow failed to start', { error_code: 'WORKFLOW_START_FAILED', error_message: error instanceof Error ? error.message : String(error) })
      throw error
    }
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'job acceptance failed' }, { status: 500 })
  }
}

function jobAccepted(job: Record<string, unknown>) {
  const id = String(job.id)
  return {
    accepted: true,
    job_id: id,
    state: job.state,
    workflow_run_id: job.workflow_run_id ?? null,
    status_url: `/api/v1/document-jobs/${id}`,
    cancellation_url: `/api/v1/document-jobs/${id}/cancel`,
  }
}
