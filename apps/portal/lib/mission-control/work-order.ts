import { createHash } from 'node:crypto'
import { findDeliverable, getModule, getStylesForIndustry } from '@/lib/apollo/packages-loader'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import type { DocumentSource } from '@/lib/executor/contracts'
import type { DeliverableSpecification } from './contracts'
import { cleanExecutionFields } from './field-quality'

export type WorkOrderCompilation =
  | { ok: true; order: DocumentWorkOrder }
  | { ok: false; missing: Array<{ key: string; label: string; reason: string }> }

const CONSEQUENTIAL_CONFLICT_KEYS = new Set([
  'contract_value','commercial_value','pricing_detail','line_items','total','customer_name','client_name',
  'site_address','project_address','effective_date','expiration_date','contracting_parties','governing_law',
  'forecast_period','base_case_lines','scenario_summary','acceptance_criteria','test_results',
])

export function uuidFromDigest(digest: string, offset = 0) {
  const hex = digest.slice(offset, offset + 32).padEnd(32, '0')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function controllingConflictValue(fact:DeliverableSpecification['content']['facts'][number]):string|null {
  if(fact.verification_state!=='conflict')return fact.value
  const superseded=new Set(fact.supersession?.superseded_source_references??[])
  const active=(fact.conflicts??[]).filter(candidate=>!superseded.has(candidate.source_reference??''))
  const unique=[...new Map(active.map(candidate=>[(candidate.normalized_value??candidate.value).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase(),candidate.value])).values()]
  return unique.length===1?unique[0]:null
}

function factMap(specification: DeliverableSpecification): Record<string, string> {
  return Object.fromEntries(specification.content.facts.flatMap(fact => {
    if(!(fact.source === 'user' || fact.source === 'evidence' || fact.confidence >= .75))return []
    const value=controllingConflictValue(fact)
    return value===null?[]:[[fact.key,value]]
  }))
}

export function executionFields(spec: DeliverableSpecification, now = new Date()): Record<string, unknown> {
  const fields: Record<string, unknown> = cleanExecutionFields(factMap(spec))
  if (spec.artifact.recommended_type === 'proposal') {
    fields.prospect_organization ??= spec.audience.primary[0]
    fields.proposal_date ??= now.toISOString().slice(0, 10)
    fields.problem_statement ??= spec.mission.objective
    fields.our_understanding ??= spec.mission.objective
    fields.pricing_detail ??= spec.content.commercial_terms.value
    fields.assumptions ??= spec.content.assumptions.join('\n') || 'This proposal is based solely on the scope and facts stated in the approved mission brief. Changes to scope, access, schedule, site conditions, or client requirements require written review and may affect price and schedule.'
  }
  if(spec.artifact.recommended_type==='quote'){
    if(!fields.customer_name&&typeof fields.customer_address==='string')fields.customer_name=fields.customer_address.split(/\s+[—–-]\s+|,/)[0]?.trim()
    if(!fields.valid_until&&typeof fields.quote_date==='string'){
      const days=Number(fields.validity_period_days??30);const date=new Date(fields.quote_date)
      if(Number.isFinite(days)&&!Number.isNaN(date.getTime())){date.setUTCDate(date.getUTCDate()+days);fields.valid_until=date.toISOString().slice(0,10)}
    }
  }
  if(spec.artifact.recommended_type==='contract-intelligence-review'){
    fields.review_perspective ??='Document owner'
    fields.review_goal ??='Perform a complete operational review of the supplied agreement and related materials, identify rights, duties, deadlines, exclusions, value opportunities, risks, and actions with exact source anchors.'
    fields.as_of_date ??=now.toISOString().slice(0,10)
  }
  return fields
}

export function executionGaps(spec: DeliverableSpecification, now = new Date()) {
  const documentModule = getModule(spec.artifact.recommended_type)
  if (!documentModule) return [{ key: 'deliverable', label: 'Supported deliverable', reason: 'The recommendation is not mapped to an active document module.' }]
  const requiredKeys = new Set(documentModule.required_fields.map(field => field.key))
  const conflicts = spec.content.facts.filter(fact => (requiredKeys.has(fact.key)||CONSEQUENTIAL_CONFLICT_KEYS.has(fact.key)) && fact.verification_state === 'conflict' && controllingConflictValue(fact)===null).map(fact => ({ key: fact.key, label: fact.label, reason: 'Conflicting values must be resolved before controlled execution.' }))
  const fields = executionFields(spec, now)
  const internallyControlledFsrFields=new Set(spec.artifact.recommended_type==='fsr'?['work_order_number','equipment_asset_id']:[])
  const missing = documentModule.required_fields.filter(field => !internallyControlledFsrFields.has(field.key) && (fields[field.key] === undefined || fields[field.key] === null || String(fields[field.key]).trim() === '')).map(field => ({ key: field.key, label: field.label, reason: 'Required by the selected specialist document module.' }))
  const evidenceMissing=spec.artifact.recommended_type==='contract-intelligence-review'&&!spec.sources.some(source=>source.status==='verified'||source.status==='conflict')
    ? [{key:'contract_evidence',label:'Complete contract evidence',reason:'Attach at least one verified agreement, amendment, schedule, exhibit, warranty, or incorporated policy before contract review.'}]
    : []
  return [...evidenceMissing,...conflicts, ...missing.filter(gap => !conflicts.some(conflict => conflict.key === gap.key))]
}

export function compileApprovedSpecification(input: {
  specification: DeliverableSpecification
  specificationId: string
  specificationHash: string
  conversationId: string
  requestedBy: string
  driveFolderId: string
  sources?: DocumentSource[]
  now?: Date
}): WorkOrderCompilation {
  const spec = input.specification
  if (spec.approval.status !== 'approved') return { ok: false, missing: [{ key: 'approval', label: 'Mission Brief approval', reason: 'The specification must be approved before execution.' }] }
  const deliverable = findDeliverable(spec.artifact.recommended_type)
  const documentModule = getModule(spec.artifact.recommended_type)
  if (!deliverable || !documentModule) return { ok: false, missing: [{ key: 'deliverable', label: 'Supported deliverable', reason: 'The recommendation is not mapped to an active document module.' }] }

  const fields = executionFields(spec, input.now)
  const missing = executionGaps(spec, input.now)
  if (missing.length) return { ok: false, missing }

  const style = getStylesForIndustry(deliverable.industry_slug)[0]
  if (!style) return { ok: false, missing: [{ key: 'style', label: 'Compatible design profile', reason: 'No active design profile is mapped to this deliverable.' }] }
  const now = input.now ?? new Date()
  const sourceIdentity = (input.sources ?? []).map(source => `${source.source_id}:${source.content_sha256}`).sort().join('|')
  const digest = createHash('sha256').update(`${input.specificationId}:${input.specificationHash}:${sourceIdentity}`).digest('hex')
  return { ok: true, order: {
    protocol_version: '1.0', work_order_id: uuidFromDigest(digest), idempotency_key: `spec-${digest}`, project_id: input.specificationId, conversation_id: input.conversationId, task_id: uuidFromDigest(digest, 32), requested_by: input.requestedBy, capability: 'professional-document-generation', deliverable_type: spec.artifact.recommended_type, objective: spec.mission.objective, audience: spec.audience.primary.join(', '), formats: ['pdf'], fields, sources: input.sources ?? [], brand_id: spec.presentation.brand_profile_id ?? 'apollo', style_id: style.id, sensitivity: spec.mission.stakes === 'high' ? 'confidential' : 'internal', priority: spec.mission.deadline ? 'high' : 'medium', deadline: spec.mission.deadline ?? undefined, drive_destination: { folder_id: input.driveFolderId, lifecycle: 'draft' }, quality_gates: { schema_validation: true, source_grounding: true, independent_review: spec.mission.stakes === 'high', deterministic_financial_verification: spec.specialist.playbook_id === 'financial-package', human_approval_before_publish: true }, trace: { specification_id: input.specificationId, specification_hash: input.specificationHash, specification_schema_version: spec.schema_version, playbook_id: spec.specialist.playbook_id, playbook_version: spec.specialist.playbook_version, model_versions: spec.provenance?.model_versions ?? [], required_checks: spec.specialist.required_checks, accepted_unresolved_items: spec.approval.unresolved_items_accepted ?? [] }, created_at: now.toISOString(),
  } }
}

export function continueApprovedMissionLineage(order:DocumentWorkOrder, prior:DocumentWorkOrder):DocumentWorkOrder {
  const priorVersion = Number(prior.fields.artifact_version ?? 1)
  const artifactVersion = Number.isSafeInteger(priorVersion) && priorVersion > 0 ? priorVersion + 1 : 2
  return {
    ...order,
    fields:{
      ...order.fields,
      revision_of:prior.work_order_id,
      revision_instruction:'Mission data updated and explicitly reapproved by the operator.',
      artifact_version:artifactVersion,
    },
  }
}
