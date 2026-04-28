import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { listTemplates } from '@/lib/apollo/templates'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { regeneratePdfDownloadUrl, computeFileExpiresAt } from '@/lib/apollo/storage'

// Single-submission detail endpoint. Used by /apollo/mission.html?id=<id>.
// Fetches the row scoped to the requesting user, regenerates a fresh
// signed URL from the stored s3_key, and surfaces the same shape the
// list endpoint returns (one row instead of an array).
//
// Without this endpoint, mission.html called a non-existent route and
// the browser's CORS preflight failed → "Failed to fetch" in the UI.

export const dynamic = 'force-dynamic'

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
  try {
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
      .from('apollo_submissions')
      .select(
        'id, template_slug, brand_slug, status, created_at, completed_at, download_url, s3_key, error_message, inputs, image_count, user_email'
      )
      .eq('id', id)
      .eq('user_id', auth.user.userId)
      .maybeSingle()

    if (error) {
      return NextResponse.json(
        { error: 'submission lookup failed: ' + error.message },
        { status: 500, headers: cors }
      )
    }
    if (!data) {
      return NextResponse.json({ error: 'submission not found' }, { status: 404, headers: cors })
    }

    type Row = {
      id: string
      template_slug: string
      brand_slug: string
      status: string
      created_at: string
      completed_at: string | null
      download_url: string | null
      s3_key: string | null
      error_message: string | null
      inputs: Record<string, unknown> | null
      image_count: number | null
      user_email: string | null
    }
    const r = data as Row

    // Look up the template label so the detail page can render
    // "Engagement Letter" instead of "engagement-letter".
    let templateLabel = r.template_slug
    try {
      const templates = await listTemplates()
      const t = templates.find((x) => x.slug === r.template_slug)
      if (t?.label) templateLabel = t.label
    } catch {
      // Templates loader hiccup is non-fatal — the slug is fine to display.
    }

    // Regenerate a fresh signed URL from s3_key. Fall back to the
    // persisted download_url for legacy rows that pre-date the S3
    // migration (drive_file_url shape).
    let download_url: string | null = null
    if (r.s3_key) {
      try {
        const filename = r.s3_key.split('/').pop() || r.template_slug + '.pdf'
        download_url = await regeneratePdfDownloadUrl(r.s3_key, filename)
      } catch (err) {
        console.error(
          '[apollo/submissions/[id]] re-sign failed for ' + r.id + ': ' +
            (err instanceof Error ? err.message : String(err))
        )
        download_url = r.download_url
      }
    } else {
      download_url = r.download_url
    }

    const submission = {
      id: r.id,
      template_slug: r.template_slug,
      template_label: templateLabel,
      brand_slug: r.brand_slug,
      status: r.status,
      created_at: r.created_at,
      completed_at: r.completed_at,
      download_url,
      pdf_url: download_url,
      expires_at: computeFileExpiresAt(r.completed_at),
      error_message: r.error_message,
      inputs: r.inputs,
      image_count: r.image_count ?? 0,
      user_email: r.user_email,
    }

    return NextResponse.json({ submission }, { headers: cors })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[apollo/submissions/[id]] failure', err)
    return NextResponse.json(
      { error: 'submission detail load failed: ' + message },
      { status: 500, headers: cors }
    )
  }
}
