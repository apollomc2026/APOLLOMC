import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/integrations/google-drive-auth', () => ({
  driveRefreshToken: vi.fn(async (userId: string) => {
    if (!userId) throw new Error('An authenticated APOLLO user is required for Google Drive custody')
    return 'refresh'
  }),
}))

import { uploadDriveDraft } from '../lib/executor/google-drive'

const folderId = 'drive-folder-123'
const workOrderId = '00000000-0000-4000-8000-000000000301'

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })
}

describe('Google Drive draft custody', () => {
  beforeEach(() => {
    process.env.GOOGLE_DRIVE_CLIENT_ID = 'client'
    process.env.GOOGLE_DRIVE_CLIENT_SECRET = 'secret'
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://example.supabase.co'
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.GOOGLE_DRIVE_CLIENT_ID
    delete process.env.GOOGLE_DRIVE_CLIENT_SECRET
    delete process.env.NEXT_PUBLIC_SUPABASE_URL
    delete process.env.SUPABASE_SERVICE_ROLE_KEY
  })

  it('uploads to the exact writable folder and returns a resolvable Drive link', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json({ access_token: 'token' }))
      .mockResolvedValueOnce(json({ id: folderId, mimeType: 'application/vnd.google-apps.folder', trashed: false, capabilities: { canAddChildren: true } }))
      .mockResolvedValueOnce(json({ files: [] }))
      .mockResolvedValueOnce(json({
        id: 'drive-file-1', name: 'report.pdf', mimeType: 'application/pdf',
        parents: [folderId], webViewLink: 'https://drive.google.com/file/d/drive-file-1/view',
        appProperties: { apolloWorkOrderId: workOrderId, contentSha256: 'a'.repeat(64) },
      }))

    const result = await uploadDriveDraft({
      userId: 'user-1', folderId, workOrderId, filename: 'report.pdf', contentSha256: 'a'.repeat(64), pdf: Buffer.from('pdf'),
    })

    expect(result).toEqual({
      fileId: 'drive-file-1',
      parentId: folderId,
      webViewLink: 'https://drive.google.com/file/d/drive-file-1/view',
      name: 'report.pdf',
    })
    const uploadCall = fetchMock.mock.calls[3]
    expect(String(uploadCall?.[0])).toContain('uploadType=multipart')
    expect(String(uploadCall?.[1]?.body)).toContain(folderId)
  })

  it('returns the existing matching file without creating a duplicate', async () => {
    const existing = {
      id: 'drive-file-1', name: 'report.pdf', mimeType: 'application/pdf',
      parents: [folderId], webViewLink: 'https://drive.google.com/file/d/drive-file-1/view',
      appProperties: { apolloWorkOrderId: workOrderId, contentSha256: 'a'.repeat(64) },
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json({ access_token: 'token' }))
      .mockResolvedValueOnce(json({ id: folderId, mimeType: 'application/vnd.google-apps.folder', trashed: false, capabilities: { canAddChildren: true } }))
      .mockResolvedValueOnce(json({ files: [existing] }))

    expect((await uploadDriveDraft({
      userId: 'user-1', folderId, workOrderId, filename: 'report.pdf', contentSha256: 'a'.repeat(64), pdf: Buffer.from('pdf'),
    })).fileId).toBe('drive-file-1')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('fails closed when the destination cannot accept children', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json({ access_token: 'token' }))
      .mockResolvedValueOnce(json({ id: folderId, mimeType: 'application/vnd.google-apps.folder', trashed: false, capabilities: { canAddChildren: false } }))

    await expect(uploadDriveDraft({
      userId: 'user-1', folderId, workOrderId, filename: 'report.pdf', contentSha256: 'a'.repeat(64), pdf: Buffer.from('pdf'),
    })).rejects.toThrow(/not writable/)
  })

  it('fails closed when an authenticated APOLLO user is absent', async () => {
    await expect(uploadDriveDraft({
      userId: '', folderId, workOrderId, filename: 'report.pdf', contentSha256: 'a'.repeat(64), pdf: Buffer.from('pdf'),
    })).rejects.toThrow(/authenticated APOLLO user/)
  })
})
