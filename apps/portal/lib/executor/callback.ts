import { createHmac } from 'node:crypto'
import type { ArtifactManifest, JobState } from './contracts'

export interface JobCallback {
  protocol_version: '1.0'
  event_id: string
  work_order_id: string
  executor_id: 'apollo-documents'
  sequence: number
  state: JobState
  progress_percent: number
  message: string
  retry_count: number
  missing_inputs: string[]
  artifacts: ArtifactManifest[]
  occurred_at: string
}

function callbackSecret(): string {
  const value = process.env.METIS_EXECUTOR_CALLBACK_SECRET ?? process.env.METIS_EXECUTOR_SHARED_SECRET
  if (!value || value.length < 32) throw new Error('METIS executor callback secret is not configured')
  return value
}

export function assertAllowedCallbackUrl(raw: string): URL {
  const url = new URL(raw)
  if (url.protocol !== 'https:') throw new Error('callback_url must use HTTPS')
  const allowed = (process.env.METIS_CALLBACK_ORIGINS ?? 'https://metis-sage.vercel.app')
    .split(',').map((value) => value.trim()).filter(Boolean)
  if (!allowed.includes(url.origin)) throw new Error('callback_url origin is not allowed')
  return url
}

export async function postCallback(urlRaw: string, event: JobCallback): Promise<void> {
  const url = assertAllowedCallbackUrl(urlRaw)
  const body = JSON.stringify(event)
  const timestamp = new Date().toISOString()
  const signature = createHmac('sha256', callbackSecret()).update(`${timestamp}\n${body}`).digest('hex')
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-apollo-timestamp': timestamp,
      'x-apollo-signature': signature,
    },
    body,
    signal: AbortSignal.timeout(15_000),
  })
  if (!response.ok) throw new Error(`METIS callback failed with ${response.status}`)
}
