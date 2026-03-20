import Stripe from 'stripe'

let _stripe: Stripe | null = null

export function getStripe(): Stripe {
  if (!_stripe) {
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2026-02-25.clover',
    })
  }
  return _stripe
}

export { _stripe as stripe }

export async function createPaymentIntent(
  amountCents: number,
  missionId: string,
  customerId?: string
) {
  return getStripe().paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    metadata: { mission_id: missionId },
    ...(customerId ? { customer: customerId } : {}),
  })
}

export async function createCustomer(email: string, name?: string) {
  return getStripe().customers.create({
    email,
    name: name || undefined,
  })
}
