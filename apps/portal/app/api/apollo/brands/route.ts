import { NextResponse } from 'next/server'
import { listBrands } from '@/lib/apollo/brands'
import { corsHeaders, preflight, requireApiKey } from '@/lib/apollo/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(request: Request) {
  const unauth = requireApiKey(request)
  if (unauth) return unauth

  const brands = await listBrands()
  const summary = brands.map((b) => ({
    slug: b.slug,
    label: b.label,
    logo_url: b.logo_path,
  }))
  summary.push({ slug: 'other', label: 'Other', logo_url: null })
  return NextResponse.json({ brands: summary }, { headers: corsHeaders(request) })
}
