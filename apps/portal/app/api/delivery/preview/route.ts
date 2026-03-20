import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getPresignedUrl } from '@/lib/s3/client'

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (!key) {
    return NextResponse.json({ error: 'Missing key' }, { status: 400 })
  }

  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const url = await getPresignedUrl(key, 300)
  return NextResponse.json({ url })
}
