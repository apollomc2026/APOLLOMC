import { NextRequest, NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe/client'
import { createServiceClient } from '@/lib/supabase/server'
import { sendEmail, deliveryEmail } from '@/lib/email/ses'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  let event
  try {
    event = getStripe().webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook error: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as any
    const missionId = paymentIntent.metadata.mission_id
    if (!missionId) return NextResponse.json({ received: true })

    const supabase = await createServiceClient()

    // 1. Update mission status
    const now = new Date().toISOString()
    await supabase
      .from('missions')
      .update({
        status: 'paid',
        paid_at: now,
        paid_price_cents: paymentIntent.amount,
        stripe_charge_id: paymentIntent.latest_charge,
      })
      .eq('id', missionId)

    // 2. Get mission and output
    const { data: mission } = await supabase
      .from('missions')
      .select('*, profiles(*), deliverable_types(*)')
      .eq('id', missionId)
      .single()

    const { data: output } = await supabase
      .from('outputs')
      .select('*')
      .eq('mission_id', missionId)
      .order('version', { ascending: false })
      .limit(1)
      .single()

    if (output) {
      // 3. Mark output as paid and set watermark buyer ID
      await supabase
        .from('outputs')
        .update({
          status: 'paid',
          watermark_buyer_id: (mission as any)?.user_id,
        })
        .eq('id', output.id)

      // 4. Generate delivery token
      const token = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

      await supabase.from('delivery_tokens').insert({
        output_id: output.id,
        mission_id: missionId,
        token,
        expires_at: expiresAt,
      })

      // 5. Send delivery email
      const profile = (mission as any)?.profiles
      const deliverable = (mission as any)?.deliverable_types
      const downloadUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/delivery/${token}`

      if (profile?.email && deliverable) {
        const email = deliveryEmail(deliverable.label, downloadUrl)
        await sendEmail({ to: profile.email, ...email })
      }

      // 6. Update mission to delivered
      await supabase
        .from('missions')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('id', missionId)

      // Update output status
      await supabase
        .from('outputs')
        .update({ status: 'delivered' })
        .eq('id', output.id)
    }

    // 7. Log event
    await supabase.from('events').insert({
      mission_id: missionId,
      user_id: (mission as any)?.user_id,
      event_type: 'payment_received',
      event_data: {
        amount: paymentIntent.amount,
        charge_id: paymentIntent.latest_charge,
      },
    })
  }

  return NextResponse.json({ received: true })
}
