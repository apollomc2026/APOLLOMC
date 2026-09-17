import { describe, expect, it } from 'vitest'
import { interpretMission } from '../lib/mission-control/interpreter'
import { canonicalDeliverableTitle, canonicalizeSpecificationIdentity } from '../lib/mission-control/identity'

describe('authoritative mission identity', () => {
  it('replaces placeholder mission titles with the selected catalog identity', () => {
    const specification=interpretMission('Prepare a quote for the attached scope.').specification
    expect(specification.mission.title).toBe('Untitled mission')
    const canonical=canonicalizeSpecificationIdentity(specification)
    expect(canonical.mission.title).toBe(canonicalDeliverableTitle(canonical))
    expect(canonical.mission.title.toLowerCase()).toContain('quote')
  })

  it('changes mission identity when an explicit deliverable correction changes the specification', () => {
    const prior=canonicalizeSpecificationIdentity(interpretMission('Prepare a field service report.').specification)
    const corrected=interpretMission('Set the intended deliverable exactly to Final Quality Control Report.',prior).specification
    const canonical=canonicalizeSpecificationIdentity(corrected)
    expect(canonical.artifact.recommended_type).toBe('final-qc-report')
    expect(canonical.mission.title).toBe(canonicalDeliverableTitle(canonical))
    expect(canonical.mission.title).not.toBe(prior.mission.title)
  })
})
