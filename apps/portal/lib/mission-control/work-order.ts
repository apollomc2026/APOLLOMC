import { createHash } from 'node:crypto'
import { findDeliverable, getModule, getStylesForIndustry } from '@/lib/apollo/packages-loader'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'
import type { DeliverableSpecification } from './contracts'

export type WorkOrderCompilation =
  | { ok: true; order: DocumentWorkOrder }
  | { ok: false; missing: Array<{ key: string; label: string; reason: string }> }

export function uuidFromDigest(digest: string, offset = 0) {
  const hex = digest.slice(offset, offset + 32).padEnd(32, '0')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-5${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

function factMap(specification: DeliverableSpecification): Record<string, string> {
  return Object.fromEntries(specification.content.facts.filter(fact => fact.source === 'user' || fact.confidence >= .75).map(fact => [fact.key, fact.value]))
}

export function executionFields(spec: DeliverableSpecification, now = new Date()): Record<string, unknown> {
  const fields: Record<string, unknown> = { ...factMap(spec) }
  if (spec.artifact.recommended_type === 'proposal') {
    fields.prospect_organization ??= spec.audience.primary[0]
    fields.proposal_date ??= now.toISOString().slice(0, 10)
    fields.problem_statement ??= spec.mission.objective
    fields.our_understanding ??= spec.mission.objective
    fields.pricing_detail ??= spec.content.commercial_terms.value
    fields.assumptions ??= spec.content.assumptions.join('\n')
  }
  return fields
}

export function executionGaps(spec: DeliverableSpecification, now = new Date()) {
  const documentModule = getModule(spec.artifact.recommended_type)
  if (!documentModule) return [{ key: 'deliverable', label: 'Supported deliverable', reason: 'The recommendation is not mapped to an active document module.' }]
  const fields = executionFields(spec, now)
  return documentModule.required_fields.filter(field => fields[field.key] === undefined || fields[field.key] === null || String(fields[field.key]).trim() === '').map(field => ({ key: field.key, label: field.label, reason: 'Required by the selected specialist document module.' }))
}

export function compileApprovedSpecification(input: {
  specification: DeliverableSpecification
  specificationId: string
  specificationHash: string
  conversationId: string
  requestedBy: string
  callbackUrl: string
  driveFolderId: string
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
  const digest = createHash('sha256').update(`${input.specificationId}:${input.specificationHash}`).digest('hex')
  return { ok: true, order: {
    protocol_version: '1.0', work_order_id: uuidFromDigest(digest), idempotency_key: `spec-${digest}`, project_id: input.specificationId, conversation_id: input.conversationId, task_id: uuidFromDigest(digest, 32), requested_by: input.requestedBy, capability: 'professional-document-generation', deliverable_type: spec.artifact.recommended_type, objective: spec.mission.objective, audience: spec.audience.primary.join(', '), formats: ['pdf'], fields, sources: [], brand_id: spec.presentation.brand_profile_id ?? 'apollo', style_id: style.id, sensitivity: spec.mission.stakes === 'high' ? 'confidential' : 'internal', priority: spec.mission.deadline ? 'high' : 'medium', deadline: spec.mission.deadline ?? undefined, drive_destination: { folder_id: input.driveFolderId, lifecycle: 'draft' }, quality_gates: { schema_validation: true, source_grounding: true, independent_review: spec.mission.stakes === 'high', deterministic_financial_verification: spec.specialist.playbook_id === 'financial-package', human_approval_before_publish: true }, callback_url: input.callbackUrl, created_at: now.toISOString(),
  } }
}
