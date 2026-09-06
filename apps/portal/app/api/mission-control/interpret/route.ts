import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { interpretMission } from '@/lib/mission-control/interpreter'
import { MissionPersistenceError, persistMissionTurn } from '@/lib/mission-control/repository'
import type { DeliverableSpecification } from '@/lib/mission-control/contracts'

export async function POST(request: Request) {
  let allowedUserId = ''
  if (process.env.PLAYWRIGHT_TESTING !== 'true') {
    const allowed = await requireAllowedUser()
    if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
    allowedUserId = allowed.user.userId
  }
  let body: { message?: string; specification?: DeliverableSpecification | null; conversation_id?: string | null }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  const message = body.message?.trim()
  if (!message || message.length > 12_000) return NextResponse.json({ error: 'Message must contain 1 to 12,000 characters' }, { status: 400 })
  if (process.env.PLAYWRIGHT_TESTING === 'true') return NextResponse.json(interpretMission(message, body.specification ?? undefined))
  try {
    return NextResponse.json(await persistMissionTurn({ userId: allowedUserId, message, conversationId: body.conversation_id, prior: body.specification ?? undefined }))
  } catch (error) {
    const status = error instanceof MissionPersistenceError ? 409 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Mission turn could not be saved' }, { status })
  }
}
