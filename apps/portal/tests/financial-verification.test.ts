import { describe, expect, it } from 'vitest'
import { verifyFinancialDocument } from '../lib/executor/financial-verification'
import type { DocumentWorkOrder } from '../lib/executor/contracts'

const base = {
  protocol_version: '1.0', work_order_id: '00000000-0000-4000-8000-000000000401', idempotency_key: 'financial:test:document:v1',
  project_id: 'atlas', conversation_id: '00000000-0000-4000-8000-000000000402', task_id: '00000000-0000-4000-8000-000000000403',
  requested_by: 'jon', capability: 'financial-package', objective: 'verify', audience: 'leadership', formats: ['pdf'], sources: [],
  brand_id: 'atlas', style_id: 'ledger', sensitivity: 'confidential', priority: 'critical', drive_destination: { folder_id: 'draft', lifecycle: 'draft' },
  quality_gates: { schema_validation: true, source_grounding: true, independent_review: true, deterministic_financial_verification: true, human_approval_before_publish: true },
  callback_url: 'https://metis-sage.vercel.app/api/executor-events', created_at: '2026-07-20T12:00:00.000Z',
} as const

describe('deterministic financial verification', () => {
  it('cross-foots cash schedules and verifies continuity', () => {
    const order = { ...base, deliverable_type: 'cash-flow-budget-package', fields: { base_case_lines: 'Jan | 100 | 50 | (20) | 30 | 130\nFeb | 130 | 25 | (35) | (10) | 120' } } as unknown as DocumentWorkOrder
    const report = verifyFinancialDocument(order, '<p>100 50 (20) 30 130 130 25 (35) (10) 120</p>')
    expect(report.required).toBe(true)
    expect(report.verified_values).toBeGreaterThan(0)
  })

  it('rejects a cash schedule whose math is wrong', () => {
    const order = { ...base, deliverable_type: 'cash-flow-budget-package', fields: { base_case_lines: 'Jan | 100 | 50 | (20) | 40 | 140' } } as unknown as DocumentWorkOrder
    expect(() => verifyFinancialDocument(order, '<p>100 50 (20) 40 140</p>')).toThrow(/net change/)
  })

  it('rejects changed practitioner-supplied statement figures', () => {
    const order = { ...base, deliverable_type: 'financial-statements-package', fields: { balance_sheet_lines: 'Cash | 312,400 | 302,900' } } as unknown as DocumentWorkOrder
    expect(() => verifyFinancialDocument(order, '<p>Cash 312,400 999,999</p>')).toThrow(/changed or omitted/)
  })

  it('fails closed for an unsupported deterministic financial type', () => {
    const order = { ...base, deliverable_type: 'cash-flow-forecast', fields: {} } as unknown as DocumentWorkOrder
    expect(() => verifyFinancialDocument(order, '')).toThrow(/not implemented/)
  })
})
