import { createServerClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { appUrl } from '@/lib/app-origin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: appUrl('/api/apollo/auth/callback'),
    },
  })

  if (error || !data?.url) {
    return NextResponse.redirect(appUrl('/login?error=oauth_init_failed'))
  }
  return NextResponse.redirect(data.url)
}
