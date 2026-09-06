export interface EvidenceExtraction { text?: string; safeForDirectRetrieval: boolean }
import Anthropic from '@anthropic-ai/sdk'
import { modelFor } from '@/lib/ai/models'
import { getModule } from '@/lib/apollo/packages-loader'
import type { MissionFact } from './contracts'

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
  if (!text?.trim() || !moduleSlug || !process.env.ANTHROPIC_API_KEY) return []
  const documentModule = getModule(moduleSlug)
  if (!documentModule) return []
  const fields = [...documentModule.required_fields, ...documentModule.optional_fields]
  const properties = Object.fromEntries(fields.map(field => [field.key, { type: 'string', description: field.label }]))
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({ model: modelFor('extraction'), max_tokens: 1800, system: 'Extract only values explicitly present in the evidence. Never infer, calculate, default, or fabricate. Use the exact field keys.', tools: [{ name: 'extract_evidence', description: 'Return only explicitly supported specialist fields.', input_schema: { type: 'object', properties } }], tool_choice: { type: 'tool', name: 'extract_evidence' }, messages: [{ role: 'user', content: text.slice(0, 80000) }] })
  const block = response.content.find(item => item.type === 'tool_use' && item.name === 'extract_evidence')
  if (!block || block.type !== 'tool_use') return []
  const labels = new Map(fields.map(field => [field.key, field.label]))
  return Object.entries(block.input as Record<string, unknown>).flatMap(([key, value]) => typeof value === 'string' && value.trim() && labels.has(key) ? [{ key, label: labels.get(key)!, value: value.trim().slice(0, 2000), source: 'evidence' as const, confidence: 1 }] : [])
}
