import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import type { EmailOtpType } from '@supabase/supabase-js'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const { searchParams, origin } = url
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type') as EmailOtpType | null

  // Authorization codes and OTP token hashes are bearer credentials. Never
  // emit either value (or the full callback URL containing them) to runtime
  // logs. Presence-only telemetry is sufficient to diagnose callback shape.
  console.info('[auth/confirm] callback received', {
    hasCode: Boolean(code),
    hasTokenHash: Boolean(tokenHash),
    type: type ?? 'missing',
  })

  if (!code && !tokenHash) {
    console.log('[auth/confirm] EARLY EXIT: no code or token_hash')
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  const cookieStore = await cookies()
  const redirectTo = new URL('/dashboard', origin)
  const response = NextResponse.redirect(redirectTo)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      console.log('[auth/confirm] CODE EXCHANGE ERROR:', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
    console.log('[auth/confirm] CODE EXCHANGE SUCCESS — redirecting to /dashboard')
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
    if (error) {
      console.log('[auth/confirm] OTP ERROR:', error.message)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }
    console.log('[auth/confirm] OTP SUCCESS — redirecting to /dashboard')
  } else {
    console.log('[auth/confirm] EARLY EXIT: token_hash present but type missing')
    return NextResponse.redirect(`${origin}/login?error=auth_failed`)
  }

  return response
}
