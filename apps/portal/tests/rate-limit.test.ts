import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  createServiceClient: vi.fn(),
  rpc: vi.fn(),
}))

vi.mock('../lib/supabase/server', () => ({
  createServiceClient: mocks.createServiceClient,
}))

import { rateLimit } from '../lib/apollo/ratelimit'

describe('production rate limiting', () => {
  beforeEach(() => {
    mocks.rpc.mockReset()
    mocks.createServiceClient.mockReset()
    mocks.createServiceClient.mockResolvedValue({ rpc: mocks.rpc })
  })

  afterEach(() => vi.unstubAllEnvs())

  it('returns the atomic database decision', async () => {
    mocks.rpc.mockResolvedValue({ data: [{ allowed: true, current_count: 3 }], error: null })
    await expect(rateLimit('mission:user', 30, 3600)).resolves.toEqual({ ok: true, count: 3 })
  })

  it('fails closed when the production RPC is unavailable', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    mocks.rpc.mockResolvedValue({ data: null, error: new Error('database unavailable') })
    await expect(rateLimit('mission:user', 30, 3600)).resolves.toEqual({ ok: false, count: 30 })
  })

  it('keeps local UI development usable without a database', async () => {
    vi.stubEnv('NODE_ENV', 'test')
    mocks.createServiceClient.mockRejectedValue(new Error('local database unavailable'))
    await expect(rateLimit('mission:user', 30, 3600)).resolves.toEqual({ ok: true, count: 0 })
  })
})
