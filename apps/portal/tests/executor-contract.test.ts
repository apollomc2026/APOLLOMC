import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { assertAllowedCallbackUrl } from '../lib/executor/callback'
import { parseWorkOrder, workOrderDigest } from '../lib/executor/contracts'
import { signExecutorRequest, verifyExecutorRequest } from '../lib/executor/auth'

const order = {
  protocol_version: '1.0',
  work_order_id: '00000000-0000-4000-8000-000000000301',
  idempotency_key: 'atlas:task:document:business-plan:v1',
  project_id: 'atlas',
  conversation_id: '00000000-0000-4000-8000-000000000302',
  task_id: '00000000-0000-4000-8000-000000000303',
  requested_by: 'jon', capability: 'business-plan', deliverable_type: 'business-plan',
  objective: 'Create plan', audience: 'leadership', formats: ['pdf'], fields: {}, sources: [],
  brand_id: 'atlas', style_id: 'consulting-executive', sensitivity: 'confidential', priority: 'high',
  drive_destination: { folder_id: 'draft-folder', lifecycle: 'draft' },
  quality_gates: { schema_validation: true, source_grounding: true, independent_review: true, deterministic_financial_verification: false, human_approval_before_publish: true },
  callback_url: 'https://metis-sage.vercel.app/api/executor-events',
  created_at: '2026-07-20T12:00:00.000Z',
}

describe('METIS executor boundary', () => {
  beforeEach(() => {
    process.env.METIS_EXECUTOR_SHARED_SECRET = 's'.repeat(64)
    process.env.METIS_CALLBACK_ORIGINS = 'https://metis-sage.vercel.app'
  })
  afterEach(() => vi.restoreAllMocks())

  it('accepts the locked work-order contract and produces a stable digest', () => {
    const parsed = parseWorkOrder(order)
    expect(workOrderDigest(parsed)).toMatch(/^[a-f0-9]{64}$/)
    expect(workOrderDigest(parsed)).toBe(workOrderDigest(parseWorkOrder(structuredClone(order))))
  })

  it('refuses to weaken mandatory review boundaries', () => {
    expect(() => parseWorkOrder({ ...order, quality_gates: { ...order.quality_gates, human_approval_before_publish: false } })).toThrow(/mandatory quality gates/)
  })

  it('rejects callback exfiltration to an unapproved origin', () => {
    expect(() => assertAllowedCallbackUrl('https://attacker.example/callback')).toThrow(/not allowed/)
  })

  it('authenticates method, path, timestamp, and body and rejects tampering', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-07-20T12:00:00.000Z'))
    const timestamp = '2026-07-20T12:00:00.000Z'
    const body = JSON.stringify(order)
    const signature = signExecutorRequest(timestamp, 'POST', '/api/v1/document-jobs', body)
    const request = new Request('https://portal.apollomc.ai/api/v1/document-jobs', { method: 'POST', headers: { 'x-metis-timestamp': timestamp, 'x-metis-signature': signature } })
    expect(verifyExecutorRequest(request, body).ok).toBe(true)
    expect(verifyExecutorRequest(request, body + ' ').ok).toBe(false)
  })
})
