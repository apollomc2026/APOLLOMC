import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { corsHeaders, preflight } from '@/lib/apollo/cors'

export const dynamic = 'force-dynamic'

export async function OPTIONS(request:Request) { return preflight(request) }

export async function POST(request:Request) {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  return NextResponse.json({ ok: true }, { headers: corsHeaders(request) })
}
