import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// Daily Supabase keep-alive. Vercel Cron pings this once a day so the
// free-tier Apollo project (yarbyhyomuimetsppsrz) registers DB activity and
// never auto-pauses. The 2026-06-11 504 on /api/apollo/auth/me was caused by
// ~24 days of inactivity pausing the project; this is the permanent prevention.
//
// Vercel Cron sends: Authorization: Bearer ${CRON_SECRET}

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 })
  }

  try {
    const supabase = await createServiceClient()
    // Lightest possible query that still registers as DB activity:
    // head-only exact count, capped at one row. Mirrors the proven pattern
    // in app/api/apollo/submissions/route.ts.
    const { error } = await supabase
      .from('apollo_submissions')
      .select('id', { head: true, count: 'exact' })
      .limit(1)

    if (error) throw error
    return NextResponse.json({ ok: true, pinged_at: new Date().toISOString() })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[apollo/keepalive] ping failed:', message)
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
