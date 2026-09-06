import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { interpretMission } from '@/lib/mission-control/interpreter'
import type { DeliverableSpecification } from '@/lib/mission-control/contracts'

export async function POST(request: Request) {
  if (process.env.PLAYWRIGHT_TESTING !== 'true') {
    const allowed = await requireAllowedUser()
    if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  }
  let body: { message?: string; specification?: DeliverableSpecification | null }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  const message = body.message?.trim()
  if (!message || message.length > 12_000) return NextResponse.json({ error: 'Message must contain 1 to 12,000 characters' }, { status: 400 })
  return NextResponse.json(interpretMission(message, body.specification ?? undefined))
}
