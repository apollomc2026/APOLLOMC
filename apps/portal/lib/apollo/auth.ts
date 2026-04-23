import { createServerClient } from '@/lib/supabase/server'

export type AuthedUser = {
  userId: string
  email: string
  name: string | null
  avatar: string | null
}

export type AuthResult =
  | { ok: true; user: AuthedUser }
  | { ok: false; status: 401 | 403; error: string }

function allowlist(): string[] {
  return (process.env.APOLLO_ALLOWED_EMAILS || '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
}

export async function requireAllowedUser(): Promise<AuthResult> {
  const supabase = await createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user || !user.email) {
    return { ok: false, status: 401, error: 'Not authenticated' }
  }

  const allowed = allowlist()
  if (!allowed.includes(user.email.toLowerCase())) {
    return { ok: false, status: 403, error: 'Not authorized — email not on allowlist' }
  }

  return {
    ok: true,
    user: {
      userId: user.id,
      email: user.email,
      name: (user.user_metadata?.full_name as string) || null,
      avatar: (user.user_metadata?.avatar_url as string) || null,
    },
  }
}

export async function getCurrentUser(): Promise<{
  authenticated: boolean
  authorized: boolean
  email: string | null
  name: string | null
  avatar: string | null
}> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user?.email) {
    return { authenticated: false, authorized: false, email: null, name: null, avatar: null }
  }

  const allowed = allowlist()
  const authorized = allowed.includes(user.email.toLowerCase())

  return {
    authenticated: true,
    authorized,
    email: user.email,
    name: (user.user_metadata?.full_name as string) || null,
    avatar: (user.user_metadata?.avatar_url as string) || null,
  }
}
