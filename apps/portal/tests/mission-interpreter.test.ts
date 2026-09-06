import { describe, expect, it } from 'vitest'
import { interpretMission } from '../lib/mission-control/interpreter'
import { applyClaudeInterpretation } from '../lib/mission-control/ai-interpreter'

describe('mission interpreter', () => {
  it('starts from natural language and recommends a field-service proposal', () => {
    const result = interpretMission('I need something professional to send this client about the work we discussed.')
    expect(result.specification.artifact.recommended_type).toBe('proposal')
    expect(result.specification.specialist.playbook_id).toBe('field-service-proposal')
    expect(result.question).toContain('prospect organization')
  })

  it('extracts multiple consequential facts from one answer', () => {
    const result = interpretMission('Send it to Acme Facilities for $18,500 before October 15, 2026. This is a proposal for the site work.')
    expect(result.specification.content.facts.map(fact => fact.key)).toEqual(expect.arrayContaining(['primary_audience', 'commercial_value', 'deadline', 'mission_domain']))
    expect(result.readiness).toBeLessThan(75)
    expect(result.specification.approval.status).toBe('draft')
    expect(result.question).toContain('prospect contact')
  })

  it('selects specialist playbooks from intent rather than a taxonomy gate', () => {
    expect(interpretMission('Build a balanced service agreement with termination terms.').specification.specialist.playbook_id).toBe('balanced-agreement')
    expect(interpretMission('Prepare the daily site report with photos and conflicting timestamps.').specification.specialist.playbook_id).toBe('field-service-report')
    expect(interpretMission('Create a cash flow forecast with variance analysis.').specification.specialist.playbook_id).toBe('financial-package')
  })

  it('keeps an explicitly requested proposal ahead of incidental financial caution language', () => {
    const result = interpretMission('Create an internal project proposal and do not invent financial claims.')
    expect(result.specification.artifact.recommended_type).toBe('proposal')
    expect(result.specification.specialist.playbook_id).toBe('field-service-proposal')
  })

  it('merges Claude extraction while preserving stated and inferred provenance', () => {
    const base = interpretMission('I need a proposal.')
    const result = applyClaudeInterpretation(base, {
      objective: 'Win approval for the defined site work',
      primary_audience: 'Acme Facilities',
      stated_facts: [{ key: 'client', label: 'Client', value: 'Acme Facilities' }],
      inferred_facts: [{ key: 'tone', label: 'Likely tone', value: 'Formal', confidence: .64 }],
      next_question: 'What exact work is included?',
    })
    expect(result.specification.content.facts).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'client', source: 'user', confidence: 1 }),
      expect.objectContaining({ key: 'tone', source: 'inferred', confidence: .64 }),
    ]))
    expect(result.specification.audience.primary).toEqual(['Acme Facilities'])
    expect(result.question).toContain('prospect contact')
  })

  it('accepts Claude specialist routing when the natural request is ambiguous', () => {
    const result = applyClaudeInterpretation(interpretMission('Help me prepare this.'), { recommendation: 'capability-statement', rationale: 'The audience needs a concise qualifications summary.' })
    expect(result.specification.artifact.recommended_type).toBe('capability-statement')
    expect(result.specification.specialist.playbook_id).toBe('executive-capability')
  })
})
