import { createHash } from 'node:crypto'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import { uuidFromDigest } from './work-order'

export const REVISION_SCOPE = 'presentation-only'

export function revisionDirectiveDigest(instruction:string):string {
  return createHash('sha256').update(instruction.trim()).digest('hex')
}

export function buildRevisionOrder(prior: DocumentWorkOrder, instruction: string, requestId?:string): DocumentWorkOrder {
  const normalized = instruction.trim()
  if (!normalized || normalized.length > 4000) throw new Error('A revision instruction between 1 and 4,000 characters is required')
  // Retrieval URLs are deliberately excluded: signed evidence links rotate even when
  // the governed file is unchanged. Brand and content hashes are execution inputs,
  // however, so changing either must create a distinct immutable revision.
  const sourceIdentity = prior.sources
    .map(source => `${source.source_id}:${source.content_sha256.toLowerCase()}`)
    .sort()
  const digest = createHash('sha256').update(JSON.stringify({
    prior_work_order_id: prior.work_order_id,
    instruction: normalized.toLowerCase(),
    brand_id: prior.brand_id,
    sources: sourceIdentity,
    request_id:requestId??null,
  })).digest('hex')
  const priorVersion = Number(prior.fields.artifact_version ?? 1)
  const artifactVersion = Number.isSafeInteger(priorVersion) && priorVersion > 0 ? priorVersion + 1 : 2
  return { ...prior, work_order_id: uuidFromDigest(digest), task_id: uuidFromDigest(digest, 32), idempotency_key: `revision-${digest}`, fields: { ...prior.fields, revision_instruction: normalized, revision_directive_sha256: revisionDirectiveDigest(normalized), revision_scope: REVISION_SCOPE, revision_of: prior.work_order_id, artifact_version: artifactVersion }, created_at: new Date().toISOString() }
}
