import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { interpretMissionWithClaude } from './ai-interpreter'
import type { DeliverableSpecification, MissionTurnResult } from './contracts'
import type { DocumentSource } from '@/lib/executor/contracts'
import { getPresignedUrl } from '@/lib/s3/client'

export class MissionPersistenceError extends Error {}

export async function persistMissionTurn(input: {
  userId: string
  message: string
  conversationId?: string | null
  prior?: DeliverableSpecification
  brandProfileId?: string | null
  aura?: Partial<DeliverableSpecification['aura']>
}): Promise<MissionTurnResult> {
  const db = await createClient()
  const result = await interpretMissionWithClaude(input.message, input.prior)
  if (input.brandProfileId !== undefined) result.specification.presentation.brand_profile_id = input.brandProfileId
  if (input.aura) result.specification.aura = { ...result.specification.aura, ...input.aura }
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
  const { data, error } = await db.rpc('apollo_approve_specification', { p_conversation_id: input.conversationId, p_version: input.version }).single()
  if (error || !data) throw new MissionPersistenceError('Specification approval failed')
  const row = data as { specification_id: string; specification: DeliverableSpecification; content_hash: string; approved_at: string }
  return { approved: true, approved_at: row.approved_at, specification_id: String(row.specification_id), specification: row.specification, content_hash: String(row.content_hash) }
}

export async function loadExecutionEvidence(input: { userId: string; conversationId: string }): Promise<DocumentSource[]> {
  const db = await createClient()
  const result = await db.from('apollo_conversation_evidence').select('id, original_name, retrieval_storage_key, retrieval_mime_type, retrieval_sha256').eq('conversation_id', input.conversationId).eq('user_id', input.userId).eq('extraction_status', 'verified')
  if (result.error) throw new MissionPersistenceError(result.error.message)
  const expiresIn = 3600
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
  return Promise.all((result.data ?? []).map(async row => {
    if (!row.retrieval_storage_key || !row.retrieval_mime_type || !row.retrieval_sha256) throw new MissionPersistenceError(`Evidence ${row.original_name} is missing its integrity record`)
    return { source_id: String(row.id), name: String(row.original_name), media_type: String(row.retrieval_mime_type), retrieval_url: await getPresignedUrl(String(row.retrieval_storage_key), expiresIn), content_sha256: String(row.retrieval_sha256), sensitivity: 'confidential' as const, expires_at: expiresAt }
  }))
}
