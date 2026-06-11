import { createServiceClient } from '@/lib/supabase/server'

// HS4.1: Supabase-backed fixed-window rate limiter. Atomic increment via the
// `apollo_rate_limit_hit` RPC (SQL provided to Jon in the hardening report).
//
// Degradation: if the RPC/table is absent (SQL not yet applied) it FAILS OPEN
// so the app keeps working — the limiter is dormant until Jon runs the SQL.
// Once the table exists, it fails CLOSED on the limit (the cost/abuse control).
export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<{ ok: boolean; count: number }> {
  try {
    const supabase = await createServiceClient()
    const bucket = Math.floor(Date.now() / 1000 / windowSeconds) * windowSeconds
    const windowStart = new Date(bucket * 1000).toISOString()
    const { data, error } = await supabase.rpc('apollo_rate_limit_hit', {
      p_key: key,
      p_window_start: windowStart,
      p_limit: limit,
    })
    if (error || !data) return { ok: true, count: 0 } // dormant until SQL applied
    const row = Array.isArray(data) ? data[0] : data
    return { ok: !!row?.allowed, count: Number(row?.current_count ?? 0) }
  } catch {
    return { ok: true, count: 0 }
  }
}

// Best-effort client IP from the standard proxy headers (Vercel sets these).
export function clientIp(req: Request): string {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}
