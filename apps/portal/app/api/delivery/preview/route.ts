import { NextRequest, NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { getPresignedUrl } from '@/lib/s3/client'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const outputId = request.nextUrl.searchParams.get('output')
  if (!outputId) {
    return NextResponse.json({ error: 'Missing output' }, { status: 400 })
  }

  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  // Resolve the storage key through the caller's session-bound Supabase client.
  // The outputs RLS policy joins through mission ownership, so an output from a
  // different user is indistinguishable from a missing output.
  const supabase = await createServerClient()
  const { data: output, error } = await supabase
    .from('outputs')
    .select('s3_key_preview')
    .eq('id', outputId)
    .single()

  if (error || !output?.s3_key_preview) {
    return NextResponse.json({ error: 'Preview not found' }, { status: 404 })
  }

  const url = await getPresignedUrl(output.s3_key_preview, 300)
  return NextResponse.json({ url })
}
