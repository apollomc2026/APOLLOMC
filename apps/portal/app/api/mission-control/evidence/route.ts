import { createHash, randomUUID } from 'node:crypto'
import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createClient } from '@/lib/supabase/server'
import { deleteFromS3, getPresignedUrl, uploadToS3 } from '@/lib/s3/client'
import { evidenceMagicMatches, evidenceZipTooLarge, extractEvidence, extractEvidenceFactsFromArtifact, MAX_EVIDENCE_BYTES, normalizeEvidenceMime, prepareEvidenceRetrieval, sanitizeEvidenceBytes } from '@/lib/mission-control/evidence'
import { type DeliverableSpecification } from '@/lib/mission-control/contracts'
import { mergeEvidenceIntoSpecification } from '@/lib/mission-control/evidence-specification'

const ALLOWED = new Set(['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv', 'text/plain', 'image/png', 'image/jpeg'])

interface EvidenceLedgerRow {
  id: string
  conversation_id: string
  original_name: string
  mime_type: string
  size_bytes: number
  extraction_status: string
  extracted_facts: unknown
  storage_key: string | null
  created_at: string
  apollo_conversations: { title?: string | null } | null
}

export async function GET() {
  if (process.env.PLAYWRIGHT_TESTING === 'true') return NextResponse.json({ evidence: [{ id: 'ev-demo', conversation_id: 'mission-demo', mission: 'Field Operations Proposal', name: 'site-survey.pdf', mime_type: 'application/pdf', size_bytes: 482300, status: 'verified', fact_count: 7, created_at: '2026-09-06T12:00:00.000Z', download_url: null }] })
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const db = await createClient()
  const result = await db.from('apollo_conversation_evidence').select('id, conversation_id, original_name, mime_type, size_bytes, extraction_status, extracted_facts, storage_key, created_at, apollo_conversations!inner(title)').eq('user_id', allowed.user.userId).order('created_at', { ascending: false })
  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 })
  const evidenceRows = (result.data ?? []) as unknown as EvidenceLedgerRow[]
  const evidence = await Promise.all(evidenceRows.map(async row => ({ id: row.id, conversation_id: row.conversation_id, mission: row.apollo_conversations?.title ?? 'Untitled mission', name: row.original_name, mime_type: row.mime_type, size_bytes: row.size_bytes, status: row.extraction_status, fact_count: Array.isArray(row.extracted_facts) ? row.extracted_facts.length : 0, created_at: row.created_at, download_url: row.storage_key ? await getPresignedUrl(row.storage_key, 300).catch(() => null) : null })))
  return NextResponse.json({ evidence })
}

export async function POST(request: Request) {
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const form = await request.formData()
  const file = form.get('file')
  const conversationId = String(form.get('conversation_id') ?? '')
  if (!(file instanceof File) || !conversationId) return NextResponse.json({ error: 'A file and conversation are required' }, { status: 400 })
  const mimeType = normalizeEvidenceMime(file.name, file.type)
  if (!mimeType || !ALLOWED.has(mimeType) || file.size > MAX_EVIDENCE_BYTES) return NextResponse.json({ error: 'Unsupported file type or file exceeds 20 MB' }, { status: 415 })
  const db = await createClient()
  const owner = await db.from('apollo_conversations').select('id, current_spec_version').eq('id', conversationId).eq('user_id', allowed.user.userId).single()
  if (owner.error || !owner.data) return NextResponse.json({ error: 'Mission conversation was not found' }, { status: 404 })
  const current = await db.from('apollo_specification_versions').select('specification').eq('conversation_id', conversationId).eq('version', owner.data.current_spec_version).single()
  if (current.error || !current.data) return NextResponse.json({ error: 'Current mission specification was not found' }, { status: 409 })
  const prior = current.data.specification as DeliverableSpecification
  const moduleSlug = prior.artifact.recommended_type
  const receivedBytes = Buffer.from(await file.arrayBuffer())
  if (!evidenceMagicMatches(receivedBytes, mimeType)) return NextResponse.json({ error: 'File content does not match its declared type' }, { status: 415 })
  let bytes: Buffer
  try { bytes = await sanitizeEvidenceBytes(receivedBytes, mimeType) }
  catch { return NextResponse.json({ error: 'Image could not be safely normalized for evidence custody' }, { status: 415 }) }
  if (evidenceZipTooLarge(bytes)) return NextResponse.json({ error: 'File expands beyond the safe extraction limit' }, { status: 413 })
  const id = randomUUID()
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const storageKey = `mission-evidence/${conversationId}/${id}-${safeName}`
  await uploadToS3(storageKey, bytes, mimeType)
  const originalHash = createHash('sha256').update(bytes).digest('hex')
  let extractionStatus: 'verified' | 'failed' = 'verified'
  let retrievalKey = storageKey; let retrievalMime = mimeType; let retrievalHash = originalHash
  let extractedFacts: Awaited<ReturnType<typeof extractEvidenceFactsFromArtifact>> = []
  let extractedText: string | undefined
  try {
    const extracted = await extractEvidence(bytes, mimeType)
    extractedText = extracted.text
    const retrieval = prepareEvidenceRetrieval(bytes, mimeType, extracted)
    retrievalMime = retrieval.mime
    retrievalHash = createHash('sha256').update(retrieval.bytes).digest('hex')
    if (retrieval.derived) {
      retrievalKey = `${storageKey}.extracted.txt`
      await uploadToS3(retrievalKey, retrieval.bytes, retrievalMime)
    }
  } catch { extractionStatus = 'failed' }
  if (extractionStatus === 'verified') {
    try { extractedFacts = await extractEvidenceFactsFromArtifact({id,name:file.name,mime:mimeType,bytes,text:extractedText}, moduleSlug) } catch { extractedFacts = [] }
    extractedFacts = extractedFacts.map(fact => ({ ...fact, last_editor: allowed.user.userId }))
  }
  const inserted = await db.from('apollo_conversation_evidence').insert({ id, conversation_id: conversationId, user_id: allowed.user.userId, original_name: file.name, storage_key: storageKey, content_sha256: originalHash, retrieval_storage_key: retrievalKey, retrieval_mime_type: retrievalMime, retrieval_sha256: retrievalHash, mime_type: mimeType, size_bytes: bytes.length, extraction_status: extractionStatus, extracted_facts: extractedFacts }).select('id, original_name, extraction_status').single()
  if (inserted.error) {
    await Promise.allSettled([deleteFromS3(storageKey), ...(retrievalKey !== storageKey ? [deleteFromS3(retrievalKey)] : [])])
    return NextResponse.json({ error: inserted.error.message }, { status: 500 })
  }
  let specificationVersion: number | null = null; let readiness: number | null = null
  if (prior?.schema_version === '1.0') {
    for (let attempt = 0; attempt < 4; attempt += 1) {
      const latestOwner = await db.from('apollo_conversations').select('current_spec_version').eq('id', conversationId).eq('user_id', allowed.user.userId).single()
      if (latestOwner.error || !latestOwner.data) return NextResponse.json({ error:'Mission conversation was not found' }, { status:404 })
      const expectedVersion = latestOwner.data.current_spec_version
      const latest = await db.from('apollo_specification_versions').select('specification').eq('conversation_id', conversationId).eq('version', expectedVersion).single()
      if (latest.error || !latest.data) return NextResponse.json({ error:'Current mission specification was not found' }, { status:409 })
      const merged = mergeEvidenceIntoSpecification({ prior:latest.data.specification as DeliverableSpecification, evidence:{ id, name:file.name, status:extractionStatus, facts:extractedFacts } })
      readiness = merged.readiness
      const committed = await db.rpc('apollo_commit_evidence_specification_v2', { p_conversation_id:conversationId, p_expected_version:expectedVersion, p_specification:merged.specification, p_content_hash:createHash('sha256').update(JSON.stringify(merged.specification)).digest('hex'), p_readiness:readiness, p_status:merged.specification.approval.status })
      if (!committed.error) {
        if (merged.effectiveStatus === 'conflict') {
          const conflictUpdate = await db.from('apollo_conversation_evidence').update({ extraction_status:'conflict' }).eq('id', id).eq('user_id', allowed.user.userId)
          if (conflictUpdate.error) return NextResponse.json({ error:conflictUpdate.error.message }, { status:500 })
        }
        specificationVersion = Number(committed.data)
        return NextResponse.json({ id, name:file.name, status:merged.effectiveStatus, facts:extractedFacts, specification:merged.specification, specification_version:specificationVersion, readiness }, { status:201 })
      }
      if (committed.error.code !== '40001') return NextResponse.json({ error:committed.error.message }, { status:500 })
    }
    return NextResponse.json({ error:'Mission evidence changed concurrently. The accepted file remains in custody; retry synchronization.' }, { status:409 })
  }
  return NextResponse.json({ id, name: file.name, status: inserted.data.extraction_status, facts: extractedFacts, specification_version: specificationVersion, readiness }, { status: 201 })
}
