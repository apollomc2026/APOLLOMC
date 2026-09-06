import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { getBillingStatus } from '@/lib/billing/config'

export async function GET() {
  const auth = await requireAllowedUser()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })
  return NextResponse.json(getBillingStatus())
}
