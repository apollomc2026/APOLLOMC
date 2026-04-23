import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/apollo/auth'

export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': 'https://apollomc.ai',
  'Access-Control-Allow-Credentials': 'true',
  Vary: 'Origin',
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...CORS,
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function GET() {
  const current = await getCurrentUser()
  if (!current.authenticated) {
    return NextResponse.json({ authenticated: false }, { headers: CORS })
  }
  return NextResponse.json(
    {
      authenticated: true,
      authorized: current.authorized,
      email: current.email,
      name: current.name,
      avatar: current.avatar,
    },
    { headers: CORS }
  )
}
