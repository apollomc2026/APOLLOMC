const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/upload/drive/v3'
const FOLDER_MIME = 'application/vnd.google-apps.folder'
import { driveRefreshToken } from '@/lib/integrations/google-drive-auth'

interface DriveFile {
  id: string
  name: string
  mimeType: string
  parents?: string[]
  webViewLink?: string
  appProperties?: Record<string, string>
  trashed?: boolean
  capabilities?: { canAddChildren?: boolean }
}

export interface DriveDraft {
  fileId: string
  parentId: string
  webViewLink: string
  name: string
}

export function googleDriveConfigured(): boolean {
  return ['GOOGLE_DRIVE_CLIENT_ID', 'GOOGLE_DRIVE_CLIENT_SECRET', 'GOOGLE_DRIVE_REFRESH_TOKEN']
    .every((name) => Boolean(process.env[name]?.trim()))
}

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function escapeQuery(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

async function accessToken(userId: string): Promise<string> {
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: required('GOOGLE_DRIVE_CLIENT_ID'),
      client_secret: required('GOOGLE_DRIVE_CLIENT_SECRET'),
      refresh_token: await driveRefreshToken(userId),
      grant_type: 'refresh_token',
    }),
    signal: AbortSignal.timeout(15_000),
  })
  const body = await response.json() as { access_token?: string; error?: string }
  if (!response.ok || !body.access_token) throw new Error(`Google Drive authorization failed${body.error ? `: ${body.error}` : ''}`)
  return body.access_token
}

async function driveFetch(path: string, token: string, init: RequestInit = {}): Promise<Response> {
  return fetch(path, {
    ...init,
    headers: { authorization: `Bearer ${token}`, ...(init.headers ?? {}) },
    signal: init.signal ?? AbortSignal.timeout(30_000),
  })
}

async function assertWritableFolder(folderId: string, token: string): Promise<void> {
  const fields = encodeURIComponent('id,mimeType,trashed,capabilities(canAddChildren)')
  const response = await driveFetch(`${DRIVE_API}/files/${encodeURIComponent(folderId)}?fields=${fields}&supportsAllDrives=true`, token)
  const folder = await response.json() as DriveFile & { error?: { message?: string } }
  if (!response.ok) throw new Error(`Google Drive destination is unavailable (${response.status})`)
  if (folder.mimeType !== FOLDER_MIME || folder.trashed) throw new Error('Google Drive destination is not an active folder')
  if (folder.capabilities?.canAddChildren === false) throw new Error('Google Drive destination is not writable')
}

async function findExisting(folderId: string, workOrderId: string, token: string): Promise<DriveFile | undefined> {
  const query = `'${escapeQuery(folderId)}' in parents and trashed = false and appProperties has { key='metisWorkOrderId' and value='${escapeQuery(workOrderId)}' }`
  const params = new URLSearchParams({
    q: query,
    spaces: 'drive',
    pageSize: '2',
    fields: 'files(id,name,mimeType,parents,webViewLink,appProperties)',
    supportsAllDrives: 'true',
    includeItemsFromAllDrives: 'true',
  })
  const response = await driveFetch(`${DRIVE_API}/files?${params}`, token)
  const body = await response.json() as { files?: DriveFile[] }
  if (!response.ok) throw new Error(`Google Drive idempotency lookup failed (${response.status})`)
  if ((body.files?.length ?? 0) > 1) throw new Error('Google Drive contains duplicate files for this work order')
  return body.files?.[0]
}

async function upload(
  method: 'POST' | 'PATCH',
  path: string,
  metadata: Record<string, unknown>,
  pdf: Buffer,
  token: string,
): Promise<DriveFile> {
  const boundary = `metis_${crypto.randomUUID().replace(/-/g, '')}`
  const prefix = Buffer.from(
    `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\nContent-Type: application/pdf\r\n\r\n`,
  )
  const suffix = Buffer.from(`\r\n--${boundary}--\r\n`)
  const response = await driveFetch(path, token, {
    method,
    headers: { 'content-type': `multipart/related; boundary=${boundary}` },
    body: Buffer.concat([prefix, pdf, suffix]),
    signal: AbortSignal.timeout(60_000),
  })
  const body = await response.json() as DriveFile & { error?: { message?: string } }
  if (!response.ok) throw new Error(`Google Drive upload failed (${response.status})`)
  if (!body.id || !body.webViewLink) throw new Error('Google Drive did not return a resolvable artifact')
  return body
}

export async function uploadDriveDraft(input: {
  userId?: string
  folderId: string
  workOrderId: string
  filename: string
  contentSha256: string
  pdf: Buffer
}): Promise<DriveDraft> {
  const token = await accessToken(input.userId ?? '')
  await assertWritableFolder(input.folderId, token)
  const existing = await findExisting(input.folderId, input.workOrderId, token)
  const metadata = {
    name: input.filename,
    mimeType: 'application/pdf',
    appProperties: {
      metisWorkOrderId: input.workOrderId,
      contentSha256: input.contentSha256,
      lifecycle: 'draft',
    },
    ...(existing ? {} : { parents: [input.folderId] }),
  }
  const fields = encodeURIComponent('id,name,mimeType,parents,webViewLink,appProperties')
  const file = existing?.appProperties?.contentSha256 === input.contentSha256
    ? existing
    : await upload(
      existing ? 'PATCH' : 'POST',
      existing
        ? `${DRIVE_UPLOAD_API}/files/${encodeURIComponent(existing.id)}?uploadType=multipart&fields=${fields}&supportsAllDrives=true`
        : `${DRIVE_UPLOAD_API}/files?uploadType=multipart&fields=${fields}&supportsAllDrives=true`,
      metadata,
      input.pdf,
      token,
    )
  if (!file.webViewLink || !file.parents?.includes(input.folderId)) throw new Error('Google Drive round-trip verification failed')
  return { fileId: file.id, parentId: input.folderId, webViewLink: file.webViewLink, name: file.name }
}
