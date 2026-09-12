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
})
