import { createHash } from 'node:crypto'
import { findDeliverable, getModule, getStylesForIndustry } from '@/lib/apollo/packages-loader'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import type { DocumentSource } from '@/lib/executor/contracts'
import { controllingMissionFactValue, createMissionFact, mergeMissionFacts, specificationProvenance, type DeliverableSpecification } from './contracts'
import { cleanExecutionFields } from './field-quality'
import { hasCurrentQuotePricingApproval, quotePricingResearchIsVerified } from './quote-pricing-research'

export type WorkOrderCompilation =
  | { ok: true; order: DocumentWorkOrder }
  | { ok: false; missing: Array<{ key: string; label: string; reason: string }> }

const CONSEQUENTIAL_CONFLICT_KEYS = new Set([
  'contract_value','commercial_value','pricing_detail','line_items','total','customer_name','client_name',
  'site_address','project_address','effective_date','expiration_date','contracting_parties','governing_law',
  'forecast_period','base_case_lines','scenario_summary','acceptance_criteria','test_results',
])

const SAFE_INFERRED_EXECUTION_KEYS = new Set([
  'win_themes','proposed_methodology','risks_and_mitigations','assumptions',
  'validity_period_days','valid_until','next_steps_call_to_action','payment_terms','pricing_model',
  'problem_statement','our_understanding','review_perspective','review_goal',
])

const PILOT_PLAYBOOKS:Record<string,string>={
  fsr:'field-service-report',
  'final-qc-report':'quality-control-closeout',
  quote:'commercial-quote',
  proposal:'field-service-proposal',
  'cash-flow-budget-package':'financial-package',
  'contract-intelligence-review':'contract-intelligence',
}

export function authoritativePlaybookId(spec:DeliverableSpecification):string {
  return PILOT_PLAYBOOKS[spec.artifact.recommended_type]??spec.specialist.playbook_id
}

export function inferredFactMayControlExecution(key:string){return SAFE_INFERRED_EXECUTION_KEYS.has(key)}

export function uuidFromDigest(digest: string, offset = 0) {
  const hex = digest.slice(offset, offset + 32).padEnd(32, '0')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function factMap(specification: DeliverableSpecification): Record<string, string> {
  return Object.fromEntries(specification.content.facts.flatMap(fact => {
    const authoritative=fact.source==='user'||fact.source==='evidence'||fact.source==='research'||fact.source==='default'
    if(!authoritative&&!(fact.source==='inferred'&&fact.confidence>=.75&&inferredFactMayControlExecution(fact.key)))return []
    const value=controllingMissionFactValue(fact)
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

/** Defaults that affect publication must be visible in the approved spec. */
export function materializeSpecificationDefaults(spec:DeliverableSpecification,now=new Date()):DeliverableSpecification {
  const existing=new Set(spec.content.facts.filter(fact=>fact.verification_state!=='conflict').map(fact=>fact.key))
  const today=now.toISOString().slice(0,10)
  const defaults:Array<ReturnType<typeof createMissionFact>>=[]
  const add=(key:string,label:string,value:string,confidence=1)=>{if(!existing.has(key))defaults.push(createMissionFact({key,label,value,source:'default',confidence},now))}
  if(spec.artifact.recommended_type==='proposal'){
    add('proposal_date','Proposal date',today)
    add('problem_statement',"Problem statement (in client's words)",spec.mission.objective,.9)
    add('our_understanding','Our understanding of the problem',spec.mission.objective,.9)
  }
  if(spec.artifact.recommended_type==='quote'){
    add('quote_date','Quote date',today)
    const quoteDate=spec.content.facts.find(fact=>fact.key==='quote_date'&&fact.verification_state!=='conflict')?.value??today
    const date=new Date(quoteDate)
    if(!Number.isNaN(date.getTime())){date.setUTCDate(date.getUTCDate()+30);add('valid_until','Valid until',date.toISOString().slice(0,10),.9)}
  }
  if(spec.artifact.recommended_type==='contract-intelligence-review'){
    add('review_perspective','Review perspective','Document owner',.9)
    add('review_goal','Review goal','Perform a complete operational review of the supplied agreement and related materials, identify rights, duties, deadlines, exclusions, value opportunities, risks, and actions with exact source anchors.',.9)
    add('as_of_date','Review as-of date',today)
  }
  const facts=defaults.length?mergeMissionFacts(spec.content.facts,defaults,now):spec.content.facts
  const playbookId=authoritativePlaybookId(spec)
  if(!defaults.length&&playbookId===spec.specialist.playbook_id)return spec
  return {...spec,specialist:{...spec.specialist,playbook_id:playbookId},content:{...spec.content,facts},provenance:specificationProvenance(facts,spec.provenance.created_at,spec.provenance.model_versions)}
}

export function executionGaps(spec: DeliverableSpecification, now = new Date()) {
  const documentModule = getModule(spec.artifact.recommended_type)
  if (!documentModule) return [{ key: 'deliverable', label: 'Supported deliverable', reason: 'The recommendation is not mapped to an active document module.' }]
  const requiredKeys = new Set(documentModule.required_fields.map(field => field.key))
  const conflicts = spec.content.facts.filter(fact => (requiredKeys.has(fact.key)||CONSEQUENTIAL_CONFLICT_KEYS.has(fact.key)) && fact.verification_state === 'conflict' && controllingMissionFactValue(fact)===null).map(fact => ({ key: fact.key, label: fact.label, reason: 'Conflicting values must be resolved before controlled execution.' }))
  const fields = executionFields(spec, now)
  const internallyControlledFsrFields=new Set(spec.artifact.recommended_type==='fsr'?['work_order_number','equipment_asset_id']:[])
  const missing = documentModule.required_fields.filter(field => !internallyControlledFsrFields.has(field.key) && (fields[field.key] === undefined || fields[field.key] === null || String(fields[field.key]).trim() === '')).map(field => ({ key: field.key, label: field.label, reason: 'Required by the selected specialist document module.' }))
  const evidenceMissing=spec.artifact.recommended_type==='contract-intelligence-review'&&!spec.sources.some(source=>source.status==='verified'||source.status==='conflict')
    ? [{key:'contract_evidence',label:'Complete contract evidence',reason:'Attach at least one verified agreement, amendment, schedule, exhibit, warranty, or incorporated policy before contract review.'}]
    : []
  const pricingApprovalMissing=spec.artifact.recommended_type==='quote'&&spec.content.facts.some(fact=>fact.key==='market_pricing_basis'&&fact.verification_state==='verified')&&!hasCurrentQuotePricingApproval(spec)
    ? [{key:'market_pricing_approval',label:'Market-informed pricing approval',reason:'The operator must approve the current quote figures after reviewing the cited market basis.'}]
    : []
  const pricingResearchMissing=spec.artifact.recommended_type==='quote'
    &&spec.content.facts.some(fact=>fact.key==='market_pricing_research_required'&&fact.value==='true')
    &&!quotePricingResearchIsVerified(spec)
    ? [{key:'market_pricing_basis',label:'Cited market-pricing research',reason:'Requested market research must complete with verified public sources before launch.'}]
    : []
  return [...evidenceMissing,...conflicts,...pricingResearchMissing,...pricingApprovalMissing, ...missing.filter(gap => !conflicts.some(conflict => conflict.key === gap.key))]
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
  const playbookId=authoritativePlaybookId(spec)
  return { ok: true, order: {
    protocol_version: '1.0', work_order_id: uuidFromDigest(digest), idempotency_key: `spec-${digest}`, project_id: input.specificationId, conversation_id: input.conversationId, task_id: uuidFromDigest(digest, 32), requested_by: input.requestedBy, capability: 'professional-document-generation', deliverable_type: spec.artifact.recommended_type, objective: spec.mission.objective, audience: spec.audience.primary.join(', '), formats: ['pdf'], fields, sources: input.sources ?? [], brand_id: spec.presentation.brand_profile_id ?? 'apollo', style_id: style.id, sensitivity: spec.mission.stakes === 'high' ? 'confidential' : 'internal', priority: spec.mission.deadline ? 'high' : 'medium', deadline: spec.mission.deadline ?? undefined, drive_destination: { folder_id: input.driveFolderId, lifecycle: 'draft' }, quality_gates: { schema_validation: true, source_grounding: true, independent_review: spec.mission.stakes === 'high', deterministic_financial_verification: playbookId === 'financial-package', human_approval_before_publish: true }, trace: { specification_id: input.specificationId, specification_hash: input.specificationHash, specification_schema_version: spec.schema_version, playbook_id: playbookId, playbook_version: spec.specialist.playbook_version, model_versions: spec.provenance?.model_versions ?? [], required_checks: spec.specialist.required_checks, accepted_unresolved_items: spec.approval.unresolved_items_accepted ?? [] }, created_at: now.toISOString(),
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
