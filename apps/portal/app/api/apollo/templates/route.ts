import { NextResponse } from 'next/server'
import { listTemplates } from '@/lib/apollo/templates'
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

  const templates = await listTemplates()
  const summary = templates.map((t) => ({
    slug: t.slug,
    label: t.label,
    description: t.description,
    category: t.category,
    supports_images: t.supports_images,
  }))
  return NextResponse.json({ templates: summary }, { headers: cors })
}
