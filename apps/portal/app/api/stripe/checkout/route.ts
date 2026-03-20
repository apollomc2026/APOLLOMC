import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createPaymentIntent, createCustomer } from '@/lib/stripe/client'

export async function GET(request: NextRequest) {
  const missionId = request.nextUrl.searchParams.get('mission')
  if (!missionId) {
    return NextResponse.json({ error: 'Missing mission' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Load mission
  const { data: mission } = await supabase
    .from('missions')
    .select('*')
    .eq('id', missionId)
    .eq('user_id', user.id)
    .single()

  if (!mission || !mission.quoted_price_cents) {
    return NextResponse.json({ error: 'Mission not found' }, { status: 404 })
  }

  // Get or create Stripe customer
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  let customerId = profile?.stripe_customer_id
  if (!customerId) {
    const customer = await createCustomer(user.email!, profile?.full_name || undefined)
    customerId = customer.id

    await supabase
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('id', user.id)
  }

  // Create payment intent
  const paymentIntent = await createPaymentIntent(
    mission.quoted_price_cents,
    missionId,
    customerId
  )

  // Update mission with payment intent
  await supabase
    .from('missions')
    .update({
      stripe_payment_intent: paymentIntent.id,
      status: 'awaiting_payment',
    })
    .eq('id', missionId)

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    amount: mission.quoted_price_cents,
    missionId,
  })
}
