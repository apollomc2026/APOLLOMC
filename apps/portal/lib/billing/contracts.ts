export type BillingMode = 'internal' | 'test' | 'live'
export type BillingProvider = 'none' | 'stripe'

export interface BillingStatus {
  mode: BillingMode
  provider: BillingProvider
  checkoutEnabled: boolean
  webhookEnabled: boolean
  internalUse: boolean
  message: string
}

export interface CheckoutRequest {
  missionId: string
  specificationVersion?: number
}

export interface CheckoutUnavailable {
  error: 'billing_not_enabled'
  status: BillingStatus
}
