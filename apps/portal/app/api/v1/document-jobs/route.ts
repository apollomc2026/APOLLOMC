import { NextResponse } from 'next/server'
import { assertAllowedCallbackUrl } from '@/lib/executor/callback'
import { parseWorkOrder } from '@/lib/executor/contracts'
import { verifyExecutorRequest } from '@/lib/executor/auth'
import { acceptWorkOrder, WorkOrderAcceptanceError } from '@/lib/executor/accept'

export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: Request) {
  const raw = await request.text()
  let auth
  try { auth = verifyExecutorRequest(request, raw) } catch { return NextResponse.json({ error: 'executor authentication is unavailable' }, { status: 503 }) }
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 })
  let order
  try {
    order = parseWorkOrder(JSON.parse(raw))
    assertAllowedCallbackUrl(order.callback_url)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'invalid work order' }, { status: 400 })
  }
  try {
    return NextResponse.json(await acceptWorkOrder(order), { status: 202 })
  } catch (error) {
    const status = error instanceof WorkOrderAcceptanceError ? error.status : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'job acceptance failed' }, { status })
  }
}
