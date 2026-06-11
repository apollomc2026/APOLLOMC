import { NextRequest, NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { getPresignedUrl } from '@/lib/s3/client'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  }

  // HS1: was session-only (no allowlist). Now requires an allowlisted session.
  // NOTE (residual): this still mints a presigned URL for any caller-supplied
  // S3 `key` without verifying the key belongs to the caller — a per-key IDOR
  // limited to allowlisted (internal) users. Flagged in the report; should be
  // removed with the missions/review flow or gated by an ownership lookup.
  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const url = await getPresignedUrl(key, 300)
  return NextResponse.json({ url })
}
