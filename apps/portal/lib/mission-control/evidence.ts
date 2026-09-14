export interface EvidenceExtraction { text?: string; safeForDirectRetrieval: boolean }

const EVIDENCE_MIME_BY_EXTENSION: Record<string, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv', txt: 'text/plain', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
}

export function normalizeEvidenceMime(name: string, declaredMime: string): string | null {
  const extension = name.toLowerCase().split('.').pop() ?? ''
  const expected = EVIDENCE_MIME_BY_EXTENSION[extension]
  if (!expected) return null
  if (!declaredMime || declaredMime === 'application/octet-stream') return expected
  return declaredMime === expected ? expected : null
}
import Anthropic from '@anthropic-ai/sdk'
import type { ContentBlockParam } from '@anthropic-ai/sdk/resources/messages/messages'
import { modelFor } from '@/lib/ai/models'
import { getModule } from '@/lib/apollo/packages-loader'
import { createMissionFact, type MissionFact } from './contracts'

export function evidenceMagicMatches(bytes: Buffer, mime: string): boolean {
  const at = (signature: number[], offset = 0) => signature.every((value, index) => bytes[offset + index] === value)
  if (mime === 'application/pdf') return at([0x25, 0x50, 0x44, 0x46])
  if (mime === 'image/png') return at([0x89, 0x50, 0x4e, 0x47])
  if (mime === 'image/jpeg') return at([0xff, 0xd8, 0xff])
  if (mime.includes('officedocument')) return at([0x50, 0x4b, 0x03, 0x04])
  return mime === 'text/csv' || mime === 'text/plain'
}

export function evidenceZipTooLarge(bytes: Buffer, limit = 200 * 1024 * 1024): boolean {
  const floor = Math.max(0, bytes.length - 22 - 65536)
  let eocd = -1
  for (let index = bytes.length - 22; index >= floor; index--) if (bytes.readUInt32LE(index) === 0x06054b50) { eocd = index; break }
  if (eocd < 0) return false
  const count = bytes.readUInt16LE(eocd + 10); let offset = bytes.readUInt32LE(eocd + 16); let total = 0
  for (let index = 0; index < count; index++) {
    if (offset + 46 > bytes.length || bytes.readUInt32LE(offset) !== 0x02014b50) break
    total += bytes.readUInt32LE(offset + 24)
    if (total > limit) return true
    offset += 46 + bytes.readUInt16LE(offset + 28) + bytes.readUInt16LE(offset + 30) + bytes.readUInt16LE(offset + 32)
  }
  return false
}

export async function extractEvidence(bytes: Buffer, mime: string): Promise<EvidenceExtraction> {
  if (mime === 'text/plain' || mime === 'text/csv') return { text: bytes.toString('utf8').slice(0, 200000), safeForDirectRetrieval: true }
  if (mime.startsWith('image/')) return { safeForDirectRetrieval: true }
  if (mime === 'application/pdf') {
    try {
      const { PDFParse } = await import('pdf-parse')
      const parser = new PDFParse({ data: new Uint8Array(bytes) })
      try { return { text: (await parser.getText()).text?.slice(0, 200000), safeForDirectRetrieval: true } }
      finally { await parser.destroy().catch(() => {}) }
    } catch { return { safeForDirectRetrieval: true } }
  }
  if (mime.includes('wordprocessingml')) {
    const mammoth = await import('mammoth')
    const result = await mammoth.extractRawText({ buffer: bytes })
    return { text: result.value.slice(0, 200000), safeForDirectRetrieval: false }
  }
  if (mime.includes('spreadsheetml')) {
    const xlsx = await import('xlsx')
    const workbook = xlsx.read(bytes, { type: 'buffer' })
    const text = workbook.SheetNames.flatMap(name => [`=== ${name} ===`, xlsx.utils.sheet_to_csv(workbook.Sheets[name])]).join('\n').slice(0, 200000)
    return { text, safeForDirectRetrieval: false }
  }
  return { safeForDirectRetrieval: false }
}

export async function extractEvidenceFacts(text: string | undefined, moduleSlug: string | null): Promise<MissionFact[]> {
  return extractEvidenceFactsFromSources(text?.trim() ? [{ id: 'evidence', name: 'Evidence', text }] : [], moduleSlug)
}

export async function extractEvidenceFactsFromSources(
  sources: Array<{ id: string; name: string; text?: string }>,
  moduleSlug: string | null,
): Promise<MissionFact[]> {
  const readable = sources.filter(source => source.text?.trim()) as Array<{ id: string; name: string; text: string }>
  if (!readable.length || !moduleSlug || !process.env.ANTHROPIC_API_KEY) return []
  const documentModule = getModule(moduleSlug)
  if (!documentModule) return []
  const fields = [...documentModule.required_fields, ...documentModule.optional_fields]
  const sourceIds = readable.map(source => source.id)
  const properties = Object.fromEntries(fields.map(field => [field.key, {
    type: 'object',
    description: field.label,
    properties: {
      value: { type: 'string', description: `Exact evidence-supported value for ${field.label}` },
      source_id: { type: 'string', enum: sourceIds, description: 'ID of the source that directly supports this value' },
    },
    required: ['value', 'source_id'],
  }]))
  const evidenceText = readable
    .map(source => `=== SOURCE ${source.id}: ${source.name} ===\n${source.text.slice(0, 16000)}`)
    .join('\n\n')
    .slice(0, 80000)
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({ model: modelFor('extraction'), max_tokens: 6000, system: 'Extract only values explicitly present in the labeled evidence sources. Never infer, calculate, default, or fabricate. Use the exact field keys and cite the source ID that directly supports each value. Extract every supported required field before including optional fields.', tools: [{ name: 'extract_evidence', description: 'Return explicitly supported specialist fields with their source IDs, prioritizing all required fields before optional fields.', input_schema: { type: 'object', properties } }], tool_choice: { type: 'tool', name: 'extract_evidence' }, messages: [{ role: 'user', content: evidenceText }] })
  const block = response.content.find(item => item.type === 'tool_use' && item.name === 'extract_evidence')
  if (!block || block.type !== 'tool_use') return []
  const labels = new Map(fields.map(field => [field.key, field.label]))
  return Object.entries(block.input as Record<string, unknown>).flatMap(([key, raw]) => {
    if (!raw || typeof raw !== 'object' || !labels.has(key)) return []
    const value = 'value' in raw && typeof raw.value === 'string' ? raw.value.trim() : ''
    const sourceReference = 'source_id' in raw && typeof raw.source_id === 'string' && sourceIds.includes(raw.source_id) ? raw.source_id : null
    return value && sourceReference ? [createMissionFact({ key, label: labels.get(key)!, value: value.slice(0, 2000), source: 'evidence', source_reference: sourceReference, confidence: 1, sensitivity: 'confidential' })] : []
  })
}

export async function extractEvidenceFactsFromPdfs(
  sources: Array<{ id: string; name: string; bytes: Buffer }>,
  moduleSlug: string | null,
): Promise<MissionFact[]> {
  if (!sources.length || !moduleSlug || !process.env.ANTHROPIC_API_KEY) return []
  const documentModule = getModule(moduleSlug)
  if (!documentModule) return []
  const fields = [...documentModule.required_fields, ...documentModule.optional_fields]
  const selected = sources.slice(0, 3)
  const sourceIds = selected.map(source => source.id)
  const properties = Object.fromEntries(fields.map(field => [field.key, {
    type: 'object', description: field.label,
    properties: {
      value: { type: 'string', description: `Exact evidence-supported value for ${field.label}` },
      source_id: { type: 'string', enum: sourceIds, description: 'ID of the PDF that directly supports this value' },
    },
    required: ['value', 'source_id'],
  }]))
  const content: ContentBlockParam[] = selected.flatMap(source => [
    { type: 'text' as const, text: `SOURCE ID: ${source.id} — ${source.name}` },
    { type: 'document' as const, title: source.name, source: { type: 'base64' as const, media_type: 'application/pdf' as const, data: source.bytes.toString('base64') } },
  ])
  content.push({ type: 'text', text: 'Extract every explicitly supported required field from these PDFs. Do not infer missing client facts.' })
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({ model: modelFor('extraction'), max_tokens: 6000, system: 'Extract only values explicitly present in the labeled PDF evidence. Never infer, calculate, default, or fabricate. Use the exact field keys and cite the source ID that directly supports each value.', tools: [{ name: 'extract_evidence', description: 'Return explicitly supported specialist fields with their source IDs.', input_schema: { type: 'object', properties } }], tool_choice: { type: 'tool', name: 'extract_evidence' }, messages: [{ role: 'user', content }] })
  const block = response.content.find(item => item.type === 'tool_use' && item.name === 'extract_evidence')
  if (!block || block.type !== 'tool_use') return []
  const labels = new Map(fields.map(field => [field.key, field.label]))
  return Object.entries(block.input as Record<string, unknown>).flatMap(([key, raw]) => {
    if (!raw || typeof raw !== 'object' || !labels.has(key)) return []
    const value = 'value' in raw && typeof raw.value === 'string' ? raw.value.trim() : ''
    const sourceReference = 'source_id' in raw && typeof raw.source_id === 'string' && sourceIds.includes(raw.source_id) ? raw.source_id : null
    return value && sourceReference ? [createMissionFact({ key, label: labels.get(key)!, value: value.slice(0, 2000), source: 'evidence', source_reference: sourceReference, confidence: 1, sensitivity: 'confidential' })] : []
  })
}
