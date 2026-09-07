import { createHmac, timingSafeEqual } from 'node:crypto'

const MAX_SKEW_MS = 5 * 60 * 1000

function secret(): string {
  const value = process.env.APOLLO_EXECUTOR_SHARED_SECRET ?? process.env.WORKER_SECRET_KEY
  if (!value || value.length < 32) throw new Error('APOLLO executor authentication is not configured')
  return value
}

export function signaturePayload(timestamp: string, method: string, pathname: string, body: string): string {
  return `${timestamp}\n${method.toUpperCase()}\n${pathname}\n${body}`
}

export function signExecutorRequest(timestamp: string, method: string, pathname: string, body: string): string {
  return createHmac('sha256', secret()).update(signaturePayload(timestamp, method, pathname, body)).digest('hex')
}

export function verifyExecutorRequest(request: Request, body: string): { ok: true } | { ok: false; error: string } {
  const timestamp = request.headers.get('x-apollo-timestamp') ?? ''
  const supplied = request.headers.get('x-apollo-signature') ?? ''
  const parsed = Date.parse(timestamp)
  if (!Number.isFinite(parsed) || Math.abs(Date.now() - parsed) > MAX_SKEW_MS) return { ok: false, error: 'stale or invalid timestamp' }
  if (!/^[a-f0-9]{64}$/.test(supplied)) return { ok: false, error: 'invalid signature' }
  const expected = signExecutorRequest(timestamp, request.method, new URL(request.url).pathname, body)
  const valid = timingSafeEqual(Buffer.from(supplied, 'hex'), Buffer.from(expected, 'hex'))
  return valid ? { ok: true } : { ok: false, error: 'invalid signature' }
}
