import { createHash } from 'node:crypto'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import { uuidFromDigest } from './work-order'

export function buildRetryOrder(prior: DocumentWorkOrder): DocumentWorkOrder {
  const priorAttempt = Number(prior.fields.retry_attempt ?? 0)
  const retryAttempt = Number.isSafeInteger(priorAttempt) && priorAttempt >= 0 ? priorAttempt + 1 : 1
  const digest = createHash('sha256').update(`${prior.work_order_id}:retry:${retryAttempt}`).digest('hex')
  return {
    ...prior,
    work_order_id: uuidFromDigest(digest),
    task_id: uuidFromDigest(digest, 32),
    idempotency_key: `retry-${digest}`,
    fields: { ...prior.fields, retry_of: prior.work_order_id, retry_attempt: retryAttempt },
    created_at: new Date().toISOString(),
  }
}
