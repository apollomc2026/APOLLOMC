import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  if (!code) {
    return NextResponse.redirect('https://apollomc.ai/apollo/?error=missing_code')
  }
  const supabase = await createServerClient()
  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(
      `https://apollomc.ai/apollo/?error=${encodeURIComponent(error.message)}`
    )
  }
  return NextResponse.redirect('https://apollomc.ai/apollo/')
}
