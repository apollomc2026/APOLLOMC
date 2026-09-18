import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { isAllowedApolloEmail } from '@/lib/apollo/auth'
import { clientIp, rateLimit } from '@/lib/apollo/ratelimit'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

export async function POST(request: NextRequest) {
  let email = ''
  let token = ''

  try {
    const body = await request.json()
    email = String(body?.email ?? '').trim().toLowerCase()
    token = String(body?.token ?? '').replace(/\D/g, '')
  } catch {
    return NextResponse.json({ error: 'Enter the newest access code from your email.' }, { status: 400, headers: noStore })
  }

  if (!/^\S+@\S+\.\S+$/.test(email) || !/^\d{6,8}$/.test(token)) {
    return NextResponse.json({ error: 'Enter the newest access code from your email.' }, { status: 400, headers: noStore })
  }

  if (!isAllowedApolloEmail(email)) {
    return NextResponse.json({ error: 'This identity is not authorized for APOLLO.' }, { status: 403, headers: noStore })
  }

  const attempt = await rateLimit(`auth-verify:${clientIp(request)}:${email}`, 10, 600)
  if (!attempt.ok) {
    return NextResponse.json({ error: 'Too many verification attempts. Request a new code in ten minutes.' }, { status: 429, headers: noStore })
  }

  const response = NextResponse.json({ authenticated: true, redirectTo: '/dashboard' }, { headers: noStore })
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, {
              ...options,
              path: '/',
              sameSite: 'lax',
              secure: process.env.NODE_ENV === 'production',
            })
          }
        },
      },
    },
  )

  const { data, error } = await supabase.auth.verifyOtp({ email, token, type: 'email' })
  if (error || !data.user?.email) {
    console.warn('[auth/verify-code] OTP verification failed', { email, reason: error?.message ?? 'missing_user' })
    return NextResponse.json({ error: 'That code is invalid or expired. Request a new code and try again.' }, { status: 401, headers: noStore })
  }

  if (!isAllowedApolloEmail(data.user.email)) {
    await supabase.auth.signOut()
    return NextResponse.json({ error: 'This identity is not authorized for APOLLO.' }, { status: 403, headers: noStore })
  }

  console.info('[auth/verify-code] Session established', { email: data.user.email })
  return response
}
