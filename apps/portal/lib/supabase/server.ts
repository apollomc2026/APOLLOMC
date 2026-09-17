import { createServerClient as createSsrServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

// APOLLO's application and API are same-origin at app.apollomc.ai. Keep auth
// cookies host-only so sibling projects/subdomains cannot receive them.
const PROD_COOKIE_OPTIONS = {
  sameSite: 'lax' as const,
  secure: true,
  path: '/',
}

function resolveCookieOptions(supplied: Record<string, unknown> | undefined) {
  if (process.env.NODE_ENV === 'production') {
    return { ...(supplied || {}), ...PROD_COOKIE_OPTIONS }
  }
  // Local dev: keep whatever the lib sent; ensure path: '/' so cookies apply app-wide.
  return { ...(supplied || {}), path: (supplied as { path?: string } | undefined)?.path ?? '/' }
}

export async function createClient() {
  const cookieStore = await cookies()

  return createSsrServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, resolveCookieOptions(options as Record<string, unknown> | undefined))
            )
          } catch {
            // setAll called from a Server Component; ignored — middleware will refresh.
          }
        },
      },
    }
  )
}

// Alias for callers that use `createServerClient` naming (matches the @supabase/ssr convention
// and what downstream specs import).
export const createServerClient = createClient

export async function createServiceClient() {
  const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}
