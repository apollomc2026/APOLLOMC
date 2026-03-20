import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { getPresignedUrl } from '@/lib/s3/client'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabase = await createServiceClient()

  // Look up valid token
  const { data: deliveryToken } = await supabase
    .from('delivery_tokens')
    .select('*, outputs(*)')
    .eq('token', token)
    .is('used_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!deliveryToken) {
    return NextResponse.json(
      { error: 'Download link expired or already used' },
      { status: 404 }
    )
  }

  const output = (deliveryToken as any).outputs
  if (!output?.s3_key_private) {
    return NextResponse.json({ error: 'Output not found' }, { status: 404 })
  }

  // Mark token as used
  await supabase
    .from('delivery_tokens')
    .update({ used_at: new Date().toISOString() })
    .eq('id', deliveryToken.id)

  // Log download event
  await supabase.from('events').insert({
    mission_id: deliveryToken.mission_id,
    event_type: 'deliverable_downloaded',
    event_data: { token_id: deliveryToken.id },
  })

  // Generate pre-signed URL and redirect
  const url = await getPresignedUrl(output.s3_key_private, 900)

  return NextResponse.redirect(url)
}
