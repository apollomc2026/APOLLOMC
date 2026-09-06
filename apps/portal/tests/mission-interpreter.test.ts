import { describe, expect, it } from 'vitest'
import { interpretMission } from '../lib/mission-control/interpreter'

describe('mission interpreter', () => {
  it('starts from natural language and recommends a field-service proposal', () => {
    const result = interpretMission('I need something professional to send this client about the work we discussed.')
    expect(result.specification.artifact.recommended_type).toBe('proposal')
    expect(result.specification.specialist.playbook_id).toBe('field-service-proposal')
    expect(result.question).toBe('Who is the primary recipient?')
  })

  it('extracts multiple consequential facts from one answer', () => {
    const result = interpretMission('Send it to Acme Facilities for $18,500 before October 15, 2026. This is a proposal for the site work.')
    expect(result.specification.content.facts.map(fact => fact.key)).toEqual(expect.arrayContaining(['primary_audience', 'commercial_value', 'deadline', 'mission_domain']))
    expect(result.readiness).toBeGreaterThanOrEqual(75)
    expect(result.specification.approval.status).toBe('ready')
  })

  it('selects specialist playbooks from intent rather than a taxonomy gate', () => {
    expect(interpretMission('Build a balanced service agreement with termination terms.').specification.specialist.playbook_id).toBe('balanced-agreement')
    expect(interpretMission('Prepare the daily site report with photos and conflicting timestamps.').specification.specialist.playbook_id).toBe('field-service-report')
    expect(interpretMission('Create a cash flow forecast with variance analysis.').specification.specialist.playbook_id).toBe('financial-package')
  })
})
