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

const APOLLO_BOOTSTRAP_EMAILS = ['support@apollomc.ai', 'jsargent124@gmail.com'] as const

function allowlist(configured = process.env.APOLLO_ALLOWED_EMAILS || ''): string[] {
  return [...new Set([...APOLLO_BOOTSTRAP_EMAILS, ...configured
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)])]
}

export function isAllowedApolloEmail(email: string, configured?: string): boolean {
  return allowlist(configured).includes(email.trim().toLowerCase())
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

  if (!isAllowedApolloEmail(user.email)) {
    return { ok: false, status: 403, error: `Signed in as ${user.email}, but this exact identity is not authorized for APOLLO` }
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

  const authorized = isAllowedApolloEmail(user.email)

  return {
    authenticated: true,
    authorized,
    email: user.email,
    name: (user.user_metadata?.full_name as string) || null,
    avatar: (user.user_metadata?.avatar_url as string) || null,
  }
}
