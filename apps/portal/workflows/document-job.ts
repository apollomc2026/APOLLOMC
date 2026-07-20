import { createHash } from 'node:crypto'
import { getStepMetadata } from 'workflow'
import { postCallback } from '@/lib/executor/callback'
import type { ArtifactManifest, DocumentWorkOrder, JobState } from '@/lib/executor/contracts'
import { assertNotCancelled, completeJob, getJob, updateJob } from '@/lib/executor/ledger'
import { generateStructuredDocument, renderAndStorePdf } from '@/lib/executor/pipeline'
import { verifyFinancialDocument } from '@/lib/executor/financial-verification'

export async function documentJobWorkflow(order: DocumentWorkOrder): Promise<{ artifacts: ArtifactManifest[] }> {
  'use workflow'
  try {
    await checkpoint(order, 'gathering-input', 10, 'Validating inputs and retrieving sources')
    const generated = await generateStep(order)
    await verifyStep(order, generated.contentHtml)
    const artifact = await renderStep(order, generated.contentHtml, generated.output)
    await checkpoint(order, 'reviewing', 90, 'Rendered artifact passed file-integrity checks')
    await finishStep(order, [artifact])
    return { artifacts: [artifact] }
  } catch (error) {
    await failureStep(order, error instanceof Error ? error.message : String(error))
    throw error
  }
}

async function checkpoint(order: DocumentWorkOrder, state: JobState, progress: number, message: string): Promise<void> {
  'use step'
  console.log(`[apollo-document] ${state} START job=${order.work_order_id}`)
  await assertNotCancelled(order.work_order_id)
  await updateJob(order.work_order_id, state, progress, message, { checkpoint_ref: `${order.work_order_id}:${state}` })
  await callback(order, state, progress, message, [])
  console.log(`[apollo-document] ${state} DONE job=${order.work_order_id}`)
}

async function generateStep(order: DocumentWorkOrder) {
  'use step'
  console.log(`[apollo-document] generating START job=${order.work_order_id}`)
  await assertNotCancelled(order.work_order_id)
  await updateJob(order.work_order_id, 'generating', 25, 'Generating schema-constrained document')
  try {
    const result = await generateStructuredDocument(order)
    console.log(`[apollo-document] generating DONE job=${order.work_order_id}`)
    return result
  } catch (error) {
    const missing = (error as Error & { missingInputs?: string[] }).missingInputs
    if (missing?.length) {
      await updateJob(order.work_order_id, 'blocked', 20, 'Required document inputs are missing', { missing_inputs: missing })
      await callback(order, 'blocked', 20, 'Required document inputs are missing', [], missing)
    }
    throw error
  }
}

async function renderStep(order: DocumentWorkOrder, contentHtml: string, output: Record<string, unknown>) {
  'use step'
  console.log(`[apollo-document] rendering START job=${order.work_order_id}`)
  await assertNotCancelled(order.work_order_id)
  await updateJob(order.work_order_id, 'rendering', 70, 'Rendering and storing PDF draft')
  const artifact = await renderAndStorePdf(order, contentHtml, output)
  console.log(`[apollo-document] rendering DONE job=${order.work_order_id}`)
  return artifact
}

async function verifyStep(order: DocumentWorkOrder, contentHtml: string): Promise<void> {
  'use step'
  console.log(`[apollo-document] validating START job=${order.work_order_id}`)
  await assertNotCancelled(order.work_order_id)
  const financial = verifyFinancialDocument(order, contentHtml)
  const message = financial.required
    ? `Schema and deterministic financial verification passed (${financial.verified_values} values/checks)`
    : 'Structured document passed schema validation'
  await updateJob(order.work_order_id, 'validating', 60, message, { checkpoint_ref: `${order.work_order_id}:validating`, financial_verification: financial })
  await callback(order, 'validating', 60, message, [])
  console.log(`[apollo-document] validating DONE job=${order.work_order_id}`)
}

async function finishStep(order: DocumentWorkOrder, artifacts: ArtifactManifest[]): Promise<void> {
  'use step'
  await assertNotCancelled(order.work_order_id)
  await completeJob(order.work_order_id, artifacts)
  await callback(order, 'delivered', 100, 'Document deliverables are ready', artifacts)
}

async function failureStep(order: DocumentWorkOrder, errorMessage: string): Promise<void> {
  'use step'
  const job = await getJob(order.work_order_id)
  if (!job || ['blocked', 'cancelled', 'delivered'].includes(String(job.state))) return
  const message = errorMessage.slice(0, 2000)
  await updateJob(order.work_order_id, 'failed', Number(job.progress_percent ?? 0), 'Document workflow failed safely', { error_code: 'WORKFLOW_FAILED', error_message: message })
  await callback(order, 'failed', Number(job.progress_percent ?? 0), 'Document workflow failed safely', [])
}

async function callback(order: DocumentWorkOrder, state: JobState, progress: number, message: string, artifacts: ArtifactManifest[], missingInputs: string[] = []): Promise<void> {
  const metadata = getStepMetadata()
  const eventId = deterministicEventId(order.work_order_id, state, progress)
  await postCallback(order.callback_url, {
    protocol_version: '1.0', event_id: eventId, work_order_id: order.work_order_id,
    executor_id: 'apollo-documents', sequence: progress, state, progress_percent: progress,
    message, retry_count: Math.max(0, metadata.attempt - 1), missing_inputs: missingInputs,
    artifacts, occurred_at: new Date().toISOString(),
  })
}

function deterministicEventId(jobId: string, state: JobState, progress: number): string {
  const hex = createHash('sha256').update(`${jobId}:${state}:${progress}`).digest('hex').slice(0, 32).split('')
  hex[12] = '4'
  hex[16] = '8'
  const raw = hex.join('')
  return `${raw.slice(0, 8)}-${raw.slice(8, 12)}-${raw.slice(12, 16)}-${raw.slice(16, 20)}-${raw.slice(20)}`
}
