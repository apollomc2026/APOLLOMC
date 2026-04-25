import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { listTemplates } from '@/lib/apollo/templates'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'

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

  // Page of results (scoped to user, optionally brand), recent first
  let listQuery = supabase
    .from('apollo_submissions')
    .select(
      'id, template_slug, brand_slug, status, created_at, completed_at, download_url, error_message'
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
    error_message: string | null
  }

  const submissions = (rows as Row[] | null ?? []).map((r) => ({
    id: r.id,
    template_slug: r.template_slug,
    template_label: labelBySlug[r.template_slug] ?? r.template_slug,
    brand_slug: r.brand_slug,
    status: r.status,
    created_at: r.created_at,
    completed_at: r.completed_at,
    pdf_url: r.download_url,
    error_message: r.error_message,
  }))

  return NextResponse.json(
    { submissions, total_count: totalCount ?? submissions.length },
    { headers: cors }
  )
}
