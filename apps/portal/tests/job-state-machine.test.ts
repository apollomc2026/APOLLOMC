import { describe, expect, it } from 'vitest'
import { assertJobTransition, isJobTransitionAllowed, JOB_STATES } from '../lib/executor/contracts'

describe('APOLLO document job state machine', () => {
  it('permits only the forward execution spine and explicit terminal exits', () => {
    const spine = ['accepted', 'queued', 'gathering-input', 'generating', 'validating', 'rendering', 'reviewing', 'delivered'] as const
    for (let index = 0; index < spine.length - 1; index += 1) {
      expect(isJobTransitionAllowed(spine[index], spine[index + 1])).toBe(true)
    }
    for (const state of JOB_STATES.filter(value => !['delivered', 'failed', 'cancelled'].includes(value))) {
      expect(isJobTransitionAllowed(state, 'cancelled')).toBe(true)
    }
  })

  it('rejects backward, skipped, and post-terminal transitions', () => {
    expect(() => assertJobTransition('queued', 'accepted')).toThrow(/invalid document job transition/)
    expect(() => assertJobTransition('generating', 'rendering')).toThrow(/invalid document job transition/)
    expect(() => assertJobTransition('delivered', 'reviewing')).toThrow(/invalid document job transition/)
    expect(() => assertJobTransition('failed', 'queued')).toThrow(/invalid document job transition/)
  })

  it('allows an idempotent state write for retry-safe checkpoints', () => {
    expect(isJobTransitionAllowed('validating', 'validating')).toBe(true)
  })
})
