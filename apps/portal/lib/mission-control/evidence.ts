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

export function evidenceFactsFromToolInput(
  input: Record<string, unknown>,
  fields: Array<{ key: string; label: string }>,
  sourceIds: string[],
): MissionFact[] {
  const labels = new Map(fields.map(field => [field.key, field.label]))
  return Object.entries(input).flatMap(([key, raw]) => {
    if (!labels.has(key)) return []
    const candidates = Array.isArray(raw) ? raw : [raw]
    return candidates.flatMap(candidate => {
      if (!candidate || typeof candidate !== 'object') return []
      const value = 'value' in candidate && typeof candidate.value === 'string' ? candidate.value.trim() : ''
      const sourceReference = 'source_id' in candidate && typeof candidate.source_id === 'string' && sourceIds.includes(candidate.source_id) ? candidate.source_id : null
      return value && sourceReference ? [createMissionFact({ key, label: labels.get(key)!, value:value.slice(0, 2000), source:'evidence', source_reference:sourceReference, confidence:1, sensitivity:'confidential' })] : []
    })
  })
}

export function batchEvidenceSources<T>(sources:T[], batchSize:number):T[][] {
  if (!Number.isInteger(batchSize) || batchSize < 1) throw new Error('Evidence batch size must be a positive integer')
  return Array.from({ length:Math.ceil(sources.length / batchSize) }, (_, index) => sources.slice(index * batchSize, (index + 1) * batchSize))
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
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const facts: MissionFact[] = []
  for (const batch of batchEvidenceSources(readable, 4)) {
    const sourceIds = batch.map(source => source.id)
    const properties = evidenceToolProperties(fields, sourceIds, 'source')
    const evidenceText = batch.map(source => `=== SOURCE ${source.id}: ${source.name} ===\n${source.text.slice(0, 16000)}`).join('\n\n')
    const response = await client.messages.create({ model:modelFor('extraction'), max_tokens:6000, system:'Extract only values explicitly present in the labeled evidence sources. Never infer, calculate, default, or fabricate. Use the exact field keys and cite the source ID that directly supports each value. For each field, return every distinct source-supported candidate; never choose between contradictory sources. Extract every supported required field before including optional fields.', tools:[{ name:'extract_evidence', description:'Return all explicitly supported specialist-field candidates with their source IDs, preserving contradictions for reconciliation.', input_schema:{ type:'object', properties } }], tool_choice:{ type:'tool', name:'extract_evidence' }, messages:[{ role:'user', content:evidenceText }] })
    const block = response.content.find(item => item.type === 'tool_use' && item.name === 'extract_evidence')
    if (block?.type === 'tool_use') facts.push(...evidenceFactsFromToolInput(block.input as Record<string, unknown>, fields, sourceIds))
  }
  return facts
}

function evidenceToolProperties(fields: Array<{ key:string; label:string }>, sourceIds:string[], sourceLabel:'source'|'PDF') {
  return Object.fromEntries(fields.map(field => [field.key, {
    type:'array', description:`${field.label}. Return one candidate per directly supporting ${sourceLabel}, including every contradictory value.`,
    items:{ type:'object', properties:{ value:{ type:'string', description:`Exact evidence-supported value for ${field.label}` }, source_id:{ type:'string', enum:sourceIds, description:`ID of the ${sourceLabel} that directly supports this candidate` } }, required:['value','source_id'] },
  }]))
}

export async function extractEvidenceFactsFromPdfs(
  sources: Array<{ id: string; name: string; bytes: Buffer }>,
  moduleSlug: string | null,
): Promise<MissionFact[]> {
  if (!sources.length || !moduleSlug || !process.env.ANTHROPIC_API_KEY) return []
  const documentModule = getModule(moduleSlug)
  if (!documentModule) return []
  const fields = [...documentModule.required_fields, ...documentModule.optional_fields]
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const facts: MissionFact[] = []
  for (const batch of batchEvidenceSources(sources, 3)) {
    const sourceIds = batch.map(source => source.id)
    const properties = evidenceToolProperties(fields, sourceIds, 'PDF')
    const content: ContentBlockParam[] = batch.flatMap(source => [{ type:'text' as const, text:`SOURCE ID: ${source.id} — ${source.name}` }, { type:'document' as const, title:source.name, source:{ type:'base64' as const, media_type:'application/pdf' as const, data:source.bytes.toString('base64') } }])
    content.push({ type:'text', text:'Extract every explicitly supported required field from these PDFs. Return every conflicting candidate and do not infer missing client facts.' })
    const response = await client.messages.create({ model:modelFor('extraction'), max_tokens:6000, system:'Extract only values explicitly present in the labeled PDF evidence. Never infer, calculate, default, or fabricate. Use the exact field keys and cite the source ID that directly supports each value. For each field, return every distinct source-supported candidate; never choose between contradictory PDFs.', tools:[{ name:'extract_evidence', description:'Return all explicitly supported specialist-field candidates with their PDF source IDs, preserving contradictions for reconciliation.', input_schema:{ type:'object', properties } }], tool_choice:{ type:'tool', name:'extract_evidence' }, messages:[{ role:'user', content }] })
    const block = response.content.find(item => item.type === 'tool_use' && item.name === 'extract_evidence')
    if (block?.type === 'tool_use') facts.push(...evidenceFactsFromToolInput(block.input as Record<string, unknown>, fields, sourceIds))
  }
  return facts
}
