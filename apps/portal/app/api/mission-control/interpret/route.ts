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
  let body: { message?: string; specification?: DeliverableSpecification | null; conversation_id?: string | null; brand_profile_id?: string | null; aura?: Record<string,number> }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid request body' }, { status: 400 }) }
  const message = body.message?.trim()
  if (!message || message.length > 12_000) return NextResponse.json({ error: 'Message must contain 1 to 12,000 characters' }, { status: 400 })
  if (body.brand_profile_id && !/^(apollo|atlas|on-spot-solutions|habi|metis|themis|kit:[0-9a-f-]{36})$/.test(body.brand_profile_id)) return NextResponse.json({ error:'Brand profile is invalid' }, { status:400 })
  const auraKeys = ['authority','warmth','technicality','restraint','urgency','prestige','visual_density'] as const
  const aura = body.aura ? Object.fromEntries(auraKeys.flatMap(key => Number.isFinite(body.aura?.[key]) ? [[key,Math.max(0,Math.min(100,Number(body.aura![key])))]] : [])) : undefined
  if (process.env.PLAYWRIGHT_TESTING === 'true') {
    const result = interpretMission(message, body.specification ?? undefined)
    result.specification.presentation.brand_profile_id = body.brand_profile_id ?? null
    if (aura) result.specification.aura = { ...result.specification.aura, ...aura }
    return NextResponse.json(result)
  }
  try {
    return NextResponse.json(await persistMissionTurn({ userId: allowedUserId, message, conversationId: body.conversation_id, prior: body.specification ?? undefined, brandProfileId: body.brand_profile_id, aura }))
  } catch (error) {
    const status = error instanceof MissionPersistenceError ? 409 : 500
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Mission turn could not be saved' }, { status })
  }
}
