import { NextResponse } from 'next/server'
import { listTemplates } from '@/lib/apollo/templates'
import { corsHeaders, preflight, requireApiKey } from '@/lib/apollo/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(request: Request) {
  const unauth = requireApiKey(request)
  if (unauth) return unauth

  const templates = await listTemplates()
  const summary = templates.map((t) => ({
    slug: t.slug,
    label: t.label,
    description: t.description,
    category: t.category,
    supports_images: t.supports_images,
  }))
  return NextResponse.json({ templates: summary }, { headers: corsHeaders(request) })
}
