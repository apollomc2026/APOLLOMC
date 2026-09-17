import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/apollo/auth'
import { corsHeaders, preflight } from '@/lib/apollo/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request:Request) { return preflight(request) }

export async function GET(request:Request) {
  const headers=corsHeaders(request)
  const current = await getCurrentUser()
  if (!current.authenticated) {
    return NextResponse.json({ authenticated: false }, { headers })
  }
  return NextResponse.json(
    {
      authenticated: true,
      authorized: current.authorized,
      email: current.email,
      name: current.name,
      avatar: current.avatar,
    },
    { headers }
  )
}
