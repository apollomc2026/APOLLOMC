import { describe, expect, it } from 'vitest'
import { compileApprovedSpecification } from '../lib/mission-control/work-order'
import { interpretMission } from '../lib/mission-control/interpreter'
import { getModule } from '../lib/apollo/packages-loader'
import { buildRevisionOrder } from '../lib/mission-control/revision'
import { createMissionFact } from '../lib/mission-control/contracts'
import { formatRevisionDirective } from '../lib/apollo/orchestrate'
import { buildRetryOrder } from '../lib/mission-control/retry'
import type { DocumentWorkOrder } from '../lib/executor/contracts'

const ids = { specificationId: '11111111-1111-4111-8111-111111111111', specificationHash: 'a'.repeat(64), conversationId: '22222222-2222-4222-8222-222222222222', requestedBy: '33333333-3333-4333-8333-333333333333', driveFolderId: 'drive-folder', now: new Date('2026-09-06T12:00:00Z') }

describe('approved specification compiler', () => {
  it('refuses an unapproved specification', () => {
    const specification = interpretMission('I need a proposal for a client.').specification
    expect(compileApprovedSpecification({ specification, ...ids })).toEqual(expect.objectContaining({ ok: false, missing: [expect.objectContaining({ key: 'approval' })] }))
  })

  it('returns exact module gaps instead of inventing required content', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    specification.approval.status = 'approved'
    const result = compileApprovedSpecification({ specification, ...ids })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.missing.map(item => item.key)).toEqual(expect.arrayContaining(['proposed_methodology']))
      expect(result.missing.map(item => item.key)).not.toEqual(expect.arrayContaining(['prospect_contact_name', 'prospect_contact_title', 'team_lead_name', 'team_lead_qualifications', 'team_members']))
    }
  })

  it('uses stable job identities when an approved version is submitted again', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    specification.approval.status = 'approved'
    for (const field of getModule('proposal')!.required_fields) specification.content.facts.push(createMissionFact({ key: field.key, label: field.label, value: `Confirmed ${field.label}`, source: 'user', confidence: 1 }))
    const first = compileApprovedSpecification({ specification, ...ids })
    const second = compileApprovedSpecification({ specification, ...ids })
    expect(first.ok).toBe(true); expect(second.ok).toBe(true)
    if (first.ok && second.ok) {
      expect(first.order.work_order_id).toBe(second.order.work_order_id)
      expect(first.order.task_id).toBe(second.order.task_id)
      expect(first.order.trace).toEqual(expect.objectContaining({ specification_id: ids.specificationId, specification_hash: ids.specificationHash, playbook_id: 'field-service-proposal' }))
      expect(first.order.trace?.model_versions).toContain('apollo-deterministic-interpreter@1.0')
    }
  })

  it('preserves the prior draft and makes identical revision instructions idempotent', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    specification.approval.status = 'approved'
    for (const field of getModule('proposal')!.required_fields) specification.content.facts.push(createMissionFact({ key: field.key, label: field.label, value: `Confirmed ${field.label}`, source: 'user', confidence: 1 }))
    const compiled = compileApprovedSpecification({ specification, ...ids })
    expect(compiled.ok).toBe(true)
    if (compiled.ok) {
      const first = buildRevisionOrder(compiled.order, 'Make the executive summary more concise.')
      const second = buildRevisionOrder(compiled.order, 'Make the executive summary more concise.')
      expect(first.work_order_id).toBe(second.work_order_id)
      expect(first.work_order_id).not.toBe(compiled.order.work_order_id)
      expect(first.fields.revision_of).toBe(compiled.order.work_order_id)
      expect(first.fields.artifact_version).toBe(2)
      const next = buildRevisionOrder(first, 'Restore the commercial table and retain the concise summary.')
      expect(next.fields.artifact_version).toBe(3)
      expect(next.fields.revision_of).toBe(first.work_order_id)
    }
  })

  it('places review instructions inside the constrained generation context', () => {
    const directive = formatRevisionDirective({ revision_of: 'job-v1', revision_instruction: 'Tighten the executive summary while preserving price and scope.' })
    expect(directive).toContain('Prior immutable job: job-v1')
    expect(directive).toContain('Tighten the executive summary while preserving price and scope.')
    expect(directive).toContain('cannot override schema, source-grounding, safety, or workmanship requirements')
    expect(formatRevisionDirective({})).toBeNull()
  })

  it('preserves blocked runs and creates deterministic retry lineage', () => {
    const prior: DocumentWorkOrder = { protocol_version:'1.0',work_order_id:'10000000-0000-4000-8000-000000000001',idempotency_key:'original-work-order-id',project_id:'spec',conversation_id:ids.conversationId,task_id:'10000000-0000-4000-8000-000000000002',requested_by:ids.requestedBy,capability:'professional-document-generation',deliverable_type:'proposal',objective:'Proposal',audience:'Client',formats:['pdf'],fields:{},sources:[],brand_id:'apollo',style_id:'style',sensitivity:'internal',priority:'medium',drive_destination:{folder_id:'drive-folder',lifecycle:'draft'},quality_gates:{schema_validation:true,source_grounding:true,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true},created_at:'2026-09-07T00:00:00.000Z'}
    const first = buildRetryOrder(prior)
    const duplicate = buildRetryOrder(prior)
    const second = buildRetryOrder(first)
    expect(first.work_order_id).toBe(duplicate.work_order_id)
    expect(first.fields).toMatchObject({ retry_of: prior.work_order_id, retry_attempt: 1 })
    expect(second.work_order_id).not.toBe(first.work_order_id)
    expect(second.fields).toMatchObject({ retry_of: first.work_order_id, retry_attempt: 2 })
  })

  it('binds verified evidence and its integrity hash into the execution identity', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    specification.approval.status = 'approved'
    for (const field of getModule('proposal')!.required_fields) specification.content.facts.push(createMissionFact({ key: field.key, label: field.label, value: `Confirmed ${field.label}`, source: 'user', confidence: 1 }))
    const source = { source_id: 'evidence-1', name: 'scope.txt', media_type: 'text/plain', retrieval_url: 'https://evidence.example/signed', content_sha256: 'c'.repeat(64), sensitivity: 'confidential' as const, expires_at: '2026-09-06T13:00:00Z' }
    const without = compileApprovedSpecification({ specification, ...ids })
    const withEvidence = compileApprovedSpecification({ specification, ...ids, sources: [source] })
    expect(without.ok && withEvidence.ok).toBe(true)
    if (without.ok && withEvidence.ok) {
      expect(withEvidence.order.sources).toEqual([source])
      expect(withEvidence.order.work_order_id).not.toBe(without.order.work_order_id)
    }
  })

  it('blocks execution when user and evidence values conflict', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    specification.approval.status = 'approved'
    for (const field of getModule('proposal')!.required_fields) specification.content.facts.push(createMissionFact({ key: field.key, label: field.label, value: `Confirmed ${field.label}`, source: 'user', confidence: 1 }))
    specification.content.facts = specification.content.facts.map(fact => fact.key === 'pricing_detail' ? { ...fact, verification_state: 'conflict', conflicts: [{ value: fact.value, normalized_value: fact.normalized_value, source: fact.source, source_reference: fact.source_reference }, { value: '$19,250', normalized_value: '$19,250', source: 'evidence', source_reference: 'evidence-3' }] } : fact)
    const result = compileApprovedSpecification({ specification, ...ids })
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.missing).toContainEqual(expect.objectContaining({ key: 'pricing_detail', reason: expect.stringMatching(/Conflicting values/) }))
  })
})
