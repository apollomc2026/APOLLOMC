import { describe, expect, it } from 'vitest'
import { compileApprovedSpecification, continueApprovedMissionLineage, executionGaps, materializeSpecificationDefaults } from '../lib/mission-control/work-order'
import { interpretMission } from '../lib/mission-control/interpreter'
import { getModule } from '../lib/apollo/packages-loader'
import { buildRevisionOrder } from '../lib/mission-control/revision'
import { createMissionFact } from '../lib/mission-control/contracts'
import { formatRevisionDirective } from '../lib/apollo/orchestrate'
import { buildRetryOrder } from '../lib/mission-control/retry'
import type { DocumentWorkOrder } from '../lib/executor/contracts'

const ids = { specificationId: '11111111-1111-4111-8111-111111111111', specificationHash: 'a'.repeat(64), conversationId: '22222222-2222-4222-8222-222222222222', requestedBy: '33333333-3333-4333-8333-333333333333', driveFolderId: 'drive-folder', now: new Date('2026-09-06T12:00:00Z') }

describe('approved specification compiler', () => {
  it('uses quote evidence to resolve identity, validity, narrative variants, and superseded pricing', () => {
    const specification = interpretMission('Create a customer quote for site repairs.').specification
    const now = new Date('2026-09-16T12:00:00Z')
    const facts = [
      createMissionFact({key:'customer_address',label:'Customer address',value:'US Foods — Seabrook, New Hampshire',source:'evidence',source_reference:'source-1',confidence:1},now),
      createMissionFact({key:'quote_date',label:'Quote date',value:'September 16, 2026',source:'evidence',source_reference:'source-1',confidence:1},now),
      createMissionFact({key:'scope_summary',label:'Scope summary',value:'Concrete pedestal reconstruction and loop resealing.\n\nReconstruct three equipment foundations and reseal five vehicle-detection loops.',source:'evidence',source_reference:'source-1',source_references:['source-1','source-2'],confidence:1},now),
      createMissionFact({key:'line_items',label:'Line items',value:'Foundations | 3 | each | $2,400 | $7,200\nLoop reseal | 5 | each | $350 | $1,750',source:'evidence',source_reference:'source-2',confidence:1,verification_state:'conflict',supersession:{controlling_source_reference:'source-2',superseded_source_references:['source-1'],reason:'The final estimate expressly replaces the working estimate.'},conflicts:[{value:'Working total $10,800',normalized_value:'Working total $10,800',source:'evidence',source_reference:'source-1'},{value:'Foundations | 3 | each | $2,400 | $7,200\nLoop reseal | 5 | each | $350 | $1,750',normalized_value:'Foundations | 3 | each | $2,400 | $7,200 Loop reseal | 5 | each | $350 | $1,750',source:'evidence',source_reference:'source-2'}]},now),
      createMissionFact({key:'payment_terms',label:'Payment terms',value:'50% deposit / 50% on completion',source:'default',confidence:.84},now),
    ]
    specification.content.facts=facts
    const gaps=executionGaps(specification,now)
    expect(gaps.map(gap=>gap.key)).not.toEqual(expect.arrayContaining(['customer_name','valid_until','scope_summary','line_items','payment_terms']))
  })

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

  it('binds the selected custom brand through compilation and every revision', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    specification.presentation.brand_profile_id = 'kit:44444444-4444-4444-8444-444444444444'
    specification.approval.status = 'approved'
    for (const field of getModule('proposal')!.required_fields) specification.content.facts.push(createMissionFact({ key:field.key, label:field.label, value:`Confirmed ${field.label}`, source:'user', confidence:1 }))
    const compiled = compileApprovedSpecification({ specification, ...ids })
    expect(compiled.ok).toBe(true)
    if (compiled.ok) {
      expect(compiled.order.brand_id).toBe('kit:44444444-4444-4444-8444-444444444444')
      expect(buildRevisionOrder(compiled.order, 'Tighten the executive summary.').brand_id).toBe(compiled.order.brand_id)
    }
  })

  it('binds revision identity to the effective brand and evidence contents, not expiring retrieval URLs', () => {
    const source = { source_id: 'evidence-1', name: 'scope.pdf', media_type: 'application/pdf', retrieval_url: 'https://evidence.example/first-signature', content_sha256: 'c'.repeat(64), sensitivity: 'confidential' as const, expires_at: '2026-09-06T13:00:00Z' }
    const prior: DocumentWorkOrder = { protocol_version:'1.0',work_order_id:'10000000-0000-4000-8000-000000000001',idempotency_key:'original-work-order-id',project_id:'spec',conversation_id:ids.conversationId,task_id:'10000000-0000-4000-8000-000000000002',requested_by:ids.requestedBy,capability:'professional-document-generation',deliverable_type:'proposal',objective:'Proposal',audience:'Client',formats:['pdf'],fields:{ commercial_value:'$18,500' },sources:[source],brand_id:'kit:brand-a',style_id:'style',sensitivity:'internal',priority:'medium',drive_destination:{folder_id:'drive-folder',lifecycle:'draft'},quality_gates:{schema_validation:true,source_grounding:true,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true},trace:{ specification_id:'spec-v1', specification_hash:'d'.repeat(64), specification_schema_version:'3.0', playbook_id:'field-service-proposal', playbook_version:'1.0', model_versions:['apollo-deterministic-interpreter@1.0'], required_checks:['source_grounding'], accepted_unresolved_items:[] },created_at:'2026-09-07T00:00:00.000Z' }
    const instruction = 'Regenerate using current approved evidence.'
    const original = buildRevisionOrder(prior, instruction)
    const rotatedUrl = buildRevisionOrder({ ...prior, sources:[{ ...source, retrieval_url:'https://evidence.example/rotated-signature', expires_at:'2026-09-06T14:00:00Z' }] }, instruction)
    const changedBrand = buildRevisionOrder({ ...prior, brand_id:'kit:brand-b' }, instruction)
    const changedContents = buildRevisionOrder({ ...prior, sources:[{ ...source, content_sha256:'e'.repeat(64) }] }, instruction)

    expect(rotatedUrl.work_order_id).toBe(original.work_order_id)
    expect(changedBrand.work_order_id).not.toBe(original.work_order_id)
    expect(changedContents.work_order_id).not.toBe(original.work_order_id)
    expect(original).toMatchObject({
      brand_id:'kit:brand-a',
      sources:[{ source_id:'evidence-1', content_sha256:'c'.repeat(64) }],
      fields:{ commercial_value:'$18,500', revision_of:prior.work_order_id },
      quality_gates:prior.quality_gates,
      trace:prior.trace,
    })
  })

  it('continues artifact lineage when edited mission data is explicitly reapproved', () => {
    const prior:DocumentWorkOrder = { protocol_version:'1.0',work_order_id:'10000000-0000-4000-8000-000000000001',idempotency_key:'prior',project_id:'old-spec',conversation_id:ids.conversationId,task_id:'10000000-0000-4000-8000-000000000002',requested_by:ids.requestedBy,capability:'professional-document-generation',deliverable_type:'proposal',objective:'Old objective',audience:'Client',formats:['pdf'],fields:{ artifact_version:3 },sources:[],brand_id:'kit:brand-a',style_id:'style',sensitivity:'internal',priority:'medium',drive_destination:{folder_id:'drive-folder',lifecycle:'draft'},quality_gates:{schema_validation:true,source_grounding:true,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true},created_at:'2026-09-07T00:00:00.000Z' }
    const updated = { ...prior, work_order_id:'20000000-0000-4000-8000-000000000001', idempotency_key:'updated-spec', project_id:'new-spec', objective:'Updated objective', fields:{ client_name:'Acme' }, brand_id:'kit:brand-b' }
    const continued = continueApprovedMissionLineage(updated, prior)
    expect(continued).toMatchObject({ work_order_id:updated.work_order_id, idempotency_key:'updated-spec', project_id:'new-spec', objective:'Updated objective', brand_id:'kit:brand-b', fields:{ client_name:'Acme', artifact_version:4, revision_of:prior.work_order_id, revision_instruction:expect.stringMatching(/updated and explicitly reapproved/) } })
    expect(continued.fields).not.toHaveProperty('old_objective')
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

  it('does not block the selected deliverable on stale conflicts from another module', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    for (const field of getModule('proposal')!.required_fields) specification.content.facts.push(createMissionFact({ key: field.key, label: field.label, value: `Confirmed ${field.label}`, source: 'user', confidence: 1 }))
    specification.content.facts.push({ ...createMissionFact({ key: 'party_a_name', label: 'Party A', value: 'On Spot', source: 'inferred', confidence: .8 }), verification_state: 'conflict' })
    expect(executionGaps(specification)).not.toEqual(expect.arrayContaining([expect.objectContaining({ key: 'party_a_name' })]))
  })

  it('materializes publication defaults in the specification before approval',()=>{
    const now=new Date('2026-09-17T01:00:00Z')
    const quote=interpretMission('Create a quote for Acme.').specification;quote.artifact.recommended_type='quote'
    const materialized=materializeSpecificationDefaults(quote,now)
    expect(materialized.content.facts).toEqual(expect.arrayContaining([
      expect.objectContaining({key:'quote_date',value:'2026-09-17',source:'default'}),
      expect.objectContaining({key:'valid_until',value:'2026-10-17',source:'default'}),
    ]))
    expect(materialized.provenance.defaults).toEqual(expect.arrayContaining([expect.objectContaining({key:'quote_date',value:'2026-09-17'})]))
    const reviewed=materializeSpecificationDefaults(materialized,new Date('2026-09-18T01:00:00Z'))
    expect(reviewed.content.facts.find(fact=>fact.key==='quote_date')?.value).toBe('2026-09-17')
  })
})
