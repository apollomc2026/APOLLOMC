import { describe, expect, it } from 'vitest'
import { createMissionFact, mergeMissionFacts } from '../lib/mission-control/contracts'

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
})
