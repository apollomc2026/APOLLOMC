import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

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
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function POST() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true }, { headers: CORS })
}
