import { describe, expect, it } from 'vitest'
import { interpretMission } from '../lib/mission-control/interpreter'
import { applyClaudeInterpretation, applyExpertRecommendationMode, applyExplicitMissionDirectives, interpretMissionWithClaude, isMissionControlDirective, promoteAcknowledgedGap } from '../lib/mission-control/ai-interpreter'
import { executionGaps } from '../lib/mission-control/work-order'

describe('mission interpreter', () => {
  it('starts from natural language and recommends a field-service proposal', () => {
    const result = interpretMission('I need something professional to send this client about the work we discussed.')
    expect(result.specification.artifact.recommended_type).toBe('proposal')
    expect(result.specification.specialist.playbook_id).toBe('field-service-proposal')
    expect(result.question).toContain('prospect organization')
  })

  it('extracts multiple consequential facts from one answer', () => {
    const result = interpretMission('Send it to Acme Facilities for $18,500 before October 15, 2026. This is a proposal for the site work.', undefined, new Date('2026-09-07T12:00:00.000Z'))
    expect(result.specification.content.facts.map(fact => fact.key)).toEqual(expect.arrayContaining(['primary_audience', 'commercial_value', 'deadline', 'mission_domain']))
    expect(result.readiness).toBeLessThan(75)
    expect(result.specification.approval.status).toBe('draft')
    expect(result.specification.approval.unresolved_items_accepted).toEqual([])
    expect(result.specification.content.facts.find(fact => fact.key === 'commercial_value')).toEqual(expect.objectContaining({ normalized_value: '$18,500', capture_method: 'user', verification_state: 'stated', sensitivity: 'confidential', updated_at: '2026-09-07T12:00:00.000Z' }))
    expect(result.specification.provenance.fact_origins).toEqual(expect.arrayContaining([expect.objectContaining({ key: 'commercial_value', source: 'user' })]))
    expect(result.specification.provenance.inferences).toEqual(expect.arrayContaining([expect.objectContaining({ key: 'mission_domain', confidence: .78 })]))
    expect(result.specification.provenance.model_versions).toContain('apollo-deterministic-interpreter@1.0')
    expect(result.question).toContain('win themes')
  })

  it('upgrades legacy facts into the complete provenance contract on the next turn', () => {
    const prior = interpretMission('I need a proposal.').specification
    prior.content.facts = [{ key: 'legacy_fact', label: 'Legacy fact', value: 'Preserved', source: 'user', confidence: 1 } as unknown as typeof prior.content.facts[number]]
    const result = interpretMission('The recipient is Acme Facilities.', prior, new Date('2026-09-07T13:00:00.000Z'))
    expect(result.specification.content.facts.find(fact => fact.key === 'legacy_fact')).toEqual(expect.objectContaining({ normalized_value: 'Preserved', source_reference: null, verification_state: 'stated', last_editor: 'user' }))
  })

  it('selects specialist playbooks from intent rather than a taxonomy gate', () => {
    expect(interpretMission('Build a balanced service agreement with termination terms.').specification.specialist.playbook_id).toBe('balanced-agreement')
    expect(interpretMission('Prepare the daily site report with photos and conflicting timestamps.').specification.specialist.playbook_id).toBe('field-service-report')
    expect(interpretMission('Create a cash flow forecast with variance analysis.').specification.specialist.playbook_id).toBe('financial-package')
  })

  it('makes an explicit Final Quality Control Report correction authoritative over prior routing', () => {
    const prior = interpretMission('Prepare a contract package for the project.').specification
    const result = interpretMission('Set the intended deliverable exactly to Final Quality Control Report. Do not substitute another deliverable type.', prior)
    expect(result.specification.artifact.recommended_type).toBe('final-qc-report')
    expect(result.specification.artifact.recommended_family).toBe('Quality control closeout')
    expect(result.specification.specialist.required_checks).toContain('test-result-traceability')
  })

  it('preserves the canonical final-qc-report slug through Claude interpretation', () => {
    const base = interpretMission('Prepare a contract package for the project.')
    const result = applyClaudeInterpretation(base, {
      recommendation: 'final-qc-report',
      rationale: 'The operator explicitly requested the consolidated acceptance record.',
    })
    expect(result.specification.artifact.recommended_type).toBe('final-qc-report')
    expect(result.specification.artifact.recommended_family).toBe('Quality control closeout')
  })

  it('does not append a conversational question beside authoritative specialist gaps', () => {
    const base = interpretMission('Prepare a final QC report for this project.')
    const result = applyClaudeInterpretation(base, {
      recommendation: 'final-qc-report',
      next_question: 'Who is the inspector or engineer of record for this report?',
    })
    expect(result.specification.content.open_questions).toHaveLength(executionGaps(result.specification).length)
    expect(result.specification.content.open_questions).not.toContain('Who is the inspector or engineer of record for this report?')
  })

  it('does not crash when Claude returns stated_facts as an object', () => {
    const prior = interpretMission('Prepare a contract package for the project.').specification
    const malformed = { acknowledgement: 'Received and resolved.', stated_facts: { key: 'unexpected-object' } } as unknown as Parameters<typeof promoteAcknowledgedGap>[0]
    expect(() => promoteAcknowledgedGap(malformed, 'Set the intended deliverable exactly to Final Quality Control Report.', prior)).not.toThrow()
  })

  it('keeps an explicitly requested proposal ahead of incidental financial caution language', () => {
    const result = interpretMission('Create an internal project proposal and do not invent financial claims.')
    expect(result.specification.artifact.recommended_type).toBe('proposal')
    expect(result.specification.specialist.playbook_id).toBe('field-service-proposal')
  })

  it('keeps an explicit cash-flow package ahead of executive and board language', () => {
    const result = interpretMission('Create a board-ready 2027 Cash Flow Forecast and Budget Package for the Executive Leadership Team and Board Finance Committee. Primary audience: Executive Leadership Team, CFO, Controller, and Board Finance Committee members. Required format: PDF.')
    expect(result.specification.artifact.recommended_type).toBe('cash-flow-budget-package')
    expect(result.specification.specialist.playbook_id).toBe('financial-package')
    expect(result.specification.audience.primary).toEqual(['Executive Leadership Team, CFO, Controller, and Board Finance Committee members'])
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
    expect(result.question).toContain('win themes')
    expect(result.specification.content.open_questions).not.toContain('What price or pricing structure should the recipient see?')
  })

  it('accepts Claude specialist routing when the natural request is ambiguous', () => {
    const result = applyClaudeInterpretation(interpretMission('Help me prepare this.'), { recommendation: 'capability-statement', rationale: 'The audience needs a concise qualifications summary.' })
    expect(result.specification.artifact.recommended_type).toBe('capability-statement')
    expect(result.specification.specialist.playbook_id).toBe('executive-capability')
  })

  it('maps a natural APOLLO brand selection without asking for an internal identifier', () => {
    const interpreted = applyClaudeInterpretation(interpretMission('Create a proposal for Acme.'), {
      next_question: 'What exact brand_profile_id should be applied?',
    })
    const result = applyExplicitMissionDirectives(interpreted, 'Use the approved APOLLO Mission Control brand and logo.')
    expect(result.specification.presentation.brand_profile_id).toBe('apollo')
    expect(result.specification.content.open_questions).not.toContain('What exact brand_profile_id should be applied?')
  })

  it('preserves a selected client brand through every later intake turn', () => {
    const prior = interpretMission('Create a proposal for Acme Facilities.').specification
    prior.presentation.brand_profile_id = 'kit:7607208b-e32f-4b67-a676-23d885ecd7f6'
    const result = interpretMission('Use a fixed fee of $18,750.', prior)
    expect(result.specification.presentation.brand_profile_id).toBe('kit:7607208b-e32f-4b67-a676-23d885ecd7f6')
  })

  it('promotes an acknowledged answer to the active specialist gap', () => {
    const prior = interpretMission('Create a fixed-fee proposal for Acme Facilities at $18,750.').specification
    const activeQuestion = prior.content.open_questions[0]
    const activeGap = executionGaps(prior)[0]
    const patch = promoteAcknowledgedGap({ acknowledgement: 'Received and resolved the requested methodology.' }, 'Phase 1: Inspect. Phase 2: Report.', prior)
    const result = applyClaudeInterpretation({ ...interpretMission('Create a fixed-fee proposal for Acme Facilities at $18,750.'), specification: prior, question: activeQuestion }, patch)
    expect(result.specification.content.facts).toEqual(expect.arrayContaining([expect.objectContaining({ key: activeGap.key, source: 'user', confidence: 1 })]))
    expect(result.question).not.toBe(activeQuestion)
  })

  it('does not mistake an evidence sourcing directive for the field value', () => {
    const prior = interpretMission('Create a 2027 cash flow forecast and budget package.').specification
    const patch = promoteAcknowledgedGap(
      { acknowledgement: 'Received and resolved from the supplied evidence.' },
      'Use the forecast period and figures directly from the attached workbook and management brief.',
      prior,
    )
    expect(patch.stated_facts).toBeUndefined()
  })

  it('does not promote the expert-recommendation command into the active factual gap', () => {
    const prior = interpretMission('Create a final quality control report from the attached field records.').specification
    const directive = 'Use your expert recommendations for every unresolved decision that can be responsibly inferred from the mission.'
    const patch = promoteAcknowledgedGap({ acknowledgement: 'Received and resolved.' }, directive, prior)
    expect(patch.stated_facts).toBeUndefined()
  })

  it('discards model-stated facts fabricated from the expert-recommendation command', () => {
    const base = interpretMission('Create a final quality control report from the attached field records.')
    const directive = 'Use your expert recommendations for every unresolved decision that can be responsibly inferred from the mission.'
    const patch = applyExpertRecommendationMode({ stated_facts: [{ key: 'inspector', label: 'Inspector', value: directive }] }, directive, base.specification)
    expect(patch.stated_facts).toEqual([])
  })

  it('fills safely inferable proposal defaults in expert recommendation mode', () => {
    const base = interpretMission('Create a fixed-fee proposal for Acme Facilities at $18,750.')
    const patch = applyExpertRecommendationMode({}, 'Use your expert recommendations for every unresolved decision.', base.specification)
    const result = applyClaudeInterpretation(base, patch)
    expect(result.specification.content.facts).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'proposed_methodology', source: 'inferred', confidence: .84 }),
      expect.objectContaining({ key: 'risks_and_mitigations', source: 'inferred' }),
      expect.objectContaining({ key: 'pricing_model', value: 'fixed-fee' }),
    ]))
    expect(result.specification.content.open_questions).not.toEqual(expect.arrayContaining([expect.stringContaining('proposed methodology'), expect.stringContaining('risks and mitigations')]))
  })

  it('treats evidence rescans as control messages instead of mission facts', () => {
    expect(isMissionControlDirective('Re-read every secured evidence source using multipass extraction.')).toBe(true)
    expect(isMissionControlDirective('Reconcile the complete secured evidence set against the selected deliverable before asking questions.')).toBe(true)
  })

  it('does not send evidence rescan control text through AI fact interpretation', async () => {
    const prior=interpretMission('Create a customer quote for site repairs.').specification
    const result=await interpretMissionWithClaude('Re-read every secured evidence source using multipass extraction. Reconcile all source-supported facts.',prior,50)
    expect(result.acknowledgement).toContain('Evidence recalibration completed')
    expect(result.specification.audience.primary).toEqual(prior.audience.primary)
  })

  it('fills exact quote validity and payment keys in expert recommendation mode', () => {
    const base = interpretMission('Create a customer quote for site repairs.')
    base.specification.content.facts.push({
      key:'quote_date',label:'Quote date',value:'September 16, 2026',normalized_value:'September 16, 2026',source:'evidence',source_reference:'source-1',capture_method:'file_extraction',confidence:1,verification_state:'verified',sensitivity:'confidential',last_editor:'apollo',updated_at:new Date().toISOString(),
    })
    const patch = applyExpertRecommendationMode({}, 'Use your expert recommendations for every unresolved decision.', base.specification)
    expect(patch.inferred_facts).toEqual(expect.arrayContaining([
      expect.objectContaining({ key:'valid_until', value:'2026-10-16' }),
      expect.objectContaining({ key:'payment_terms', value:'50% deposit / 50% on completion' }),
    ]))
  })

  it('does not fail expert mode when the model returns malformed inferred facts', () => {
    const base = interpretMission('Create a fixed-fee proposal for Acme Facilities at $18,750.')
    const malformed = { inferred_facts: { key: 'unexpected-object' } } as unknown as Parameters<typeof applyExpertRecommendationMode>[0]
    const patch = applyExpertRecommendationMode(malformed, 'Use your expert recommendations for every unresolved decision.', base.specification)
    expect(patch.inferred_facts).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'proposed_methodology' }),
      expect.objectContaining({ key: 'risks_and_mitigations' }),
    ]))
  })

  it('applies safe defaults automatically when operator involvement is autonomous', () => {
    const base = interpretMission('Create a fixed-fee proposal for Acme Facilities at $18,750.')
    const patch = applyExpertRecommendationMode({}, base.specification.mission.objective, base.specification, true)
    const result = applyClaudeInterpretation(base, patch)
    expect(result.specification.content.facts).toEqual(expect.arrayContaining([
      expect.objectContaining({ key: 'win_themes', source: 'inferred' }),
      expect.objectContaining({ key: 'proposed_methodology', source: 'inferred' }),
    ]))
    expect(result.specification.content.open_questions).not.toEqual(expect.arrayContaining([expect.stringContaining('win themes'), expect.stringContaining('proposed methodology')]))
  })

  it('changes active mission control without consuming the outstanding factual answer', async () => {
    const prior = interpretMission('Create a fixed-fee proposal for Acme Facilities at $18,750.').specification
    const activeQuestion = prior.content.open_questions[0]
    const result = await interpretMissionWithClaude('Operator involvement override: 0% (Fully Autonomous). Apply this control policy without answering a factual question.', prior, 0)
    expect(result.specification.aura.operator_involvement).toBe(0)
    expect(result.acknowledgement).toContain('Autonomous control engaged')
    expect(result.specification.content.open_questions).toContain(activeQuestion)
    expect(result.specification.content.facts).toEqual(expect.arrayContaining([expect.objectContaining({ key: 'proposed_methodology', source: 'inferred' })]))
  })
})
