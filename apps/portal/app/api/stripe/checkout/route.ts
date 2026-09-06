import { NextRequest, NextResponse } from 'next/server'
import { POST as billingCheckout } from '@/app/api/billing/checkout/route'

export async function GET() {
  return NextResponse.json(
    { error: 'method_not_allowed', replacement: '/api/billing/checkout' },
    { status: 405, headers: { Allow: 'POST' } }
  )
}

// Compatibility adapter only. It cannot contact a payment provider while
// BILLING_MODE is internal, which is the default and current release mode.
export async function POST(request: NextRequest) {
  return billingCheckout(request)
}
