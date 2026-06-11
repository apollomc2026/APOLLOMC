import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { deleteFromS3 } from '@/lib/s3/client'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const UPLOADS_BUCKET = 'apollo-uploads'

export async function OPTIONS(request: Request) {
  return preflight(request)
}

// HS5.1: account-level "delete all my data". Removes the caller's uploaded
// files (Supabase Storage objects + apollo_uploads rows) and generated
// submissions (S3 output objects + apollo_submissions rows). Best-effort per
// object; returns a summary. Auth + allowlist required; only ever touches the
// caller's own rows (scoped by user_id). Note: deletes the primary S3 output
// object (s3_key); residual prefix-level objects under s3_prefix are a known
// follow-up (flagged in the hardening report).
export async function DELETE(request: Request) {
  const cors = corsHeaders(request)
  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
  }
  const userId = auth.user.userId
  const supabase = await createServiceClient()
  const summary = { uploads_deleted: 0, submissions_deleted: 0, storage_errors: 0 }

  // 1) Uploads — remove storage objects, then the rows.
  const { data: uploads } = await supabase
    .from('apollo_uploads')
    .select('id, storage_path')
    .eq('user_id', userId)
  const paths = ((uploads ?? []) as Array<{ storage_path: string | null }>)
    .map((u) => u.storage_path)
    .filter((p): p is string => !!p)
  if (paths.length) {
    const rm = await supabase.storage.from(UPLOADS_BUCKET).remove(paths)
    if (rm.error) summary.storage_errors += 1
  }
  const delUploads = await supabase.from('apollo_uploads').delete().eq('user_id', userId).select('id')
  summary.uploads_deleted = delUploads.data?.length ?? 0

  // 2) Submissions — delete S3 output objects, then the rows.
  const { data: subs } = await supabase
    .from('apollo_submissions')
    .select('id, s3_key')
    .eq('user_id', userId)
  for (const s of (subs ?? []) as Array<{ s3_key: string | null }>) {
    if (s.s3_key) {
      try {
        await deleteFromS3(s.s3_key)
      } catch {
        summary.storage_errors += 1
      }
    }
  }
  const delSubs = await supabase.from('apollo_submissions').delete().eq('user_id', userId).select('id')
  summary.submissions_deleted = delSubs.data?.length ?? 0

  // 3) Audit the deletion itself.
  try {
    await supabase.from('events').insert({
      user_id: userId,
      event_type: 'account_data_deleted',
      event_data: summary,
    })
  } catch {}

  return NextResponse.json({ ok: true, ...summary }, { headers: cors })
}
