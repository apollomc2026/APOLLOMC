import { missionCompleteEmail, sendEmail } from '@/lib/email/ses'
import { createServiceClient } from '@/lib/supabase/server'
import type { ArtifactManifest } from './contracts'

export async function sendCompletionNotification(jobId: string) {
  const db = await createServiceClient()
  const claim = await db
    .from('apollo_document_jobs')
    .update({
      completion_email_status: 'sending',
      completion_email_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('state', 'delivered')
    .in('completion_email_status', ['pending', 'failed'])
    .select('id,conversation_id,requested_by,artifacts')
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
    if (!artifact?.web_view_url) throw new Error('Delivered artifact URL is unavailable')

    await sendEmail({
      to: profile.data.email,
      ...missionCompleteEmail(
        artifact.title || 'document',
        claim.data.conversation_id,
        artifact.web_view_url,
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
