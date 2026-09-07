import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createDriveOAuthState, decryptDriveToken, encryptDriveToken, normalizeDriveReturnTo, verifyDriveOAuthState } from '@/lib/integrations/google-drive-auth'

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
    const state = createDriveOAuthState('user-1', '/dashboard?mission=0198f0f4-835b-7f95-8b91-2faf6db7d724')
    expect(verifyDriveOAuthState(state, 'user-1')).toEqual({ returnTo: '/dashboard?mission=0198f0f4-835b-7f95-8b91-2faf6db7d724' })
    expect(() => verifyDriveOAuthState(state, 'user-2')).toThrow(/state/)
    expect(() => verifyDriveOAuthState(`${state}tampered`, 'user-1')).toThrow(/state/)
  })

  it('only carries a safe APOLLO mission return path through OAuth', () => {
    expect(normalizeDriveReturnTo('https://attacker.example/dashboard')).toBe('/settings')
    expect(normalizeDriveReturnTo('//attacker.example/dashboard')).toBe('/settings')
    expect(normalizeDriveReturnTo('/archive')).toBe('/settings')
    expect(normalizeDriveReturnTo('/dashboard?mission=not-a-mission')).toBe('/dashboard')
  })
})
