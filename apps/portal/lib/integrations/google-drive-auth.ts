import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/server'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'
const DRIVE_API = 'https://www.googleapis.com/drive/v3'
const DRIVE_UPLOAD_API = 'https://www.googleapis.com/drive/v3/files'
const CUSTODY_FOLDER_NAME = 'APOLLO Mission Control'

function required(name: string): string {
  const value = process.env[name]?.trim()
  if (!value) throw new Error(`${name} is not configured`)
  return value
}

function key(): Buffer {
  return createHash('sha256').update(required('WORKER_SECRET_KEY')).digest()
}

export function encryptDriveToken(token: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', key(), iv)
  const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()])
  return {
    encrypted_refresh_token: encrypted.toString('base64url'),
    token_iv: iv.toString('base64url'),
    token_tag: cipher.getAuthTag().toString('base64url'),
  }
}

export function decryptDriveToken(input: { encrypted_refresh_token: string; token_iv: string; token_tag: string }) {
  const decipher = createDecipheriv('aes-256-gcm', key(), Buffer.from(input.token_iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(input.token_tag, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(input.encrypted_refresh_token, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

export function normalizeDriveReturnTo(value?: string | null) {
  if (!value) return '/settings'
  try {
    const candidate = new URL(value, 'https://apollo.invalid')
    if (candidate.origin !== 'https://apollo.invalid') return '/settings'
    if (candidate.pathname === '/settings') return '/settings'
    if (candidate.pathname !== '/dashboard') return '/settings'
    const mission = candidate.searchParams.get('mission')
    if (!mission || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(mission)) return '/dashboard'
    return `/dashboard?mission=${encodeURIComponent(mission)}`
  } catch {
    return '/settings'
  }
}

export function createDriveOAuthState(userId: string, returnTo?: string | null) {
  const payload = Buffer.from(JSON.stringify({ userId, returnTo: normalizeDriveReturnTo(returnTo), nonce: randomBytes(16).toString('base64url'), exp: Date.now() + 10 * 60_000 })).toString('base64url')
  const signature = createHmac('sha256', key()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyDriveOAuthState(state: string, expectedUserId: string) {
  const [payload, supplied] = state.split('.')
  if (!payload || !supplied) throw new Error('Invalid Google Drive connection state')
  const expected = createHmac('sha256', key()).update(payload).digest()
  const actual = Buffer.from(supplied, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Invalid Google Drive connection state')
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId?: string; returnTo?: string; exp?: number }
  if (decoded.userId !== expectedUserId || !decoded.exp || decoded.exp < Date.now()) throw new Error('Expired Google Drive connection state')
  return { returnTo: normalizeDriveReturnTo(decoded.returnTo) }
}

export function googleDriveAuthorizationUrl(userId: string, returnTo?: string | null) {
  const redirectUri = `${required('NEXT_PUBLIC_APP_URL').replace(/\/$/, '')}/api/integrations/google-drive/callback`
  const params = new URLSearchParams({
    client_id: required('GOOGLE_DRIVE_CLIENT_ID'),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: `${DRIVE_SCOPE} openid email`,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state: createDriveOAuthState(userId, returnTo),
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeDriveAuthorizationCode(code: string) {
  const redirectUri = `${required('NEXT_PUBLIC_APP_URL').replace(/\/$/, '')}/api/integrations/google-drive/callback`
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: required('GOOGLE_DRIVE_CLIENT_ID'),
      client_secret: required('GOOGLE_DRIVE_CLIENT_SECRET'),
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
    signal: AbortSignal.timeout(15_000),
  })
  const body = await response.json() as { refresh_token?: string; access_token?: string; scope?: string; id_token?: string; error?: string }
  if (!response.ok || !body.refresh_token) throw new Error(`Google Drive connection failed${body.error ? `: ${body.error}` : ''}`)
  return body
}

async function googleIdentity(accessToken: string) {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15_000),
  })
  const body = await response.json() as { sub?: string; email?: string }
  if (!response.ok || !body.sub) throw new Error('Google account identity could not be verified')
  return { subject: body.sub, email: body.email ?? null }
}

async function ensureCustodyFolder(accessToken: string) {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.folder' and trashed=false and appProperties has { key='apolloCustodyRoot' and value='true' }")
  const fields = encodeURIComponent('files(id,name,trashed)')
  const list = await fetch(`${DRIVE_API}/files?q=${query}&spaces=drive&pageSize=2&fields=${fields}`, {
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(15_000),
  })
  const listed = await list.json() as { files?: Array<{ id: string; name: string }> }
  if (!list.ok) throw new Error(`Google Drive custody lookup failed (${list.status})`)
  if ((listed.files?.length ?? 0) > 1) throw new Error('Google Drive contains duplicate APOLLO custody folders')
  if (listed.files?.[0]) return listed.files[0]

  const create = await fetch(`${DRIVE_UPLOAD_API}?fields=id,name`, {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      name: CUSTODY_FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder',
      appProperties: { apolloCustodyRoot: 'true' },
    }),
    signal: AbortSignal.timeout(15_000),
  })
  const created = await create.json() as { id?: string; name?: string }
  if (!create.ok || !created.id) throw new Error(`Google Drive custody folder creation failed (${create.status})`)
  return { id: created.id, name: created.name ?? CUSTODY_FOLDER_NAME }
}

export async function saveDriveConnection(userId: string, token: { refresh_token: string; access_token: string; scope?: string }) {
  const db = await createServiceClient()
  const encrypted = encryptDriveToken(token.refresh_token)
  const [identity, folder] = await Promise.all([
    googleIdentity(token.access_token),
    ensureCustodyFolder(token.access_token),
  ])
  const result = await db.from('apollo_google_drive_connections').upsert({
    user_id: userId,
    ...encrypted,
    provider_subject: identity.subject,
    google_email: identity.email,
    scope: token.scope ?? null,
    custody_folder_id: folder.id,
    custody_folder_name: folder.name,
    revoked_at: null,
    connected_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (result.error) throw new Error(`Could not save Google Drive connection: ${result.error.message}`)
}

export async function driveConnectionStatus(userId: string) {
  const db = await createServiceClient()
  const result = await db.from('apollo_google_drive_connections').select('google_email,custody_folder_id,custody_folder_name,connected_at,updated_at').eq('user_id', userId).is('revoked_at', null).maybeSingle()
  if (result.error) return { connected: false as const, email: null, connectedAt: null }
  return { connected: Boolean(result.data?.custody_folder_id), email: result.data?.google_email ?? null, folderId: result.data?.custody_folder_id ?? null, folderName: result.data?.custody_folder_name ?? null, connectedAt: result.data?.connected_at ?? null }
}

export async function driveRefreshToken(userId: string) {
  if (!userId) throw new Error('An authenticated APOLLO user is required for Google Drive custody')
  const db = await createServiceClient()
  const result = await db.from('apollo_google_drive_connections').select('encrypted_refresh_token,token_iv,token_tag').eq('user_id', userId).is('revoked_at', null).maybeSingle()
  if (result.data) return decryptDriveToken(result.data)
  throw new Error('Google Drive must be connected for this APOLLO user')
}

export async function deleteDriveConnection(userId: string) {
  const db = await createServiceClient()
  const lookup = await db.from('apollo_google_drive_connections').select('encrypted_refresh_token,token_iv,token_tag').eq('user_id', userId).maybeSingle()
  if (lookup.error) throw new Error(lookup.error.message)
  if (!lookup.data) return
  const token = decryptDriveToken(lookup.data)
  const revoke = await fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }),
    signal: AbortSignal.timeout(15_000),
  })
  // Google returns 400 when a token is already invalid; either response means it
  // cannot remain an active APOLLO credential.
  if (!revoke.ok && revoke.status !== 400) throw new Error(`Google authorization revocation failed (${revoke.status})`)
  const result = await db.from('apollo_google_drive_connections').delete().eq('user_id', userId)
  if (result.error) throw new Error(result.error.message)
}
