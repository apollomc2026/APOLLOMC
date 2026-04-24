import { NextResponse } from 'next/server'
import { loadTemplate } from '@/lib/apollo/templates'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'

export const dynamic = 'force-dynamic'

const SLUG_PATTERN = /^[a-z0-9-]+$/

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cors = corsHeaders(request)

  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
  }

  const { slug } = await params
  if (!slug || !SLUG_PATTERN.test(slug) || slug.includes('..') || slug.includes('/')) {
    return NextResponse.json({ error: 'invalid slug' }, { status: 400, headers: cors })
  }

  const template = await loadTemplate(slug)
  if (!template) {
    return NextResponse.json({ error: 'not found' }, { status: 404, headers: cors })
  }

  return NextResponse.json({ template }, { headers: cors })
}
