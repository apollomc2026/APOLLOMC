import { createHash } from 'node:crypto'
import { createClient } from '@/lib/supabase/server'
import { interpretMissionWithClaude } from './ai-interpreter'
import { createMissionFact, mergeMissionFacts, missionFactSourceReferences, specificationProvenance, type DeliverableSpecification, type MissionFact, type MissionTurnResult, type VoiceTranscriptMetadata } from './contracts'
import type { DocumentSource } from '@/lib/executor/contracts'
import { getFromS3, getPresignedUrl } from '@/lib/s3/client'
import { completeEvidenceExtractionTrace, createEvidenceExtractionTrace, extractEvidence, extractEvidenceFactsFromImages, extractEvidenceFactsFromPdfs, extractEvidenceFactsFromSources, extractionTracesCoverSources, reconcileEvidenceSupersessions, type EvidenceExtractionTrace } from './evidence'
import { executionGaps, materializeSpecificationDefaults } from './work-order'
import { canonicalizeSpecificationIdentity } from './identity'
import { pricingResearchFact, requestsMarketPricingResearch, researchQuotePricing } from './quote-pricing-research'

export class MissionPersistenceError extends Error {}

function questionForGap(gap:{key:string;label:string},specification:DeliverableSpecification):string {
  if(gap.key==='market_pricing_approval')return 'Review APOLLO’s cited market pricing basis and approve the current quote line items, or revise the commercial figures.'
  if(gap.key==='market_pricing_basis')return 'APOLLO has not completed the requested cited market-pricing research. Retry calibration; launch will remain safely blocked until verified benchmarks are available.'
  if(gap.key==='site_address'){
    const site=specification.content.facts.find(fact=>fact.key==='site_name'&&fact.verification_state!=='conflict')?.value.trim()
    return site?`Confirm the complete street address for ${site}. APOLLO did not find a usable postal address in the secured evidence.`:'Confirm the complete street address for this service location.'
  }
  return `What should APOLLO use for ${gap.label.toLowerCase()}?`
}

function isControlMessageFact(fact: MissionFact) {
  if (fact.key === 'deliverable_type') return false
  return /^(?:Use (?:your )?expert recommendations\b|Operator involvement override:|Re-read every secured evidence source\b|Reconcile the complete secured evidence set\b|required facts absent from every source\b|I approve the current quote line items after reviewing APOLLO's cited market pricing basis\.|I approve .+ as the intended deliverable type\b|(?:The intended deliverable is|Set the intended deliverable exactly to)|every unresolved decision that can be responsibly inferred)/i.test(fact.value.trim())
}

interface ReprocessableEvidenceRow {
  id: string
  original_name: string
  retrieval_storage_key: string | null
  retrieval_mime_type: string | null
}

/**
 * Evidence is interpreted against a specialist schema. If Mission Control
 * changes that schema, re-read every secured source before asking the operator
 * for information the files may already contain.
 */
async function reconcileSecuredEvidence(input: {
  db: Awaited<ReturnType<typeof createClient>>
  userId: string
  conversationId: string
  specification: DeliverableSpecification
}) {
  console.info('[mission-control] Evidence recalibration started', { conversationId:input.conversationId, moduleSlug:input.specification.artifact.recommended_type })
  const query = await input.db
    .from('apollo_conversation_evidence')
    .select('id, original_name, retrieval_storage_key, retrieval_mime_type')
    .eq('conversation_id', input.conversationId)
    .eq('user_id', input.userId)
    .in('extraction_status', ['verified','conflict'])
    .order('created_at')
  if (query.error) throw new MissionPersistenceError('Secured mission evidence could not be reconciled')

  const rows = (query.data ?? []) as ReprocessableEvidenceRow[]
  if (!rows.length) {
    console.warn('[mission-control] Evidence recalibration found no verified sources', { conversationId:input.conversationId })
    return [] as MissionFact[]
  }

  const recoveredSources = (await Promise.all(rows.map(async row => {
    if (!row.retrieval_storage_key || !row.retrieval_mime_type) return null
    try {
      const bytes = await getFromS3(row.retrieval_storage_key)
      const extracted = await extractEvidence(bytes, row.retrieval_mime_type)
      return { id: row.id, name: row.original_name, mime:row.retrieval_mime_type, text: extracted.text?.trim() || null, bytes }
    } catch (error) {
      console.warn('[mission-control] Evidence source could not be re-read', { evidenceId: row.id, name: row.original_name, error: error instanceof Error ? error.message : 'unknown error' })
      return null
    }
  }))).filter((source): source is { id: string; name: string; mime:string; text: string | null; bytes:Buffer } => Boolean(source))
  if (recoveredSources.length!==rows.length) throw new MissionPersistenceError(`Evidence recalibration stopped because ${rows.length-recoveredSources.length} secured source(s) could not be reread`)

  const moduleSlug = input.specification.artifact.recommended_type
  const moduleTerms = moduleSlug.split('-').filter(term => term.length > 2)
  const prioritizedSources = [...recoveredSources].sort((left, right) => {
    const score = (name: string) => {
      const normalized = name.toLowerCase()
      const termScore = moduleTerms.reduce((total, term) => total + (normalized.includes(term) ? 2 : 0), 0)
      const finalQcScore = moduleSlug === 'final-qc-report' && /final.?qc|project.?completion/i.test(normalized) ? 20 : 0
      return termScore + finalQcScore
    }
    return score(right.name) - score(left.name)
  })
  const readableSources = prioritizedSources.filter((source): source is typeof source & { text: string } => Boolean(source.text))
  const pdfSources = prioritizedSources.filter(source => !source.text&&source.mime==='application/pdf')
  const imageSources = prioritizedSources.filter((source):source is typeof source&{mime:'image/png'|'image/jpeg'}=>source.mime==='image/png'||source.mime==='image/jpeg')
  const extractionRuns:Array<Promise<{facts:MissionFact[];trace:EvidenceExtractionTrace}>>=[]
  if(readableSources.length){
    const trace=createEvidenceExtractionTrace('text',readableSources.map(source=>source.id))
    extractionRuns.push(extractEvidenceFactsFromSources(readableSources,moduleSlug,trace).then(facts=>({facts,trace:completeEvidenceExtractionTrace(trace)})))
  }
  if(pdfSources.length){
    const trace=createEvidenceExtractionTrace('pdf',pdfSources.map(source=>source.id))
    extractionRuns.push(extractEvidenceFactsFromPdfs(pdfSources.map(source=>({id:source.id,name:source.name,bytes:source.bytes})),moduleSlug,trace).then(facts=>({facts,trace:completeEvidenceExtractionTrace(trace)})))
  }
  if(imageSources.length){
    const trace=createEvidenceExtractionTrace('image',imageSources.map(source=>source.id))
    extractionRuns.push(extractEvidenceFactsFromImages(imageSources.map(source=>({id:source.id,name:source.name,mime:source.mime,bytes:source.bytes})),moduleSlug,trace).then(facts=>({facts,trace:completeEvidenceExtractionTrace(trace)})))
  }
  const completedRuns=await Promise.all(extractionRuns)
  if(completedRuns.some(run=>run.trace.status!=='complete')||!extractionTracesCoverSources(rows.map(row=>row.id),completedRuns.map(run=>run.trace)))throw new MissionPersistenceError('Not every secured source completed multipass evidence extraction')
  const traceBySource=new Map(completedRuns.flatMap(run=>run.trace.source_ids.map(sourceId=>[sourceId,run.trace] as const)))
  const extracted = reconcileEvidenceSupersessions(completedRuns.flatMap(run=>run.facts))
  const evidenceFacts = extracted
    .map(fact => createMissionFact({ ...fact, last_editor: input.userId }))
  if (moduleSlug === 'final-qc-report' && !evidenceFacts.some(fact => fact.key === 'reference_documents')) {
    evidenceFacts.push(createMissionFact({ key: 'reference_documents', label: 'Reference documents / standards', value: rows.map(row => row.original_name).join('; '), source: 'evidence', source_reference: rows[0]?.id ?? null, confidence: 1, sensitivity: 'confidential', last_editor: input.userId }))
  }
  console.info('[mission-control] Evidence recalibration completed', { conversationId: input.conversationId, moduleSlug, securedSources: rows.length, recoveredSources: recoveredSources.length, readableSources: readableSources.length, nativePdfSources:pdfSources.length, imageSources:imageSources.length, extractedFacts: evidenceFacts.length })
  await Promise.all(rows.map(async row => {
    const facts = evidenceFacts.filter(fact => missionFactSourceReferences(fact).includes(row.id))
    const update = await input.db.from('apollo_conversation_evidence').update({ extracted_facts: facts, extraction_trace:traceBySource.get(row.id)??null }).eq('id', row.id).eq('user_id', input.userId)
    if (update.error) throw new MissionPersistenceError('Recalibrated evidence facts could not be recorded')
  }))
  return evidenceFacts
}

async function enrichQuotePricingResearch(specification:DeliverableSpecification,message:string):Promise<DeliverableSpecification> {
  if(specification.artifact.recommended_type!=='quote')return specification
  const alreadyRequired=specification.content.facts.some(fact=>fact.key==='market_pricing_research_required'&&fact.value==='true')
  if(!alreadyRequired&&!requestsMarketPricingResearch(message))return specification
  const requiredFact=createMissionFact({key:'market_pricing_research_required',label:'Cited market-pricing research required',value:'true',source:'user',confidence:1,sensitivity:'internal'})
  const requiredFacts=alreadyRequired?specification.content.facts:mergeMissionFacts(specification.content.facts,[requiredFact])
  const requiredSpecification={...specification,content:{...specification.content,facts:requiredFacts},provenance:specificationProvenance(requiredFacts,specification.provenance.created_at,specification.provenance.model_versions)}
  if(requiredFacts.some(fact=>fact.key==='market_pricing_basis'&&fact.verification_state==='verified'))return requiredSpecification
  const values=new Map(requiredFacts.filter(fact=>fact.verification_state!=='conflict').map(fact=>[fact.key,fact.value.trim()]))
  const scopeSummary=values.get('scope_summary')||specification.mission.objective.trim()
  if(!scopeSummary)return requiredSpecification
  try{
    const research=await researchQuotePricing({scopeSummary,lineItems:values.get('line_items'),geography:values.get('project_address')||values.get('site_address')||values.get('customer_address')})
    if(!research)return requiredSpecification
    const fact=pricingResearchFact(research)
    const facts=mergeMissionFacts(requiredFacts,[fact])
    return {...specification,content:{...specification.content,facts},provenance:specificationProvenance(facts,specification.provenance.created_at,specification.provenance.model_versions)}
  }catch(error){
    console.error('[mission-control] Quote pricing research failed',{error:error instanceof Error?error.message:'unknown error'})
    return requiredSpecification
  }
}

export async function persistMissionTurn(input: {
  userId: string
  message: string
  conversationId?: string | null
  prior?: DeliverableSpecification
  brandProfileId?: string | null
  aura?: Partial<DeliverableSpecification['aura']>
  voiceTranscript?: VoiceTranscriptMetadata
}): Promise<MissionTurnResult> {
  const db = await createClient()
  const involvement = input.aura?.operator_involvement ?? input.prior?.aura.operator_involvement
  const result = await interpretMissionWithClaude(input.message, input.prior, involvement)
  const updatedAt = new Date().toISOString()
  const changedKeys = new Set(result.changed_facts.map(fact => fact.key))
  result.specification.content.facts = result.specification.content.facts.map(fact => changedKeys.has(fact.key) && fact.source === 'user' ? { ...fact, last_editor: input.userId, updated_at: updatedAt } : fact)
  result.changed_facts = result.changed_facts.map(fact => fact.source === 'user' ? { ...fact, last_editor: input.userId, updated_at: updatedAt } : fact)
  result.specification.provenance = specificationProvenance(result.specification.content.facts, result.specification.provenance.created_at, result.specification.provenance.model_versions)
  if (input.brandProfileId !== undefined) result.specification.presentation.brand_profile_id = input.brandProfileId
  if (input.aura) result.specification.aura = { ...result.specification.aura, ...input.aura }
  if (input.conversationId) {
    const evidenceFacts = await reconcileSecuredEvidence({ db, userId: input.userId, conversationId: input.conversationId, specification: result.specification })
    if (evidenceFacts.length) {
      const evidenceKeys = new Set(evidenceFacts.map(fact => fact.key))
      const isEvidenceDirective = (value: string) => /\b(?:use|extract|read|pull|take)\b[\s\S]{0,180}\b(?:attached|uploaded|workbook|brief|evidence|source files?)\b/i.test(value)
      const nonEvidenceFacts = result.specification.content.facts.filter(fact => fact.source !== 'evidence' && !(evidenceKeys.has(fact.key) && isEvidenceDirective(fact.value)))
      result.specification.content.facts = mergeMissionFacts(nonEvidenceFacts, evidenceFacts)
      const gaps = executionGaps(result.specification)
      result.specification.content.open_questions = gaps.map(gap => questionForGap(gap,result.specification))
      result.specification.content.assumptions = gaps.map(gap => `${gap.label} remains unresolved`)
      result.readiness = gaps.length ? Math.min(70, Math.max(50, 82 - gaps.length * 8)) : 82
      result.readiness_state = result.readiness >= 75 ? 'ready' : 'calibrating'
      result.question = result.specification.content.open_questions[0] ?? null
      result.question_reason = result.question ? 'This required field was not found in the secured evidence.' : null
      result.specification.approval = { status: gaps.length ? 'draft' : 'ready', approved_by: null, approved_at: null, unresolved_items_accepted: [] }
      result.specification.provenance = specificationProvenance(result.specification.content.facts, result.specification.provenance.created_at, result.specification.provenance.model_versions)
    }
  }
  result.specification=materializeSpecificationDefaults(result.specification)
  result.specification=await enrichQuotePricingResearch(result.specification,input.message)
  result.specification.content.facts = result.specification.content.facts.filter(fact => !isControlMessageFact(fact))
  result.changed_facts = result.changed_facts.filter(fact => !isControlMessageFact(fact))
  const sanitizedGaps = executionGaps(result.specification)
  result.specification.content.open_questions = sanitizedGaps.map(gap => questionForGap(gap,result.specification))
  result.specification.content.assumptions = sanitizedGaps.map(gap => `${gap.label} remains unresolved`)
  if (sanitizedGaps.length) {
    result.readiness = Math.min(result.readiness, 70)
    result.readiness_state = 'calibrating'
    result.question = result.specification.content.open_questions[0] ?? null
  } else {
    result.readiness = Math.max(result.readiness, 82)
    result.readiness_state = 'ready'
    result.question = null
    result.question_reason = null
  }
  result.specification.approval = { status: sanitizedGaps.length ? 'draft' : 'ready', approved_by: null, approved_at: null, unresolved_items_accepted: [] }
  result.specification.provenance = specificationProvenance(result.specification.content.facts, result.specification.provenance.created_at, result.specification.provenance.model_versions)
  result.specification = canonicalizeSpecificationIdentity(result.specification)
  const apolloContent = [result.acknowledgement, result.question].filter(Boolean).join('\n\n')
  const contentHash = createHash('sha256').update(JSON.stringify(result.specification)).digest('hex')
  const state = result.readiness >= 75 ? 'brief_ready' : result.readiness >= 50 ? 'calibrating' : 'discovery'
  const committed = await db.rpc('apollo_commit_mission_turn_v2', { p_conversation_id: input.conversationId ?? null, p_user_content: input.message, p_apollo_content: apolloContent, p_rationale: result.question_reason, p_specification: result.specification, p_schema_version: result.specification.schema_version, p_content_hash: contentHash, p_spec_status: result.specification.approval.status, p_readiness: result.readiness, p_conversation_status: state, p_title: result.specification.mission.title, p_input_channel:input.voiceTranscript?.inputChannel ?? 'text', p_transcription_confidence:input.voiceTranscript?.confidence ?? null, p_critical_review_required:input.voiceTranscript?.criticalReviewRequired ?? false, p_critical_review_confirmed:input.voiceTranscript?.criticalReviewConfirmed ?? false }).single()
  if (committed.error || !committed.data) throw new MissionPersistenceError(committed.error?.message ?? 'Mission turn could not be committed')
  const row = committed.data as { conversation_id: string; specification_version: number }
  return { ...result, conversation_id: String(row.conversation_id), specification_version: Number(row.specification_version) }
}

export async function approveSpecification(input: { userId: string; conversationId: string; version: number; unresolvedItemsAccepted: string[] }) {
  const db = await createClient()
  const existing = await db.from('apollo_specification_versions').select('id,specification,content_hash,approved_at,apollo_conversations!inner(user_id,current_spec_version)').eq('conversation_id', input.conversationId).eq('version', input.version).eq('status', 'approved').eq('apollo_conversations.user_id', input.userId).eq('apollo_conversations.current_spec_version', input.version).maybeSingle()
  if (existing.error) throw new MissionPersistenceError('Specification approval state could not be read')
  if (existing.data) {
    const specification = existing.data.specification as DeliverableSpecification
    const accepted = specification.approval.unresolved_items_accepted ?? []
    if (JSON.stringify([...accepted].sort()) !== JSON.stringify([...input.unresolvedItemsAccepted].sort())) throw new MissionPersistenceError('Approved unresolved-item acceptance does not match the locked specification')
    return { approved: true, approved_at: String(existing.data.approved_at), specification_id: String(existing.data.id), specification, content_hash: String(existing.data.content_hash) }
  }
  const { data, error } = await db.rpc('apollo_approve_specification', { p_conversation_id: input.conversationId, p_version: input.version, p_unresolved_items_accepted: input.unresolvedItemsAccepted }).single()
  if (error || !data) throw new MissionPersistenceError('Specification approval failed')
  const row = data as { specification_id: string; specification: DeliverableSpecification; content_hash: string; approved_at: string }
  return { approved: true, approved_at: row.approved_at, specification_id: String(row.specification_id), specification: row.specification, content_hash: String(row.content_hash) }
}

export async function loadExecutionEvidence(input: { userId: string; conversationId: string }): Promise<DocumentSource[]> {
  const db = await createClient()
  const result = await db.from('apollo_conversation_evidence').select('id, original_name, retrieval_storage_key, retrieval_mime_type, retrieval_sha256').eq('conversation_id', input.conversationId).eq('user_id', input.userId).in('extraction_status', ['verified','conflict'])
  if (result.error) throw new MissionPersistenceError(result.error.message)
  const expiresIn = 3600
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
  return Promise.all((result.data ?? []).map(async row => {
    if (!row.retrieval_storage_key || !row.retrieval_mime_type || !row.retrieval_sha256) throw new MissionPersistenceError(`Evidence ${row.original_name} is missing its integrity record`)
    return { source_id: String(row.id), name: String(row.original_name), media_type: String(row.retrieval_mime_type), retrieval_url: await getPresignedUrl(String(row.retrieval_storage_key), expiresIn), content_sha256: String(row.retrieval_sha256), sensitivity: 'confidential' as const, expires_at: expiresAt }
  }))
}

export async function refreshExecutionEvidence(input: { userId: string; conversationId: string; expectedSources: DocumentSource[] }): Promise<DocumentSource[]> {
  if (!input.expectedSources.length) return []
  const db = await createClient()
  const ids = input.expectedSources.map(source => source.source_id)
  const result = await db.from('apollo_conversation_evidence').select('id, original_name, retrieval_storage_key, retrieval_mime_type, retrieval_sha256').eq('conversation_id', input.conversationId).eq('user_id', input.userId).in('extraction_status', ['verified','conflict'])
  if (result.error) throw new MissionPersistenceError(result.error.message)
  const approvedIds=new Set(ids)
  const rows = new Map((result.data ?? []).filter(row=>approvedIds.has(String(row.id))).map(row => [String(row.id), row]))
  const expiresIn = 3600
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()
  return Promise.all(input.expectedSources.map(async expected => {
    const row = rows.get(expected.source_id)
    if (!row || !row.retrieval_storage_key || !row.retrieval_mime_type || !row.retrieval_sha256) throw new MissionPersistenceError(`Approved evidence ${expected.name} is no longer available`)
    if (String(row.retrieval_sha256) !== expected.content_sha256 || String(row.retrieval_mime_type) !== expected.media_type) throw new MissionPersistenceError(`Approved evidence ${expected.name} failed manifest verification`)
    return { ...expected, retrieval_url: await getPresignedUrl(String(row.retrieval_storage_key), expiresIn), expires_at: expiresAt }
  }))
}
