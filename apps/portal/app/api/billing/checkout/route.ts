import { NextRequest, NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { getBillingStatus } from '@/lib/billing/config'
import type { CheckoutRequest, CheckoutUnavailable } from '@/lib/billing/contracts'

export async function POST(request: NextRequest) {
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json().catch(() => null) as CheckoutRequest | null
  if (!body?.missionId || typeof body.missionId !== 'string') {
    return NextResponse.json({ error: 'Missing missionId' }, { status: 400 })
  }

  const status = getBillingStatus()
  if (!status.checkoutEnabled || status.mode === 'internal') {
    const response: CheckoutUnavailable = { error: 'billing_not_enabled', status }
    return NextResponse.json(response, { status: 409 })
  }

  // A provider adapter is intentionally absent. Activation requires a later,
  // reviewed implementation and production gate.
  return NextResponse.json({ error: 'billing_provider_not_implemented', status }, { status: 501 })
}
