import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'
import { getBillingStatus } from '../lib/billing/config'

const mocks = vi.hoisted(() => ({
  requireAllowedUser: vi.fn(),
  getStripe: vi.fn(),
}))
vi.mock('../lib/apollo/auth', () => ({ requireAllowedUser: mocks.requireAllowedUser }))
vi.mock('../lib/stripe/client', () => ({ getStripe: mocks.getStripe }))
vi.mock('../lib/supabase/server', () => ({ createServiceClient: vi.fn() }))
vi.mock('../lib/email/ses', () => ({ sendEmail: vi.fn(), deliveryEmail: vi.fn() }))

import { POST as checkout } from '../app/api/billing/checkout/route'
import { POST as stripeWebhook } from '../app/api/stripe/webhook/route'

describe('billing scaffold', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAllowedUser.mockResolvedValue({
      ok: true,
      user: { userId: 'user-1', email: 'owner@example.com', name: null, avatar: null },
    })
  })

  it('defaults to internal mode even when provider credentials exist', () => {
    const status = getBillingStatus({
      STRIPE_SECRET_KEY: 'reserved',
      STRIPE_WEBHOOK_SECRET: 'reserved',
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: 'reserved',
    })

    expect(status).toMatchObject({
      mode: 'internal', provider: 'none', checkoutEnabled: false,
      webhookEnabled: false, internalUse: true,
    })
  })

  it('refuses checkout while APOLLO is in internal mode', async () => {
    const request = new NextRequest('https://portal.apollomc.ai/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ missionId: 'mission-1' }),
      headers: { 'content-type': 'application/json' },
    })

    const response = await checkout(request)
    expect(response.status).toBe(409)
    await expect(response.json()).resolves.toMatchObject({
      error: 'billing_not_enabled', status: { mode: 'internal', checkoutEnabled: false },
    })
  })

  it('rejects an unauthenticated caller', async () => {
    mocks.requireAllowedUser.mockResolvedValue({ ok: false, status: 401, error: 'Not authenticated' })
    const request = new NextRequest('https://portal.apollomc.ai/api/billing/checkout', {
      method: 'POST',
      body: JSON.stringify({ missionId: 'mission-1' }),
      headers: { 'content-type': 'application/json' },
    })

    expect((await checkout(request)).status).toBe(401)
  })

  it('rejects Stripe webhooks before initializing the provider', async () => {
    const request = new NextRequest('https://portal.apollomc.ai/api/stripe/webhook', {
      method: 'POST',
      body: '{}',
    })

    expect((await stripeWebhook(request)).status).toBe(503)
    expect(mocks.getStripe).not.toHaveBeenCalled()
  })
})
