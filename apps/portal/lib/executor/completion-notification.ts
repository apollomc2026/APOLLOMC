import { missionCompleteEmail, sendEmail } from '@/lib/email/ses'
import { createServiceClient } from '@/lib/supabase/server'
import { findDeliverable } from '@/lib/apollo/packages-loader'
import type { ArtifactManifest, DocumentWorkOrder } from './contracts'
import { controlledArtifactUrl } from './artifact-access'

export function artifactMatchesNotificationAuthority(artifact:ArtifactManifest,order:DocumentWorkOrder){
  return artifact.project_id===order.project_id
    &&artifact.conversation_id===order.conversation_id
    &&artifact.task_id===order.task_id
    &&artifact.source_run_id===order.work_order_id
    &&artifact.deliverable_type===order.deliverable_type
    &&artifact.brand_id===order.brand_id
    &&artifact.style_id===order.style_id
    &&artifact.specification_id===order.trace?.specification_id
    &&artifact.specification_hash===order.trace?.specification_hash
}

export async function sendCompletionNotification(jobId: string) {
  const db = await createServiceClient()
  const staleBefore = new Date(Date.now() - 10 * 60_000).toISOString()
  const claim = await db
    .from('apollo_document_jobs')
    .update({
      completion_email_status: 'sending',
      completion_email_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('state', 'delivered')
    .or(`completion_email_status.in.(pending,failed),and(completion_email_status.eq.sending,updated_at.lt.${staleBefore})`)
    .select('id,conversation_id,requested_by,artifacts,work_order')
    .maybeSingle()

  if (claim.error) throw new Error(claim.error.message)
  if (!claim.data) return { sent: false, reason: 'already-claimed-or-not-delivered' }

  try {
    const profile = await db
      .from('profiles')
      .select('email')
      .eq('id', claim.data.requested_by)
      .single()
    if (profile.error || !profile.data?.email)
      throw new Error(profile.error?.message ?? 'Mission owner email is unavailable')

    const artifacts = (claim.data.artifacts as ArtifactManifest[] | null) ?? []
    const artifact = artifacts[0]
    if (!artifact?.storage_file_id) throw new Error('Delivered artifact is unavailable')
    const workOrder=claim.data.work_order as DocumentWorkOrder|null
    if(!workOrder||!artifactMatchesNotificationAuthority(artifact,workOrder))throw new Error('Delivered artifact authority does not match the approved work order')
    const deliverableName=findDeliverable(workOrder.deliverable_type)?.label||workOrder.deliverable_type.replace(/-/g,' ')

    await sendEmail({
      to: profile.data.email,
      ...missionCompleteEmail(
        deliverableName,
        claim.data.conversation_id,
        controlledArtifactUrl(jobId),
      ),
    })
    const recorded = await db
      .from('apollo_document_jobs')
      .update({
        completion_email_status: 'sent',
        completion_email_sent_at: new Date().toISOString(),
        completion_email_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('completion_email_status', 'sending')
    if (recorded.error) throw new Error(recorded.error.message)
    return { sent: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await db
      .from('apollo_document_jobs')
      .update({
        completion_email_status: 'failed',
        completion_email_error: message.slice(0, 2000),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('completion_email_status', 'sending')
    return { sent: false, reason: message }
  }
}
