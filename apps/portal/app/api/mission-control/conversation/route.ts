import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 })
  const db = await createClient()
  const conversation = await db.from('apollo_conversations').select('id, readiness, current_spec_version, status').eq('id', id).eq('user_id', allowed.user.userId).single()
  if (conversation.error || !conversation.data) return NextResponse.json({ error: 'Mission conversation was not found' }, { status: 404 })
  const [turns, spec, evidence] = await Promise.all([
    db.from('apollo_conversation_turns').select('id, role, content, rationale, created_at').eq('conversation_id', id).order('sequence'),
    db.from('apollo_specification_versions').select('specification').eq('conversation_id', id).eq('version', conversation.data.current_spec_version).single(),
    db.from('apollo_conversation_evidence').select('id, original_name, extraction_status, extracted_facts').eq('conversation_id', id).eq('user_id', allowed.user.userId).order('created_at'),
  ])
  if (turns.error || spec.error || evidence.error) return NextResponse.json({ error: turns.error?.message ?? spec.error?.message ?? evidence.error?.message }, { status: 500 })
  const specification = spec.data.specification as Record<string, unknown>
  specification.sources = evidence.data.map(item => ({ id: item.id, name: item.original_name, status: item.extraction_status }))
  const content = specification.content as { facts?: Array<{ key: string }> }
  const facts = [...(content.facts ?? []), ...evidence.data.flatMap(item => Array.isArray(item.extracted_facts) ? item.extracted_facts : [])] as Array<{ key: string }>
  content.facts = [...new Map(facts.map(fact => [fact.key, fact])).values()]
  const service = await createServiceClient()
  const job = await service.from('apollo_document_jobs').select('id, state, artifacts').eq('conversation_id', id).eq('requested_by', allowed.user.userId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  return NextResponse.json({ conversation_id: id, readiness: conversation.data.readiness, specification_version: conversation.data.current_spec_version, status: conversation.data.status, turns: turns.data.map(turn => ({ id: turn.id, role: turn.role, content: turn.content, reason: turn.rationale, createdAt: turn.created_at })), specification, job: job.data ? { id: job.data.id, state: job.data.state, artifact_url: (job.data.artifacts as Array<{ web_view_url?: string }> | null)?.[0]?.web_view_url ?? null } : null })
}
