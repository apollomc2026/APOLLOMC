import { describe, expect, it } from 'vitest'
import { createMissionFact, mergeMissionFacts, reconcileEquivalentMissionConflicts } from '../lib/mission-control/contracts'

describe('mission fact reconciliation', () => {
  const now = new Date('2026-09-07T14:00:00.000Z')

  it('marks differing evidence and user values as a preserved conflict', () => {
    const user = createMissionFact({ key: 'investment', label: 'Investment', value: '$18,500', source: 'user', confidence: 1 }, now)
    const evidence = createMissionFact({ key: 'investment', label: 'Investment', value: '$19,250', source: 'evidence', confidence: 1, source_reference: 'evidence-1' }, now)
    const [fact] = mergeMissionFacts([user], [evidence], now)
    expect(fact.verification_state).toBe('conflict')
    expect(fact.value).toBe('$18,500')
    expect(fact.conflicts).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: '$18,500', source: 'user' }),
      expect.objectContaining({ value: '$19,250', source: 'evidence', source_reference: 'evidence-1' }),
    ]))
  })

  it('treats equivalent formatting as corroboration rather than conflict', () => {
    const user = createMissionFact({ key: 'client', label: 'Client', value: 'Acme   Facilities', source: 'user', confidence: 1 }, now)
    const evidence = createMissionFact({ key: 'client', label: 'Client', value: 'acme facilities', source: 'evidence', confidence: 1, source_reference: 'evidence-2' }, now)
    const [fact] = mergeMissionFacts([user], [evidence], now)
    expect(fact.verification_state).toBe('verified')
    expect(fact.source_reference).toBe('evidence-2')
    expect(fact.conflicts).toBeUndefined()
  })

  it('treats equivalent date formats and a trailing state abbreviation as corroboration', () => {
    const facts = mergeMissionFacts([], [
      createMissionFact({ key:'quote_date', label:'Quote date', value:'2026-09-16', source:'evidence', source_reference:'source-a', confidence:1 }, now),
      createMissionFact({ key:'quote_date', label:'Quote date', value:'September 16, 2026', source:'evidence', source_reference:'source-b', confidence:1 }, now),
      createMissionFact({ key:'customer_name', label:'Customer name', value:'US Foods Seabrook', source:'evidence', source_reference:'source-a', confidence:1 }, now),
      createMissionFact({ key:'customer_name', label:'Customer name', value:'US Foods — Seabrook, NH', source:'evidence', source_reference:'source-b', confidence:1 }, now),
    ], now)
    expect(facts.find(fact=>fact.key==='quote_date')).toEqual(expect.objectContaining({verification_state:'verified'}))
    expect(facts.find(fact=>fact.key==='customer_name')).toEqual(expect.objectContaining({verification_state:'verified'}))
  })

  it('heals legacy equivalent conflicts while preserving their source custody', () => {
    const [conflict]=mergeMissionFacts([], [
      createMissionFact({key:'quote_date',label:'Quote date',value:'2026-09-16',source:'evidence',source_reference:'source-a',confidence:1},now),
      createMissionFact({key:'quote_date',label:'Quote date',value:'September 17, 2026',source:'evidence',source_reference:'source-b',confidence:1},now),
    ],now)
    const legacy={...conflict,conflicts:[
      {value:'2026-09-16',normalized_value:'2026-09-16',source:'evidence' as const,source_reference:'source-a'},
      {value:'September 16, 2026',normalized_value:'September 16, 2026',source:'evidence' as const,source_reference:'source-b'},
    ]}
    const [healed]=reconcileEquivalentMissionConflicts([legacy],now)
    expect(healed).toEqual(expect.objectContaining({verification_state:'verified',source_references:['source-a','source-b'],conflicts:undefined}))
  })

  it('lets verified evidence replace an earlier model inference', () => {
    const inferred = createMissionFact({ key: 'report_date', label: 'Report date', value: '2026-05-12', source: 'inferred', confidence: .6 }, now)
    const evidence = createMissionFact({ key: 'report_date', label: 'Report date', value: '2026-05-13', source: 'evidence', confidence: 1, source_reference: 'final-qc' }, now)
    const [fact] = mergeMissionFacts([inferred], [evidence], now)
    expect(fact).toEqual(expect.objectContaining({ value: '2026-05-13', source: 'evidence', verification_state: 'verified' }))
  })
})
