import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDriveOAuthState, decryptDriveToken, encryptDriveToken, verifyDriveOAuthState } from '@/lib/integrations/google-drive-auth'

describe('Google Drive integration credentials', () => {
  beforeEach(() => { process.env.WORKER_SECRET_KEY = 'test-worker-secret-with-sufficient-entropy' })
  afterEach(() => { delete process.env.WORKER_SECRET_KEY })

  it('encrypts refresh tokens at rest and decrypts them for execution', () => {
    const token = 'refresh-token-value'
    const encrypted = encryptDriveToken(token)
    expect(encrypted.encrypted_refresh_token).not.toContain(token)
    expect(decryptDriveToken(encrypted)).toBe(token)
  })

  it('binds OAuth state to the authenticated APOLLO user', () => {
    const state = createDriveOAuthState('user-1')
    expect(() => verifyDriveOAuthState(state, 'user-1')).not.toThrow()
    expect(() => verifyDriveOAuthState(state, 'user-2')).toThrow(/state/)
    expect(() => verifyDriveOAuthState(`${state}tampered`, 'user-1')).toThrow(/state/)
  })
})
