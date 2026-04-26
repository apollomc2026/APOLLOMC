import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'

// Per-upload endpoints.
//   GET    → returns the full row plus a fresh 1-hour signed URL.
//   DELETE → removes the storage object and the DB row, but only if the
//            upload is not yet linked to a submission. Submissions own
//            their attached uploads — those are cleaned up with the
//            submission, not piecemeal.

export const dynamic = 'force-dynamic'

const BUCKET = 'apollo-uploads'
const SIGNED_URL_TTL_SECONDS = 60 * 60 // 1 hour

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cors = corsHeaders(request)
  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
  }

  const { id } = await params
  if (!id || !UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400, headers: cors })
  }

  const supabase = await createServiceClient()
  const { data, error } = await supabase
    .from('apollo_uploads')
    .select(
      'id, upload_kind, original_filename, content_type, size_bytes, caption, width, height, storage_path, created_at, submission_id, user_id'
    )
    .eq('id', id)
    .eq('user_id', auth.user.userId)
    .maybeSingle()

  if (error) {
    return NextResponse.json(
      { error: 'lookup failed: ' + error.message },
      { status: 500, headers: cors }
    )
  }
  if (!data) {
    return NextResponse.json({ error: 'not found' }, { status: 404, headers: cors })
  }

  const signed = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(data.storage_path, SIGNED_URL_TTL_SECONDS)
  const signedUrl = signed.data?.signedUrl ?? null

  return NextResponse.json(
    {
      upload: {
        id: data.id,
        upload_kind: data.upload_kind,
        original_filename: data.original_filename,
        content_type: data.content_type,
        size_bytes: data.size_bytes,
        caption: data.caption,
        width: data.width,
        height: data.height,
        created_at: data.created_at,
        submission_id: data.submission_id,
        signed_url: signedUrl,
        signed_url_expires_at: signedUrl
          ? new Date(Date.now() + SIGNED_URL_TTL_SECONDS * 1000).toISOString()
          : null,
      },
    },
    { headers: cors }
  )
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const cors = corsHeaders(request)
  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
  }

  const { id } = await params
  if (!id || !UUID_PATTERN.test(id)) {
    return NextResponse.json({ error: 'invalid id' }, { status: 400, headers: cors })
  }

  const supabase = await createServiceClient()

  // Look up first so we can (a) check ownership, (b) refuse if linked to
  // a submission, and (c) know the storage path to remove.
  const lookup = await supabase
    .from('apollo_uploads')
    .select('id, user_id, submission_id, storage_path')
    .eq('id', id)
    .eq('user_id', auth.user.userId)
    .maybeSingle()

  if (lookup.error) {
    return NextResponse.json(
      { error: 'lookup failed: ' + lookup.error.message },
      { status: 500, headers: cors }
    )
  }
  if (!lookup.data) {
    return NextResponse.json({ error: 'not found' }, { status: 404, headers: cors })
  }
  if (lookup.data.submission_id) {
    return NextResponse.json(
      {
        error:
          'upload is linked to a submission and cannot be deleted directly',
      },
      { status: 409, headers: cors }
    )
  }

  // Try storage first. If storage removal fails we keep the DB row so the
  // file isn't orphaned silently — the caller can retry.
  let storageError: string | null = null
  try {
    const remove = await supabase.storage.from(BUCKET).remove([lookup.data.storage_path])
    if (remove.error) storageError = remove.error.message
  } catch (e) {
    storageError = e instanceof Error ? e.message : String(e)
  }

  if (storageError) {
    return NextResponse.json(
      {
        error: 'storage delete failed: ' + storageError,
        partial: true,
      },
      { status: 500, headers: cors }
    )
  }

  const del = await supabase.from('apollo_uploads').delete().eq('id', id)
  if (del.error) {
    return NextResponse.json(
      { error: 'db delete failed: ' + del.error.message, partial: true },
      { status: 500, headers: cors }
    )
  }

  return NextResponse.json({ deleted: true, id }, { headers: cors })
}
