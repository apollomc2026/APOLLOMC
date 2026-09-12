import type { ArtifactManifest, DocumentWorkOrder, JobState } from '@/lib/executor/contracts'
import { assertNotCancelled, completeJob, getJob, updateJob } from '@/lib/executor/ledger'
import { generateStructuredDocument, renderAndStorePdf } from '@/lib/executor/pipeline'
import { verifyFinancialDocument } from '@/lib/executor/financial-verification'
import { GoogleDriveAuthorizationError } from '@/lib/executor/google-drive'
import { sendCompletionNotification } from '@/lib/executor/completion-notification'

export async function documentJobWorkflow(order: DocumentWorkOrder): Promise<{ artifacts: ArtifactManifest[] }> {
  'use workflow'
  try {
    await checkpoint(order, 'gathering-input', 10, 'Validating inputs and retrieving sources')
    const generated = await generateStep(order)
    await verifyStep(order, generated.contentHtml, generated.quality)
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
    }
    throw error
  }
}

async function renderStep(order: DocumentWorkOrder, contentHtml: string, output: Record<string, unknown>) {
  'use step'
  console.log(`[apollo-document] rendering START job=${order.work_order_id}`)
  await assertNotCancelled(order.work_order_id)
  await updateJob(order.work_order_id, 'rendering', 70, 'Rendering and storing PDF draft')
  try {
    const artifact = await renderAndStorePdf(order, contentHtml, output)
    console.log(`[apollo-document] rendering DONE job=${order.work_order_id}`)
    return artifact
  } catch (error) {
    if (error instanceof GoogleDriveAuthorizationError) {
      await updateJob(order.work_order_id, 'blocked', 75, 'Google Drive must be reconnected in Settings', {
        error_code: error.code,
        missing_inputs: ['google_drive_connection'],
      })
    }
    throw error
  }
}

async function verifyStep(order: DocumentWorkOrder, contentHtml: string, quality: { score:number; archetype:string; metrics:Record<string,number>; warnings:string[] }): Promise<void> {
  'use step'
  console.log(`[apollo-document] validating START job=${order.work_order_id}`)
  await assertNotCancelled(order.work_order_id)
  const financial = verifyFinancialDocument(order, contentHtml)
  const message = financial.required
    ? `Schema, workmanship, and deterministic financial verification passed (${financial.verified_values} values/checks)`
    : `Structured document passed schema and workmanship validation (${quality.score}/100)`
  await updateJob(order.work_order_id, 'validating', 60, message, { checkpoint_ref: `${order.work_order_id}:validating`, financial_verification: financial, workmanship: quality })
  console.log(`[apollo-document] validating DONE job=${order.work_order_id}`)
}

async function finishStep(order: DocumentWorkOrder, artifacts: ArtifactManifest[]): Promise<void> {
  'use step'
  await assertNotCancelled(order.work_order_id)
  await completeJob(order.work_order_id, artifacts)
  const notification = await sendCompletionNotification(order.work_order_id)
  console.log(`[apollo-document] completion notification job=${order.work_order_id} sent=${notification.sent}${notification.reason ? ` reason=${notification.reason}` : ''}`)
}

async function failureStep(order: DocumentWorkOrder, errorMessage: string): Promise<void> {
  'use step'
  const job = await getJob(order.work_order_id)
  if (!job || ['blocked', 'cancelled', 'delivered'].includes(String(job.state))) return
  const message = errorMessage.slice(0, 2000)
  await updateJob(order.work_order_id, 'failed', Number(job.progress_percent ?? 0), 'Document workflow failed safely', { error_code: 'WORKFLOW_FAILED', error_message: message })
}
