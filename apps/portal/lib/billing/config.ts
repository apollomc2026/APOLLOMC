import type { BillingMode, BillingStatus } from './contracts'

const MODES: ReadonlySet<string> = new Set(['internal', 'test', 'live'])
type BillingEnvironment = Readonly<Record<string, string | undefined>>

export function getBillingMode(environment: BillingEnvironment = process.env): BillingMode {
  const configured = environment.BILLING_MODE?.trim().toLowerCase()
  return configured && MODES.has(configured) ? configured as BillingMode : 'internal'
}

export function getBillingStatus(environment: BillingEnvironment = process.env): BillingStatus {
  const mode = getBillingMode(environment)
  if (mode === 'internal') {
    return {
      mode,
      provider: 'none',
      checkoutEnabled: false,
      webhookEnabled: false,
      internalUse: true,
      message: 'Internal operation is active. External billing and payment gates are intentionally disabled.',
    }
  }

  const providerConfigured = Boolean(
    environment.STRIPE_SECRET_KEY
      && environment.STRIPE_WEBHOOK_SECRET
      && environment.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  )

  return {
    mode,
    provider: 'stripe',
    checkoutEnabled: providerConfigured,
    webhookEnabled: providerConfigured,
    internalUse: false,
    message: providerConfigured
      ? `${mode === 'live' ? 'Live' : 'Test'} billing is configured.`
      : `${mode === 'live' ? 'Live' : 'Test'} billing is selected but provider credentials are incomplete.`,
  }
}

export function isBillingLive(environment: BillingEnvironment = process.env): boolean {
  const status = getBillingStatus(environment)
  return status.mode === 'live' && status.checkoutEnabled && status.webhookEnabled
}
