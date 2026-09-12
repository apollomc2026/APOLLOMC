import { failedEmail, sendEmail } from '@/lib/email/ses'
import { createServiceClient } from '@/lib/supabase/server'

export async function sendFailureNotification(jobId: string) {
  const db = await createServiceClient()
  const claim = await db
    .from('apollo_document_jobs')
    .update({
      failure_email_status: 'sending',
      failure_email_error: null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .eq('state', 'failed')
    .in('failure_email_status', ['pending', 'failed'])
    .select('id,conversation_id,requested_by,deliverable_type')
    .maybeSingle()

  if (claim.error) throw new Error(claim.error.message)
  if (!claim.data) return { sent: false, reason: 'already-claimed-or-not-failed' }

  try {
    const profile = await db
      .from('profiles')
      .select('email')
      .eq('id', claim.data.requested_by)
      .single()
    if (profile.error || !profile.data?.email)
      throw new Error(profile.error?.message ?? 'Mission owner email is unavailable')

    const deliverableName = String(claim.data.deliverable_type || 'document').replace(/-/g, ' ')
    await sendEmail({
      to: profile.data.email,
      ...failedEmail(deliverableName, claim.data.conversation_id),
    })
    const recorded = await db
      .from('apollo_document_jobs')
      .update({
        failure_email_status: 'sent',
        failure_email_sent_at: new Date().toISOString(),
        failure_email_error: null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('failure_email_status', 'sending')
    if (recorded.error) throw new Error(recorded.error.message)
    return { sent: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    await db
      .from('apollo_document_jobs')
      .update({
        failure_email_status: 'failed',
        failure_email_error: message.slice(0, 2000),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('failure_email_status', 'sending')
    return { sent: false, reason: message }
  }
}
