import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ rows: [] as Array<Record<string, unknown>>, getPresignedUrl: vi.fn() }))

vi.mock('../lib/supabase/server', () => ({
  createClient: vi.fn(async () => {
    const chain: Record<string, unknown> = {}
    chain.select = vi.fn(() => chain)
    chain.eq = vi.fn(() => chain)
    chain.in = vi.fn(async () => ({ data: mocks.rows, error: null }))
    return { from: vi.fn(() => chain) }
  }),
}))
vi.mock('../lib/s3/client', () => ({ getPresignedUrl: mocks.getPresignedUrl }))

import { refreshExecutionEvidence } from '../lib/mission-control/repository'

const expected = [{ source_id:'evidence-1', name:'scope.txt', media_type:'text/plain', retrieval_url:'https://expired.example/scope', content_sha256:'a'.repeat(64), sensitivity:'confidential' as const, expires_at:'2026-09-07T01:00:00.000Z' }]

describe('approved evidence refresh', () => {
  beforeEach(() => {
    mocks.getPresignedUrl.mockReset().mockResolvedValue('https://fresh.example/scope')
    mocks.rows = [{ id:'evidence-1', original_name:'scope.txt', retrieval_storage_key:'mission-evidence/scope.txt', retrieval_mime_type:'text/plain', retrieval_sha256:'a'.repeat(64) }]
  })

  it('rebinds only the approved manifest to a fresh retrieval URL', async () => {
    const refreshed = await refreshExecutionEvidence({ userId:'user-1', conversationId:'conversation-1', expectedSources:expected })
    expect(refreshed).toHaveLength(1)
    expect(refreshed[0]).toMatchObject({ source_id:'evidence-1', retrieval_url:'https://fresh.example/scope', content_sha256:'a'.repeat(64) })
    expect(Date.parse(refreshed[0].expires_at)).toBeGreaterThan(Date.parse(expected[0].expires_at))
  })

  it('rejects evidence whose durable hash no longer matches the approved manifest', async () => {
    mocks.rows[0].retrieval_sha256 = 'b'.repeat(64)
    await expect(refreshExecutionEvidence({ userId:'user-1', conversationId:'conversation-1', expectedSources:expected })).rejects.toThrow(/failed manifest verification/)
  })
})
