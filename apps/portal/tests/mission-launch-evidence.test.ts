import { describe, expect, it } from 'vitest'
import { missionObjectiveExpectsEvidence } from '@/components/mission-control/MissionLaunchStudio'

describe('mission launch evidence gate', () => {
  it('detects missions that explicitly depend on an attachment', () => {
    expect(missionObjectiveExpectsEvidence('Recreate the report I am adding as evidence.')).toBe(true)
    expect(missionObjectiveExpectsEvidence('Review the attached field service record.')).toBe(true)
    expect(missionObjectiveExpectsEvidence('Build a proposal from scratch.')).toBe(false)
  })
})
