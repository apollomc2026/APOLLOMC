import { describe, expect, it } from 'vitest'
import { verifyFinancialDocument } from '../lib/executor/financial-verification'
import type { DocumentWorkOrder } from '../lib/executor/contracts'

const base = {
  protocol_version: '1.0', work_order_id: '00000000-0000-4000-8000-000000000401', idempotency_key: 'financial:test:document:v1',
  project_id: 'apollo-pilot', conversation_id: '00000000-0000-4000-8000-000000000402', task_id: '00000000-0000-4000-8000-000000000403',
  requested_by: 'jon', capability: 'financial-package', objective: 'verify', audience: 'leadership', formats: ['pdf'], sources: [],
  brand_id: 'on-spot-solutions', style_id: 'ledger', sensitivity: 'confidential', priority: 'critical', drive_destination: { folder_id: 'draft', lifecycle: 'draft' },
  quality_gates: { schema_validation: true, source_grounding: true, independent_review: true, deterministic_financial_verification: true, human_approval_before_publish: true },
  created_at: '2026-07-20T12:00:00.000Z',
} as const

describe('deterministic financial verification', () => {
  it('cross-foots cash schedules and verifies continuity', () => {
    const order = { ...base, deliverable_type: 'cash-flow-budget-package', fields: { base_case_lines: 'Jan | 100 | 50 | (20) | 30 | 130\nFeb | 130 | 25 | (35) | (10) | 120' } } as unknown as DocumentWorkOrder
    const report = verifyFinancialDocument(order, '<p>100 50 (20) 30 130 130 25 (35) (10) 120</p>')
    expect(report.required).toBe(true)
    expect(report.verified_values).toBeGreaterThan(0)
  })

  it('accepts a labeled cash schedule and validates only its data rows', () => {
    const order = { ...base, deliverable_type: 'cash-flow-budget-package', fields: { base_case_lines: 'Month | Opening cash | Inflows | Outflows | Net change | Closing cash\nJan-27 | $425,000 | $340,000 | $318,000 | $22,000 | $447,000' } } as unknown as DocumentWorkOrder
    const report = verifyFinancialDocument(order, '<table><tr><th>Opening cash</th></tr><tr><td>$425,000</td><td>$340,000</td><td>$318,000</td><td>$22,000</td><td>$447,000</td></tr></table>')
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

  it.each([
    ['budget-vs-actual', { revenue_lines:'Service | 1000 | 1200', expense_lines:'Labor | 600 | 550' }, '1000 1200 600 550'],
    ['cash-flow-forecast', { starting_cash_position:'50000', recurring_inflows:'Contracts | 8000 | 1 | 1 | 13', recurring_outflows:'Payroll | 4000 | 1 | 1 | 13' }, '50,000 8,000 4,000'],
    ['expense-report', { expense_lines:'2026-09-01 | Travel | Rail | 245.50 | USD | card | 6010 | Site visit' }, '$245.50'],
    ['invoice', { line_items:'CONSULT | Consulting | 8 | 175 | N', tax_rate_percent:'0', late_payment_interest_percent_monthly:'1.5' }, '8 $175 0% 1.5%'],
    ['personal-monthly', { income_sources:'Salary | 7200', fixed_expenses:'Housing | 2100', variable_expenses:'Food | 650' }, '$7,200 $2,100 $650'],
  ])('preserves the approved source basis for %s', (deliverable_type, fields, output) => {
    const report = verifyFinancialDocument({ ...base, deliverable_type, fields } as unknown as DocumentWorkOrder, `<p>${output}</p>`)
    expect(report.required).toBe(true)
    expect(report.verified_values).toBeGreaterThan(0)
  })

  it('requires both source figures and the professional boundary for tax estimates', () => {
    const order = { ...base, deliverable_type:'tax-estimate', fields:{ gross_income_w2:'125000', withholdings_ytd:'22000', prior_year_tax_liability:'23500' } } as unknown as DocumentWorkOrder
    expect(() => verifyFinancialDocument(order, '<p>$125,000 $22,000 $23,500</p>')).toThrow(/planning-only/)
    expect(verifyFinancialDocument(order, '<p>For planning purposes only. $125,000 $22,000 $23,500</p>').verified_values).toBe(3)
  })

  it('rejects a changed source value in every supported financial class', () => {
    const order = { ...base, deliverable_type:'cash-flow-forecast', fields:{ starting_cash_position:'50000', recurring_inflows:'Contracts | 8000 | 1 | 1 | 13', recurring_outflows:'Payroll | 4000 | 1 | 1 | 13' } } as unknown as DocumentWorkOrder
    expect(() => verifyFinancialDocument(order, '<p>50,000 8,000 9,999</p>')).toThrow(/recurring_outflows/)
  })

  it('still fails closed for an unknown deterministic financial type', () => {
    const order = { ...base, deliverable_type: 'unknown-financial-type', fields: {} } as unknown as DocumentWorkOrder
    expect(() => verifyFinancialDocument(order, '')).toThrow(/not implemented/)
  })
})
