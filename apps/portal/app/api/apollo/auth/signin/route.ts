import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: 'https://portal.apollomc.ai/api/apollo/auth/callback',
    },
  })

  if (error || !data?.url) {
    return NextResponse.redirect('https://apollomc.ai/apollo/?error=oauth_init_failed')
  }
  return NextResponse.redirect(data.url)
}
