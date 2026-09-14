import { describe, expect, it } from 'vitest'
import { APOLLO_WORKMANSHIP_STANDARD, auditDeliverableQuality, qualityArchetypeForSlug } from '@/lib/apollo/deliverable-quality'

function section(title: string, body: string) { return `<h2>${title}</h2><p>${body}</p>` }
const words = Array.from({ length: 80 }, (_, i) => `fact${i}`).join(' ')

describe('APOLLO deliverable workmanship floor', () => {
  it('puts content integrity and usefulness before decoration', () => {
    expect(APOLLO_WORKMANSHIP_STANDARD).toMatch(/factual completeness first/i)
    expect(APOLLO_WORKMANSHIP_STANDARD).toMatch(/decoration third/i)
    expect(APOLLO_WORKMANSHIP_STANDARD).toMatch(/never hide, replace, or compensate/i)
  })

  it('requires operational structure for field records', () => {
    const thin = auditDeliverableQuality('daily-construction-report', section('Summary', words), 1)
    expect(qualityArchetypeForSlug('daily-construction-report')).toBe('field-record')
    expect(thin.passed).toBe(false)
    expect(thin.violations.join(' ')).toMatch(/two substantive tables/i)

    const table = '<table><tr><th>Status</th></tr>' + Array.from({ length: 8 }, () => '<tr><td>PASS</td></tr>').join('') + '</table>'
    const structured = auditDeliverableQuality('daily-construction-report', section('Summary', words) + section('Results', words) + table + table + '<ul><li>Verified control</li></ul>', 2)
    expect(structured.passed).toBe(true)
  })

  it('requires decision-useful structures in proposals', () => {
    const narrative = auditDeliverableQuality('proposal', section('Executive summary', words.repeat(5)), 1)
    expect(narrative.passed).toBe(false)
    expect(narrative.violations.join(' ')).toMatch(/decision-useful tables/i)
  })

  it('rejects client proposals with duplicated headings or excessive unresolved placeholders', () => {
    const table = '<table><tr><th>Item</th><th>Status</th></tr>' + Array.from({ length: 6 }, () => '<tr><td>Scope</td><td>Defined</td></tr>').join('') + '</table>'
    const html = section('Executive Summary', words) + '<h2>Methodology</h2><p>Methodology</p>' +
      section('Commercial Terms', `${words} TBD to be confirmed not provided TBD`) + table + table + '<ul><li>Proceed</li></ul><ul><li>Approve</li></ul>'
    const report = auditDeliverableQuality('proposal', html, 3)
    expect(report.passed).toBe(false)
    expect(report.violations.join(' ')).toMatch(/unresolved placeholders/i)
    expect(report.violations.join(' ')).toMatch(/duplicated/i)
  })

  it('requires auditable schedules in financial packets', () => {
    const thin = auditDeliverableQuality('cash-flow-budget-package', section('Summary', words) + '<table><tr><th>Month</th></tr><tr><td>Jan</td></tr><tr><td>Feb</td></tr><tr><td>Mar</td></tr></table>', 1)
    expect(thin.passed).toBe(false)
    expect(thin.violations.join(' ')).toMatch(/two substantive tables/i)
  })

  it('requires a traceable compliance matrix in federal responses', () => {
    const tables = '<table><tr><th>Item</th></tr>' + Array.from({ length: 4 }, (_, i) => `<tr><td>Requirement ${i + 1}</td></tr>`).join('') + '</table>'
    const narrative = auditDeliverableQuality('federal-proposal', section('Executive response', words) + section('Technical approach', words) + tables + tables, 2)
    expect(narrative.passed).toBe(false)
    expect(narrative.violations.join(' ')).toMatch(/compliance matrix/i)
  })

  it('requires proof structures and executive brevity in capability statements', () => {
    const narrative = auditDeliverableQuality('capability-statement', section('Overview', words.repeat(16)), 1)
    expect(narrative.passed).toBe(false)
    expect(narrative.violations.join(' ')).toMatch(/scannable capabilities/i)
    expect(narrative.violations.join(' ')).toMatch(/proof or past-performance/i)
    expect(narrative.violations.join(' ')).toMatch(/concise/i)
  })

  it('requires termination, execution, and structured obligations in agreements', () => {
    const narrative = auditDeliverableQuality('contract-package', section('Purpose', words) + section('Scope', words), 2)
    expect(narrative.passed).toBe(false)
    expect(narrative.violations.join(' ')).toMatch(/term and termination/i)
    expect(narrative.violations.join(' ')).toMatch(/signature/i)
    expect(narrative.violations.join(' ')).toMatch(/structured obligations/i)
  })

  it('rejects report-like presentation decks without real decision tables and slide structures', () => {
    const narrative = auditDeliverableQuality('exec-presentation', section('Executive Summary', words.repeat(6)) + '<p>Option | Cost | Risk</p>', 1)
    expect(qualityArchetypeForSlug('exec-presentation')).toBe('presentation')
    expect(narrative.passed).toBe(false)
    expect(narrative.violations.join(' ')).toMatch(/at least 2 substantive decision tables/i)
    expect(narrative.violations.join(' ')).toMatch(/slide-native bullets/i)
  })
})
