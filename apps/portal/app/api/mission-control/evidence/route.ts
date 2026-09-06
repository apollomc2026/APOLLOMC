import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient } from '@/lib/supabase/server'
import { deleteFromS3, uploadToS3 } from '@/lib/s3/client'
import { evidenceMagicMatches, evidenceZipTooLarge, extractEvidence, extractEvidenceFacts } from '@/lib/mission-control/evidence'
import { executionGaps } from '@/lib/mission-control/work-order'
import type { DeliverableSpecification } from '@/lib/mission-control/contracts'

const ALLOWED = new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain', 'image/png', 'image/jpeg'])
const MAX_BYTES = 20 * 1024 * 1024

export async function POST(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const form = await request.formData()
  const file = form.get('file')
  const conversationId = String(form.get('conversation_id') ?? '')
  if (!(file instanceof File) || !conversationId) return NextResponse.json({ error: 'A file and conversation are required' }, { status: 400 })
  if (!ALLOWED.has(file.type) || file.size > MAX_BYTES) return NextResponse.json({ error: 'Unsupported file type or file exceeds 20 MB' }, { status: 415 })
  const db = await createClient()
  const owner = await db.from('apollo_conversations').select('id, current_spec_version').eq('id', conversationId).eq('user_id', allowed.user.userId).single()
  if (owner.error || !owner.data) return NextResponse.json({ error: 'Mission conversation was not found' }, { status: 404 })
  const current = await db.from('apollo_specification_versions').select('specification').eq('conversation_id', conversationId).eq('version', owner.data.current_spec_version).single()
  if (current.error || !current.data) return NextResponse.json({ error: 'Current mission specification was not found' }, { status: 409 })
  const prior = current.data.specification as DeliverableSpecification
  const moduleSlug = prior.artifact.recommended_type
  const bytes = Buffer.from(await file.arrayBuffer())
  if (!evidenceMagicMatches(bytes, file.type)) return NextResponse.json({ error: 'File content does not match its declared type' }, { status: 415 })
  if (evidenceZipTooLarge(bytes)) return NextResponse.json({ error: 'File expands beyond the safe extraction limit' }, { status: 413 })
  const id = randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storageKey = `mission-evidence/${conversationId}/${id}-${safeName}`
  await uploadToS3(storageKey, bytes, file.type)
  const originalHash = createHash('sha256').update(bytes).digest('hex')
  let extractionStatus: 'verified' | 'failed' = 'verified'
  let retrievalKey = storageKey; let retrievalMime = file.type; let retrievalHash = originalHash
  let extractedFacts: Awaited<ReturnType<typeof extractEvidenceFacts>> = []
  let extractedText: string | undefined
  try {
    const extracted = await extractEvidence(bytes, file.type)
    extractedText = extracted.text
    if (!extracted.safeForDirectRetrieval) {
      if (!extracted.text?.trim()) throw new Error('No retrievable text could be extracted')
      const derived = Buffer.from(extracted.text, 'utf8')
      retrievalKey = `${storageKey}.extracted.txt`; retrievalMime = 'text/plain'; retrievalHash = createHash('sha256').update(derived).digest('hex')
      await uploadToS3(retrievalKey, derived, retrievalMime)
    }
  } catch { extractionStatus = 'failed' }
  if (extractionStatus === 'verified') {
    try { extractedFacts = await extractEvidenceFacts(extractedText, moduleSlug) } catch { extractedFacts = [] }
  }
  const inserted = await db.from('apollo_conversation_evidence').insert({ id, conversation_id: conversationId, user_id: allowed.user.userId, original_name: file.name, storage_key: storageKey, content_sha256: originalHash, retrieval_storage_key: retrievalKey, retrieval_mime_type: retrievalMime, retrieval_sha256: retrievalHash, mime_type: file.type, size_bytes: file.size, extraction_status: extractionStatus, extracted_facts: extractedFacts }).select('id, original_name, extraction_status').single()
  if (inserted.error) {
    await Promise.allSettled([deleteFromS3(storageKey), ...(retrievalKey !== storageKey ? [deleteFromS3(retrievalKey)] : [])])
    return NextResponse.json({ error: inserted.error.message }, { status: 500 })
  }
  let specificationVersion: number | null = null; let readiness: number | null = null
  if (prior?.schema_version === '1.0') {
    const mergedFacts = [...new Map([...prior.content.facts, ...extractedFacts].map(fact => [fact.key, fact])).values()]
    const specification: DeliverableSpecification = { ...prior, sources: [...prior.sources.filter(source => source.id !== id), { id, name: file.name, status: extractionStatus }], content: { ...prior.content, facts: mergedFacts }, approval: { status: 'draft', approved_by: null, approved_at: null } }
    const gaps = executionGaps(specification)
    readiness = gaps.length ? Math.min(70, Math.max(50, mergedFacts.length * 8)) : 82
    specification.approval.status = readiness >= 75 ? 'ready' : 'draft'
    const committed = await db.rpc('apollo_commit_evidence_specification', { p_conversation_id: conversationId, p_specification: specification, p_content_hash: createHash('sha256').update(JSON.stringify(specification)).digest('hex'), p_readiness: readiness, p_status: specification.approval.status })
    if (committed.error) return NextResponse.json({ error: committed.error.message }, { status: 500 })
    specificationVersion = Number(committed.data)
    return NextResponse.json({ id, name: file.name, status: inserted.data.extraction_status, facts: extractedFacts, specification, specification_version: specificationVersion, readiness }, { status: 201 })
  }
  return NextResponse.json({ id, name: file.name, status: inserted.data.extraction_status, facts: extractedFacts, specification_version: specificationVersion, readiness }, { status: 201 })
}
