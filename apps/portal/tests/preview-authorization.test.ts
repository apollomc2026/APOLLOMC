import { beforeEach, describe, expect, it, vi } from 'vitest'
import { NextRequest } from 'next/server'

const mocks = vi.hoisted(() => ({
  requireAllowedUser: vi.fn(),
  getPresignedUrl: vi.fn(),
  createServerClient: vi.fn(),
}))

vi.mock('../lib/apollo/auth', () => ({ requireAllowedUser: mocks.requireAllowedUser }))
vi.mock('../lib/s3/client', () => ({ getPresignedUrl: mocks.getPresignedUrl }))
vi.mock('../lib/supabase/server', () => ({ createServerClient: mocks.createServerClient }))

import { GET } from '../app/api/delivery/preview/route'

function outputQuery(result: { data: { s3_key_preview: string } | null; error: Error | null }) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({ single: vi.fn(async () => result) })),
      })),
    })),
  }
}

describe('preview authorization', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAllowedUser.mockResolvedValue({
      ok: true,
      user: { userId: 'user-1', email: 'owner@example.com', name: null, avatar: null },
    })
    mocks.getPresignedUrl.mockResolvedValue('https://signed.example/preview')
  })

  it('rejects the retired raw-key contract', async () => {
    const response = await GET(new NextRequest('https://portal.apollomc.ai/api/delivery/preview?key=other-user/file.pdf'))

    expect(response.status).toBe(400)
    expect(mocks.getPresignedUrl).not.toHaveBeenCalled()
  })

  it('signs only the key resolved through the session-scoped output lookup', async () => {
    mocks.createServerClient.mockResolvedValue(outputQuery({
      data: { s3_key_preview: 'previews/owned/output.pdf' },
      error: null,
    }))

    const response = await GET(new NextRequest('https://portal.apollomc.ai/api/delivery/preview?output=output-1'))

    expect(response.status).toBe(200)
    expect(mocks.getPresignedUrl).toHaveBeenCalledWith('previews/owned/output.pdf', 300)
  })

  it('does not mint a URL when RLS hides the output', async () => {
    mocks.createServerClient.mockResolvedValue(outputQuery({ data: null, error: new Error('not found') }))

    const response = await GET(new NextRequest('https://portal.apollomc.ai/api/delivery/preview?output=other-output'))

    expect(response.status).toBe(404)
    expect(mocks.getPresignedUrl).not.toHaveBeenCalled()
  })
})
