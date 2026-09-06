import { createHash } from 'node:crypto'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import { uuidFromDigest } from './work-order'

export function buildRevisionOrder(prior: DocumentWorkOrder, instruction: string): DocumentWorkOrder {
  const normalized = instruction.trim()
  if (!normalized || normalized.length > 4000) throw new Error('A revision instruction between 1 and 4,000 characters is required')
  const digest = createHash('sha256').update(`${prior.work_order_id}:${normalized.toLowerCase()}`).digest('hex')
  return { ...prior, work_order_id: uuidFromDigest(digest), task_id: uuidFromDigest(digest, 32), idempotency_key: `revision-${digest}`, fields: { ...prior.fields, revision_instruction: normalized, revision_of: prior.work_order_id }, created_at: prior.created_at }
}
