import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { interpretMissionWithClaude } from './ai-interpreter'
import type { DeliverableSpecification, MissionTurnResult } from './contracts'

export class MissionPersistenceError extends Error {}

export async function persistMissionTurn(input: {
  userId: string
  message: string
  conversationId?: string | null
  prior?: DeliverableSpecification
}): Promise<MissionTurnResult> {
  const db = await createClient()
  const result = await interpretMissionWithClaude(input.message, input.prior)
  const apolloContent = [result.acknowledgement, result.question].filter(Boolean).join('\n\n')
  const contentHash = createHash('sha256').update(JSON.stringify(result.specification)).digest('hex')
  const state = result.readiness >= 75 ? 'brief_ready' : result.readiness >= 50 ? 'calibrating' : 'discovery'
  const committed = await db.rpc('apollo_commit_mission_turn', { p_conversation_id: input.conversationId ?? null, p_user_content: input.message, p_apollo_content: apolloContent, p_rationale: result.question_reason, p_specification: result.specification, p_schema_version: result.specification.schema_version, p_content_hash: contentHash, p_spec_status: result.specification.approval.status, p_readiness: result.readiness, p_conversation_status: state, p_title: result.specification.artifact.recommended_family }).single()
  if (committed.error || !committed.data) throw new MissionPersistenceError(committed.error?.message ?? 'Mission turn could not be committed')
  const row = committed.data as { conversation_id: string; specification_version: number }
  return { ...result, conversation_id: String(row.conversation_id), specification_version: Number(row.specification_version) }
}

export async function approveSpecification(input: { userId: string; conversationId: string; version: number }) {
  const db = await createClient()
  const { data: conversation, error: conversationError } = await db.from('apollo_conversations').select('id, current_spec_version, readiness').eq('id', input.conversationId).eq('user_id', input.userId).single()
  if (conversationError || !conversation) throw new MissionPersistenceError('Mission conversation was not found')
  if (Number(conversation.current_spec_version) !== input.version || Number(conversation.readiness) < 75) throw new MissionPersistenceError('Only the current ready specification can be approved')
  const now = new Date().toISOString()
  const { data, error } = await db.from('apollo_specification_versions').update({ status: 'approved', approved_by: input.userId, approved_at: now }).eq('conversation_id', input.conversationId).eq('version', input.version).in('status', ['ready', 'draft']).select('id, specification, content_hash').single()
  if (error || !data) throw new MissionPersistenceError('Specification approval failed')
  const { error: updateError } = await db.from('apollo_conversations').update({ status: 'approved' }).eq('id', input.conversationId).eq('user_id', input.userId)
  if (updateError) throw new MissionPersistenceError(updateError.message)
  const specification = data.specification as DeliverableSpecification
  specification.approval = { status: 'approved', approved_by: input.userId, approved_at: now }
  return { approved: true, approved_at: now, specification_id: String(data.id), specification, content_hash: String(data.content_hash) }
}
