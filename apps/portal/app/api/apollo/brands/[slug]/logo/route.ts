import { NextResponse } from 'next/server'
import { readBrandLogoBytes } from '@/lib/apollo/brands'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'

export const dynamic = 'force-dynamic'

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
  const logo = await readBrandLogoBytes(slug)
  if (!logo) {
    return NextResponse.json({ error: 'not found' }, { status: 404, headers: cors })
  }
  return new NextResponse(new Uint8Array(logo.bytes), {
    headers: {
      ...cors,
      'Content-Type': logo.mime,
      'Cache-Control': 'private, max-age=300',
    },
  })
}
