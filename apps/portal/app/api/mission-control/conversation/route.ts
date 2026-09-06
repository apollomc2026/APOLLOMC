import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 })
  const db = await createClient()
  const conversation = await db.from('apollo_conversations').select('id, readiness, current_spec_version, status').eq('id', id).eq('user_id', allowed.user.userId).single()
  if (conversation.error || !conversation.data) return NextResponse.json({ error: 'Mission conversation was not found' }, { status: 404 })
  const [turns, spec] = await Promise.all([
    db.from('apollo_conversation_turns').select('id, role, content, rationale, created_at').eq('conversation_id', id).order('sequence'),
    db.from('apollo_specification_versions').select('specification').eq('conversation_id', id).eq('version', conversation.data.current_spec_version).single(),
  ])
  if (turns.error || spec.error) return NextResponse.json({ error: turns.error?.message ?? spec.error?.message }, { status: 500 })
  return NextResponse.json({ conversation_id: id, readiness: conversation.data.readiness, specification_version: conversation.data.current_spec_version, status: conversation.data.status, turns: turns.data.map(turn => ({ id: turn.id, role: turn.role, content: turn.content, reason: turn.rationale, createdAt: turn.created_at })), specification: spec.data.specification })
}
