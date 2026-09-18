import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  googleDriveConfigured: vi.fn(),
  getCatalog: vi.fn(),
}))

vi.mock('../lib/executor/google-drive', () => ({ googleDriveConfigured: mocks.googleDriveConfigured }))
vi.mock('../lib/apollo/packages-loader', () => ({ getCatalog: mocks.getCatalog }))

import { GET } from '../app/api/v1/capabilities/route'

describe('executor capability truthfulness', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.getCatalog.mockReturnValue({
      industries: [{ status: 'active', deliverables: [{ slug: 'proposal' }] }],
    })
  })

  it('distinguishes configured Drive infrastructure from user delivery readiness', async () => {
    mocks.googleDriveConfigured.mockReturnValue(true)

    const response = await GET()
    const body = await response.json()

    expect(body.health).toBe('healthy')
    expect(body.artifact_custody).toMatchObject({
      provider: 'google-drive',
      platform_configured: true,
      ready: false,
      readiness: 'user_connection_required',
      per_user_connection_required: true,
    })
  })

  it('reports degraded health when Drive infrastructure is incomplete', async () => {
    mocks.googleDriveConfigured.mockReturnValue(false)

    const response = await GET()
    const body = await response.json()

    expect(body.health).toBe('degraded')
    expect(body.artifact_custody).toMatchObject({
      platform_configured: false,
      ready: false,
      readiness: 'platform_configuration_required',
    })
  })

  it('never emits a blank service version when Git metadata is empty', async () => {
    mocks.googleDriveConfigured.mockReturnValue(true)
    process.env.VERCEL_GIT_COMMIT_SHA = '   '
    process.env.VERCEL_DEPLOYMENT_ID = 'dpl_apollo_pilot'
    const response = await GET()
    const body = await response.json()
    expect(body.service_version).toBe('dpl_apollo_pilot')
    delete process.env.VERCEL_GIT_COMMIT_SHA
    delete process.env.VERCEL_DEPLOYMENT_ID
  })
})
