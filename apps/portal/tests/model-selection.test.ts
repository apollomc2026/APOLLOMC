import { afterEach, describe, expect, it } from 'vitest'
import { modelFor, type TaskRole } from '../lib/ai/models'

const roles: TaskRole[] = [
  'mission_interpretation',
  'draft_compile',
  'structured_fill',
  'repair',
  'section_draft',
  'extraction',
]

describe('Claude model selection', () => {
  afterEach(() => {
    for (const role of roles) {
      delete process.env[`APOLLO_MODEL_${role.toUpperCase()}`]
    }
  })

  it('defaults every APOLLO role to Claude Sonnet 5', () => {
    for (const role of roles) {
      expect(modelFor(role)).toBe('claude-sonnet-5')
    }
  })

  it('allows a role-specific deployment override', () => {
    process.env.APOLLO_MODEL_EXTRACTION = 'claude-haiku-4-5'
    expect(modelFor('extraction')).toBe('claude-haiku-4-5')
    expect(modelFor('draft_compile')).toBe('claude-sonnet-5')
  })
})
