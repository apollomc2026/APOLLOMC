import { NextResponse } from 'next/server'
import { listBrands } from '@/lib/apollo/brands'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(request: Request) {
  const cors = corsHeaders(request)
  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
  }

  const brands = await listBrands()
  const summary = brands.map((b) => ({
    slug: b.slug,
    label: b.label,
    logo_url: b.logo_path,
  }))
  summary.push({ slug: 'other', label: 'Other', logo_url: null })
  return NextResponse.json({ brands: summary }, { headers: cors })
}
