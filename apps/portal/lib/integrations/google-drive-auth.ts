import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import { createServiceClient } from '@/lib/supabase/server'

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

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

export function createDriveOAuthState(userId: string) {
  const payload = Buffer.from(JSON.stringify({ userId, nonce: randomBytes(16).toString('base64url'), exp: Date.now() + 10 * 60_000 })).toString('base64url')
  const signature = createHmac('sha256', key()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyDriveOAuthState(state: string, expectedUserId: string) {
  const [payload, supplied] = state.split('.')
  if (!payload || !supplied) throw new Error('Invalid Google Drive connection state')
  const expected = createHmac('sha256', key()).update(payload).digest()
  const actual = Buffer.from(supplied, 'base64url')
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) throw new Error('Invalid Google Drive connection state')
  const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { userId?: string; exp?: number }
  if (decoded.userId !== expectedUserId || !decoded.exp || decoded.exp < Date.now()) throw new Error('Expired Google Drive connection state')
}

export function googleDriveAuthorizationUrl(userId: string) {
  const redirectUri = `${required('NEXT_PUBLIC_APP_URL').replace(/\/$/, '')}/api/integrations/google-drive/callback`
  const params = new URLSearchParams({
    client_id: required('GOOGLE_DRIVE_CLIENT_ID'),
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: `${DRIVE_SCOPE} openid email`,
    access_type: 'offline',
    prompt: 'consent',
    include_granted_scopes: 'true',
    state: createDriveOAuthState(userId),
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

function emailFromIdToken(idToken?: string) {
  if (!idToken) return null
  try {
    const payload = JSON.parse(Buffer.from(idToken.split('.')[1], 'base64url').toString('utf8')) as { email?: string }
    return payload.email ?? null
  } catch { return null }
}

export async function saveDriveConnection(userId: string, token: { refresh_token: string; scope?: string; id_token?: string }) {
  const db = await createServiceClient()
  const encrypted = encryptDriveToken(token.refresh_token)
  const result = await db.from('apollo_google_drive_connections').upsert({
    user_id: userId,
    ...encrypted,
    google_email: emailFromIdToken(token.id_token),
    scope: token.scope ?? null,
    connected_at: new Date().toISOString(),
  }, { onConflict: 'user_id' })
  if (result.error) throw new Error(`Could not save Google Drive connection: ${result.error.message}`)
}

export async function driveConnectionStatus(userId: string) {
  const db = await createServiceClient()
  const result = await db.from('apollo_google_drive_connections').select('google_email,connected_at,updated_at').eq('user_id', userId).maybeSingle()
  if (result.error) return { connected: false as const, email: null, connectedAt: null }
  return { connected: Boolean(result.data), email: result.data?.google_email ?? null, connectedAt: result.data?.connected_at ?? null }
}

export async function driveRefreshToken(userId: string) {
  // Keep the deployment credential as a bootstrap/fallback path. This also lets
  // isolated executor tests run without constructing an unrelated database.
  if (!userId || !process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return required('GOOGLE_DRIVE_REFRESH_TOKEN')
  }
  const db = await createServiceClient()
  const result = await db.from('apollo_google_drive_connections').select('encrypted_refresh_token,token_iv,token_tag').eq('user_id', userId).maybeSingle()
  if (result.data) return decryptDriveToken(result.data)
  return required('GOOGLE_DRIVE_REFRESH_TOKEN')
}

export async function deleteDriveConnection(userId: string) {
  const db = await createServiceClient()
  const result = await db.from('apollo_google_drive_connections').delete().eq('user_id', userId)
  if (result.error) throw new Error(result.error.message)
}
