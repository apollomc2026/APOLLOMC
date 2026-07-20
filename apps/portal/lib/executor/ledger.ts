import { randomUUID } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/server'
import type { ArtifactManifest, DocumentWorkOrder, JobState } from './contracts'

export async function createJob(order: DocumentWorkOrder) {
  const db = await createServiceClient()
  const row = {
    id: order.work_order_id,
    idempotency_key: order.idempotency_key,
    protocol_version: order.protocol_version,
    project_id: order.project_id,
    conversation_id: order.conversation_id,
    task_id: order.task_id,
    requested_by: order.requested_by,
    capability: order.capability,
    deliverable_type: order.deliverable_type,
    work_order: order,
    state: 'accepted',
    progress_percent: 0,
    status_message: 'Accepted for asynchronous execution',
  }
  const inserted = await db.from('apollo_document_jobs').insert(row).select('*').single()
  if (!inserted.error) {
    await appendEvent(order.work_order_id, 'accepted', 0, 'Accepted for asynchronous execution')
    return { job: inserted.data, duplicate: false }
  }
  if (inserted.error.code !== '23505') throw new Error(inserted.error.message)
  const existing = await db.from('apollo_document_jobs').select('*').eq('idempotency_key', order.idempotency_key).single()
  if (existing.error || !existing.data) throw new Error(existing.error?.message ?? 'idempotent job lookup failed')
  const existingOrder = existing.data.work_order as DocumentWorkOrder
  if (JSON.stringify(existingOrder) !== JSON.stringify(order)) throw new Error('idempotency key reused with a different work order')
  return { job: existing.data, duplicate: true }
}

export async function getJob(jobId: string) {
  const db = await createServiceClient()
  const result = await db.from('apollo_document_jobs').select('*').eq('id', jobId).single()
  if (result.error || !result.data) return null
  return result.data
}

export async function setWorkflowRun(jobId: string, runId: string) {
  const db = await createServiceClient()
  const result = await db.from('apollo_document_jobs').update({ workflow_run_id: runId, state: 'queued', status_message: 'Queued', updated_at: new Date().toISOString() }).eq('id', jobId)
  if (result.error) throw new Error(result.error.message)
  await appendEvent(jobId, 'queued', 1, 'Queued')
}

export async function requestCancellation(jobId: string) {
  const db = await createServiceClient()
  const result = await db.from('apollo_document_jobs').update({ cancel_requested_at: new Date().toISOString(), status_message: 'Cancellation requested', updated_at: new Date().toISOString() }).eq('id', jobId).select('*').single()
  if (result.error) throw new Error(result.error.message)
  return result.data
}

export async function assertNotCancelled(jobId: string) {
  const job = await getJob(jobId)
  if (!job) throw new Error('job not found')
  if (job.cancel_requested_at) {
    await updateJob(jobId, 'cancelled', job.progress_percent as number, 'Cancelled at checkpoint')
    throw new Error('APOLLO_JOB_CANCELLED')
  }
}

export async function updateJob(jobId: string, state: JobState, progress: number, message: string, extra: Record<string, unknown> = {}) {
  const db = await createServiceClient()
  const terminal = ['delivered', 'failed', 'cancelled'].includes(state)
  const result = await db.from('apollo_document_jobs').update({ state, progress_percent: progress, status_message: message, updated_at: new Date().toISOString(), ...(terminal ? { completed_at: new Date().toISOString() } : {}), ...extra }).eq('id', jobId)
  if (result.error) throw new Error(result.error.message)
  await appendEvent(jobId, state, progress, message, extra)
}

export async function completeJob(jobId: string, artifacts: ArtifactManifest[]) {
  if (artifacts.length === 0) throw new Error('delivered jobs require artifacts')
  await updateJob(jobId, 'delivered', 100, 'Document deliverables are ready', { artifacts })
}

async function appendEvent(jobId: string, state: JobState, progress: number, message: string, payload: Record<string, unknown> = {}) {
  const db = await createServiceClient()
  const latest = await db.from('apollo_document_job_events').select('sequence').eq('job_id', jobId).order('sequence', { ascending: false }).limit(1).maybeSingle()
  if (latest.error) throw new Error(latest.error.message)
  const sequence = ((latest.data?.sequence as number | undefined) ?? -1) + 1
  const result = await db.from('apollo_document_job_events').insert({ id: randomUUID(), job_id: jobId, sequence, state, progress_percent: progress, message, payload })
  if (result.error) throw new Error(result.error.message)
}
