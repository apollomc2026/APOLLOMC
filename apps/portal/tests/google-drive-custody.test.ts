import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    process.env.GOOGLE_DRIVE_REFRESH_TOKEN = 'refresh'
  })

  afterEach(() => {
    vi.restoreAllMocks()
    delete process.env.GOOGLE_DRIVE_CLIENT_ID
    delete process.env.GOOGLE_DRIVE_CLIENT_SECRET
    delete process.env.GOOGLE_DRIVE_REFRESH_TOKEN
  })

  it('uploads to the exact writable folder and returns a resolvable Drive link', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json({ access_token: 'token' }))
      .mockResolvedValueOnce(json({ id: folderId, mimeType: 'application/vnd.google-apps.folder', trashed: false, capabilities: { canAddChildren: true } }))
      .mockResolvedValueOnce(json({ files: [] }))
      .mockResolvedValueOnce(json({
        id: 'drive-file-1', name: 'report.pdf', mimeType: 'application/pdf',
        parents: [folderId], webViewLink: 'https://drive.google.com/file/d/drive-file-1/view',
        appProperties: { metisWorkOrderId: workOrderId, contentSha256: 'a'.repeat(64) },
      }))

    const result = await uploadDriveDraft({
      folderId, workOrderId, filename: 'report.pdf', contentSha256: 'a'.repeat(64), pdf: Buffer.from('pdf'),
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
      appProperties: { metisWorkOrderId: workOrderId, contentSha256: 'a'.repeat(64) },
    }
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json({ access_token: 'token' }))
      .mockResolvedValueOnce(json({ id: folderId, mimeType: 'application/vnd.google-apps.folder', trashed: false, capabilities: { canAddChildren: true } }))
      .mockResolvedValueOnce(json({ files: [existing] }))

    expect((await uploadDriveDraft({
      folderId, workOrderId, filename: 'report.pdf', contentSha256: 'a'.repeat(64), pdf: Buffer.from('pdf'),
    })).fileId).toBe('drive-file-1')
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('fails closed when the destination cannot accept children', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(json({ access_token: 'token' }))
      .mockResolvedValueOnce(json({ id: folderId, mimeType: 'application/vnd.google-apps.folder', trashed: false, capabilities: { canAddChildren: false } }))

    await expect(uploadDriveDraft({
      folderId, workOrderId, filename: 'report.pdf', contentSha256: 'a'.repeat(64), pdf: Buffer.from('pdf'),
    })).rejects.toThrow(/not writable/)
  })

  it('fails closed when OAuth credentials are absent', async () => {
    delete process.env.GOOGLE_DRIVE_REFRESH_TOKEN
    await expect(uploadDriveDraft({
      folderId, workOrderId, filename: 'report.pdf', contentSha256: 'a'.repeat(64), pdf: Buffer.from('pdf'),
    })).rejects.toThrow(/GOOGLE_DRIVE_REFRESH_TOKEN is not configured/)
  })
})
