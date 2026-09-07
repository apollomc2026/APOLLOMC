import { describe, expect, it } from 'vitest'
import { isAllowedApolloEmail } from '../lib/apollo/auth'

describe('APOLLO operator allowlist', () => {
  it('always admits the exact APOLLO bootstrap operator identity', () => {
    expect(isAllowedApolloEmail('support@apollomc.ai', '')).toBe(true)
    expect(isAllowedApolloEmail(' SUPPORT@APOLLOMC.AI ', '')).toBe(true)
  })

  it('admits configured exact identities without granting domain-wide access', () => {
    expect(isAllowedApolloEmail('operator@example.com', 'operator@example.com')).toBe(true)
    expect(isAllowedApolloEmail('someone-else@apollomc.ai', '')).toBe(false)
    expect(isAllowedApolloEmail('support@themis.example', '')).toBe(false)
  })
})
