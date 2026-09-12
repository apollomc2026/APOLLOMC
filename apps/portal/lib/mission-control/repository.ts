import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { interpretMissionWithClaude } from './ai-interpreter'
import { specificationProvenance, type DeliverableSpecification, type MissionTurnResult } from './contracts'
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
  const involvement = input.aura?.operator_involvement ?? input.prior?.aura.operator_involvement
  const result = await interpretMissionWithClaude(input.message, input.prior, involvement)
  const updatedAt = new Date().toISOString()
  const changedKeys = new Set(result.changed_facts.map(fact => fact.key))
  result.specification.content.facts = result.specification.content.facts.map(fact => changedKeys.has(fact.key) && fact.source === 'user' ? { ...fact, last_editor: input.userId, updated_at: updatedAt } : fact)
  result.changed_facts = result.changed_facts.map(fact => fact.source === 'user' ? { ...fact, last_editor: input.userId, updated_at: updatedAt } : fact)
  result.specification.provenance = specificationProvenance(result.specification.content.facts, result.specification.provenance.created_at, result.specification.provenance.model_versions)
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

export async function approveSpecification(input: { userId: string; conversationId: string; version: number; unresolvedItemsAccepted: string[] }) {
  const db = await createClient()
  const existing = await db.from('apollo_specification_versions').select('id,specification,content_hash,approved_at,apollo_conversations!inner(user_id,current_spec_version)').eq('conversation_id', input.conversationId).eq('version', input.version).eq('status', 'approved').eq('apollo_conversations.user_id', input.userId).eq('apollo_conversations.current_spec_version', input.version).maybeSingle()
  if (existing.error) throw new MissionPersistenceError('Specification approval state could not be read')
  if (existing.data) {
    const specification = existing.data.specification as DeliverableSpecification
    const accepted = specification.approval.unresolved_items_accepted ?? []
    if (JSON.stringify([...accepted].sort()) !== JSON.stringify([...input.unresolvedItemsAccepted].sort())) throw new MissionPersistenceError('Approved unresolved-item acceptance does not match the locked specification')
    return { approved: true, approved_at: String(existing.data.approved_at), specification_id: String(existing.data.id), specification, content_hash: String(existing.data.content_hash) }
  }
  const { data, error } = await db.rpc('apollo_approve_specification', { p_conversation_id: input.conversationId, p_version: input.version, p_unresolved_items_accepted: input.unresolvedItemsAccepted }).single()
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

export async function refreshExecutionEvidence(input: { userId: string; conversationId: string; expectedSources: DocumentSource[] }): Promise<DocumentSource[]> {
  if (!input.expectedSources.length) return []
  const db = await createClient()
  const ids = input.expectedSources.map(source => source.source_id)
  const result = await db.from('apollo_conversation_evidence').select('id, original_name, retrieval_storage_key, retrieval_mime_type, retrieval_sha256').eq('conversation_id', input.conversationId).eq('user_id', input.userId).eq('extraction_status', 'verified').in('id', ids)
  if (result.error) throw new MissionPersistenceError(result.error.message)
  const rows = new Map((result.data ?? []).map(row => [String(row.id), row]))
  const expiresIn = 3600
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
  return Promise.all(input.expectedSources.map(async expected => {
    const row = rows.get(expected.source_id)
    if (!row || !row.retrieval_storage_key || !row.retrieval_mime_type || !row.retrieval_sha256) throw new MissionPersistenceError(`Approved evidence ${expected.name} is no longer available`)
    if (String(row.retrieval_sha256) !== expected.content_sha256 || String(row.retrieval_mime_type) !== expected.media_type) throw new MissionPersistenceError(`Approved evidence ${expected.name} failed manifest verification`)
    return { ...expected, name: String(row.original_name), retrieval_url: await getPresignedUrl(String(row.retrieval_storage_key), expiresIn), expires_at: expiresAt }
  }))
}

export async function loadCurrentMissionBrand(input: {
  userId: string
  conversationId: string
}): Promise<string | null> {
  const db = await createClient()
  const conversation = await db
    .from('apollo_conversations')
    .select('current_spec_version')
    .eq('id', input.conversationId)
    .eq('user_id', input.userId)
    .single()
  if (conversation.error || !conversation.data)
    throw new MissionPersistenceError('Current mission brand could not be read')
  const version = await db
    .from('apollo_specification_versions')
    .select('specification')
    .eq('conversation_id', input.conversationId)
    .eq('version', conversation.data.current_spec_version)
    .single()
  if (version.error || !version.data)
    throw new MissionPersistenceError('Current mission specification could not be read')
  const specification = version.data.specification as DeliverableSpecification
  return specification.presentation.brand_profile_id
}
