import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { listTemplates } from '@/lib/apollo/templates'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { regeneratePdfDownloadUrl, computeFileExpiresAt } from '@/lib/apollo/storage'

// Mission Log endpoint — returns the authenticated user's recent
// submissions ordered most-recent-first, with template label joined in
// from the on-disk templates so the dashboard can show "NDA" instead of
// "nda". Used by the Mission Control intake page.

export const dynamic = 'force-dynamic'

const DEFAULT_LIMIT = 10
const MAX_LIMIT = 50

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(request: Request) {
  const cors = corsHeaders(request)
  try {
    const auth = await requireAllowedUser()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
    }

    const url = new URL(request.url)
    const limitRaw = url.searchParams.get('limit')
    const brand = url.searchParams.get('brand')

    let limit = DEFAULT_LIMIT
    if (limitRaw !== null) {
      const parsed = Number.parseInt(limitRaw, 10)
      if (!Number.isFinite(parsed) || parsed < 1) {
        return NextResponse.json({ error: 'invalid limit' }, { status: 400, headers: cors })
      }
      limit = Math.min(parsed, MAX_LIMIT)
    }

    // Build a slug → label map from the on-disk templates so the dashboard
    // can render human-readable names without a separate fetch.
    const templates = await listTemplates()
    const labelBySlug: Record<string, string> = {}
    for (const t of templates) labelBySlug[t.slug] = t.label

    const supabase = await createServiceClient()

    // Total count (scoped to user, optionally brand)
    let countQuery = supabase
      .from('apollo_submissions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', auth.user.userId)
    if (brand) countQuery = countQuery.eq('brand_slug', brand)
    const { count: totalCount, error: countErr } = await countQuery
    if (countErr) {
      return NextResponse.json(
        { error: `failed to count submissions: ${countErr.message}` },
        { status: 500, headers: cors }
      )
    }

    // Page of results (scoped to user, optionally brand), recent first.
    // We pull s3_key so we can regenerate signed URLs at request time;
    // the persisted download_url is read as a legacy fallback for any
    // pre-S3 row that still has a drive_file_url shape.
    let listQuery = supabase
      .from('apollo_submissions')
      .select(
        'id, template_slug, brand_slug, status, created_at, completed_at, download_url, s3_key, error_message'
      )
      .eq('user_id', auth.user.userId)
      .order('created_at', { ascending: false })
      .limit(limit)
    if (brand) listQuery = listQuery.eq('brand_slug', brand)
    const { data: rows, error: listErr } = await listQuery
    if (listErr) {
      return NextResponse.json(
        { error: `failed to list submissions: ${listErr.message}` },
        { status: 500, headers: cors }
      )
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
    }

    // Regenerate fresh signed URLs from s3_key in parallel. The DB's
    // download_url column is treated as legacy and only used when the
    // row has no s3_key (pre-migration drive_file_url rows).
    const submissions = await Promise.all(
      (rows as Row[] | null ?? []).map(async (r) => {
        let download_url: string | null = null
        if (r.s3_key) {
          try {
            const filename = r.s3_key.split('/').pop() || r.template_slug + '.pdf'
            download_url = await regeneratePdfDownloadUrl(r.s3_key, filename)
          } catch (err) {
            // Re-signing failed (transient AWS error / bad credentials).
            // Fall back to the persisted column rather than break the list.
            console.error(
              '[apollo/submissions] re-sign failed for ' + r.id + ': ' +
                (err instanceof Error ? err.message : String(err))
            )
            download_url = r.download_url
          }
        } else {
          download_url = r.download_url
        }
        return {
          id: r.id,
          template_slug: r.template_slug,
          template_label: labelBySlug[r.template_slug] ?? r.template_slug,
          brand_slug: r.brand_slug,
          status: r.status,
          created_at: r.created_at,
          completed_at: r.completed_at,
          download_url,
          pdf_url: download_url,
          expires_at: computeFileExpiresAt(r.completed_at),
          error_message: r.error_message,
        }
      })
    )

    return NextResponse.json(
      { submissions, total_count: totalCount ?? submissions.length },
      { headers: cors }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[apollo/submissions] failure', err)
    return NextResponse.json(
      { error: 'submissions load failed: ' + message },
      { status: 500, headers: cors }
    )
  }
}
