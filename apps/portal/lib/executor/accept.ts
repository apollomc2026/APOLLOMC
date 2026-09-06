import { start } from 'workflow/api'
import { documentJobWorkflow } from '@/workflows/document-job'
import { findDeliverable } from '@/lib/apollo/packages-loader'
import { googleDriveConfigured } from './google-drive'
import { createJob, setWorkflowRun, updateJob } from './ledger'
import type { DocumentWorkOrder } from './contracts'

export class WorkOrderAcceptanceError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

export async function acceptWorkOrder(order: DocumentWorkOrder) {
  if (order.sensitivity === 'restricted') throw new WorkOrderAcceptanceError('restricted work orders are not supported', 422)
  if (order.formats.some(format => format !== 'pdf')) throw new WorkOrderAcceptanceError('this executor version supports PDF only', 422)
  if (!findDeliverable(order.deliverable_type)) throw new WorkOrderAcceptanceError('unknown deliverable_type', 422)
  if (!googleDriveConfigured()) throw new WorkOrderAcceptanceError('Google Drive artifact custody is unavailable', 503)
  const created = await createJob(order)
  const existing = created.job as Record<string, unknown>
  if (created.duplicate) return jobAccepted(existing)
  try {
    const run = await start(documentJobWorkflow, [order])
    await setWorkflowRun(order.work_order_id, run.runId)
    return jobAccepted({ ...existing, workflow_run_id: run.runId, state: 'queued' })
  } catch (error) {
    await updateJob(order.work_order_id, 'failed', 0, 'Workflow failed to start', { error_code: 'WORKFLOW_START_FAILED', error_message: error instanceof Error ? error.message : String(error) })
    throw error
  }
}

function jobAccepted(job: Record<string, unknown>) {
  const id = String(job.id)
  return { accepted: true, job_id: id, state: job.state, workflow_run_id: job.workflow_run_id ?? null, status_url: `/api/v1/document-jobs/${id}`, cancellation_url: `/api/v1/document-jobs/${id}/cancel` }
}
