import { NextResponse } from 'next/server'
import { readBrandLogoBytes } from '@/lib/apollo/brands'
import { corsHeaders, preflight, requireApiKey } from '@/lib/apollo/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const unauth = requireApiKey(request)
  if (unauth) return unauth

  const { slug } = await params
  const logo = await readBrandLogoBytes(slug)
  if (!logo) {
    return NextResponse.json(
      { error: 'not found' },
      { status: 404, headers: corsHeaders(request) }
    )
  }
  return new NextResponse(new Uint8Array(logo.bytes), {
    headers: {
      ...corsHeaders(request),
      'Content-Type': logo.mime,
      'Cache-Control': 'private, max-age=300',
    },
  })
}
