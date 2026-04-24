import { NextResponse } from 'next/server'
import { listPlacements } from '@/lib/apollo/logo-placement'
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
  return NextResponse.json({ placements: listPlacements() }, { headers: cors })
}
