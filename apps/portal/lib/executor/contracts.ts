import { createHash } from 'node:crypto'

export const JOB_STATES = [
  'accepted', 'queued', 'gathering-input', 'generating', 'validating',
  'rendering', 'reviewing', 'blocked', 'delivered', 'failed', 'cancelled',
] as const
export type JobState = (typeof JOB_STATES)[number]
export type DocumentFormat = 'pdf' | 'docx' | 'xlsx'

export interface DocumentSource {
  source_id: string
  name: string
  media_type: string
  retrieval_url: string
  content_sha256: string
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted'
  expires_at: string
}

export interface DocumentWorkOrder {
  protocol_version: '1.0'
  work_order_id: string
  idempotency_key: string
  project_id: string
  conversation_id: string
  task_id: string
  requested_by: string
  capability: string
  deliverable_type: string
  objective: string
  audience: string
  formats: DocumentFormat[]
  fields: Record<string, unknown>
  sources: DocumentSource[]
  brand_id: string
  style_id: string
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted'
  priority: 'critical' | 'high' | 'medium' | 'low'
  deadline?: string
  drive_destination: { folder_id: string; lifecycle: 'draft' }
  quality_gates: {
    schema_validation: true
    source_grounding: true
    independent_review: boolean
    deterministic_financial_verification: boolean
    human_approval_before_publish: true
  }
  callback_url: string
  created_at: string
}

export interface ArtifactManifest {
  artifact_id: string
  project_id: string
  conversation_id: string
  task_id: string
  title: string
  artifact_type: 'document'
  lifecycle: 'draft'
  storage_provider: 's3' | 'google-drive'
  storage_file_id: string
  storage_parent_id: string
  version: number
  content_sha256: string
  mime_type: string
  source_engine_id: string
  source_run_id: string
  created_at: string
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
const SHA256 = /^[a-f0-9]{64}$/
const FORMATS = new Set<DocumentFormat>(['pdf', 'docx', 'xlsx'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

export function parseWorkOrder(value: unknown): DocumentWorkOrder {
  if (!isRecord(value)) throw new Error('work order must be an object')
  const requiredStrings = [
    'work_order_id', 'idempotency_key', 'project_id', 'conversation_id', 'task_id',
    'requested_by', 'capability', 'deliverable_type', 'objective', 'audience',
    'brand_id', 'style_id', 'sensitivity', 'priority', 'callback_url', 'created_at',
  ]
  for (const key of requiredStrings) {
    if (typeof value[key] !== 'string' || !(value[key] as string).trim()) throw new Error(`${key} is required`)
  }
  if (value.protocol_version !== '1.0') throw new Error('unsupported protocol_version')
  for (const key of ['work_order_id', 'conversation_id', 'task_id']) {
    if (!UUID.test(value[key] as string)) throw new Error(`${key} must be a UUID`)
  }
  if ((value.idempotency_key as string).length < 16) throw new Error('idempotency_key is too short')
  if (!Array.isArray(value.formats) || value.formats.length === 0 || value.formats.some((f) => !FORMATS.has(f as DocumentFormat))) {
    throw new Error('formats must contain supported formats')
  }
  if (!isRecord(value.fields)) throw new Error('fields must be an object')
  if (!Array.isArray(value.sources)) throw new Error('sources must be an array')
  for (const source of value.sources) {
    if (!isRecord(source)) throw new Error('each source must be an object')
    for (const key of ['source_id', 'name', 'media_type', 'retrieval_url', 'sensitivity', 'expires_at']) {
      if (typeof source[key] !== 'string' || !(source[key] as string).trim()) throw new Error(`source ${key} is required`)
    }
    if (typeof source.content_sha256 !== 'string' || !SHA256.test(source.content_sha256)) throw new Error('each source requires a valid content_sha256')
    const sourceUrl = new URL(source.retrieval_url as string)
    if (sourceUrl.protocol !== 'https:') throw new Error('source retrieval_url must use HTTPS')
    if (!Number.isFinite(Date.parse(source.expires_at as string))) throw new Error('source expires_at must be an ISO timestamp')
  }
  if (!isRecord(value.drive_destination) || value.drive_destination.lifecycle !== 'draft') {
    throw new Error('drive_destination must target draft lifecycle')
  }
  if (!isRecord(value.quality_gates) || value.quality_gates.schema_validation !== true || value.quality_gates.source_grounding !== true || value.quality_gates.human_approval_before_publish !== true) {
    throw new Error('mandatory quality gates cannot be disabled')
  }
  const callbackUrl = new URL(value.callback_url as string)
  if (callbackUrl.protocol !== 'https:') throw new Error('callback_url must use HTTPS')
  if (!Number.isFinite(Date.parse(value.created_at as string))) throw new Error('created_at must be an ISO timestamp')
  return value as unknown as DocumentWorkOrder
}

export function workOrderDigest(order: DocumentWorkOrder): string {
  return createHash('sha256').update(JSON.stringify(order)).digest('hex')
}
