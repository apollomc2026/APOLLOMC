import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { appUrl } from '@/lib/app-origin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect(appUrl('/login?error=missing_code'))
  }
  const supabase = await createServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(
      appUrl(`/login?error=${encodeURIComponent(error.message)}`)
    )
  }
  return NextResponse.redirect(appUrl('/dashboard'))
}
