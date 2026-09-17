import { describe, expect, it } from 'vitest'
import { getModule } from '../lib/apollo/packages-loader'
import { createMissionFact, mergeMissionFacts, specificationProvenance } from '../lib/mission-control/contracts'
import { interpretMission } from '../lib/mission-control/interpreter'
import { canonicalDeliverableTitle, canonicalizeSpecificationIdentity } from '../lib/mission-control/identity'
import { compileApprovedSpecification, executionGaps } from '../lib/mission-control/work-order'
import { buildRevisionOrder } from '../lib/mission-control/revision'
import { applyClaudeInterpretation, applyExpertRecommendationMode } from '../lib/mission-control/ai-interpreter'

const PILOT_CLASSES = [
  { slug:'fsr', request:'Create a Field Service Report.' },
  { slug:'final-qc-report', request:'Create a Final Quality Control Report.' },
  { slug:'quote', request:'Create a customer Quote.' },
  { slug:'proposal', request:'Create a Consulting Proposal.' },
  { slug:'cash-flow-budget-package', request:'Create a Cash Flow Forecast and Budget Package.' },
  { slug:'contract-intelligence-review', request:'Create a Contract Intelligence Review.' },
] as const

function supportedValue(key:string,label:string,index:number) {
  if(key==='site_address'||key==='project_address'||key==='customer_address') return '100 Industrial Way, Worcester, MA 01608'
  if(/date|as_of/i.test(key)) return '2026-09-16'
  if(/hours|days|percent|rate|amount|value|total|price|cost/i.test(key)) return String(10 + index)
  if(/line|results|comparison|assumptions|items|phases|methodology|criteria|documents/i.test(key)) return `${label} item A | verified\n${label} item B | verified`
  return `Verified ${label}`
}

describe.each(PILOT_CLASSES)('$slug pilot mechanics', ({ slug,request }) => {
  it('resolves every noncritical default in one expert-recommendation action without altering evidence', () => {
    const module=getModule(slug)!
    const safelyDelegated=new Set(slug==='proposal'
      ? ['win_themes','proposed_methodology','risks_and_mitigations','assumptions','validity_period_days','next_steps_call_to_action']
      : slug==='quote'?['valid_until','payment_terms']:[])
    const base=interpretMission(request)
    const evidenceFacts=module.required_fields.filter(field=>!safelyDelegated.has(field.key)).map((field,index)=>createMissionFact({
      key:field.key,label:field.label,value:supportedValue(field.key,field.label,index),source:'evidence',source_reference:'pilot-evidence',confidence:1,
    },new Date('2026-09-16T12:00:00.000Z')))
    base.specification.content.facts=mergeMissionFacts(base.specification.content.facts,evidenceFacts)
    base.specification.sources=[{id:'pilot-evidence',name:'pilot-evidence.pdf',status:'verified'}]
    const patch=applyExpertRecommendationMode({},'Use your expert recommendations for every unresolved decision.',base.specification)
    const result=applyClaudeInterpretation(base,patch)
    expect(executionGaps(result.specification)).toEqual([])
    for(const evidence of evidenceFacts)expect(result.specification.content.facts).toContainEqual(expect.objectContaining({key:evidence.key,value:evidence.value,source:'evidence'}))
    expect(result.specification.content.facts.filter(fact=>fact.source==='inferred').every(fact=>!['customer_name','line_items','pricing_detail','test_results','base_case_lines','contracting_parties'].includes(fact.key))).toBe(true)
  })

  it('carries one specification identity through evidence, launch, duplicate submission, and regeneration', () => {
    const module=getModule(slug)
    expect(module).not.toBeNull()
    let specification=interpretMission(request).specification
    expect(specification.artifact.recommended_type).toBe(slug)
    const evidenceFacts=module!.required_fields.map((field,index)=>createMissionFact({
      key:field.key,label:field.label,value:supportedValue(field.key,field.label,index),source:'evidence',source_reference:`source-${index % 2 + 1}`,confidence:1,
    },new Date('2026-09-16T12:00:00.000Z')))
    specification.content.facts=mergeMissionFacts(specification.content.facts,evidenceFacts,new Date('2026-09-16T12:00:00.000Z'))
    specification.sources=[{id:'source-1',name:'primary-evidence.pdf',status:'verified'}]
    specification.provenance=specificationProvenance(specification.content.facts,specification.provenance.created_at)
    specification.content.open_questions=[]
    specification.content.assumptions=[]
    specification.approval={status:'approved',approved_by:'pilot-operator',approved_at:'2026-09-16T12:05:00.000Z',unresolved_items_accepted:[]}
    specification=canonicalizeSpecificationIdentity(specification)

    expect(executionGaps(specification)).toEqual([])
    expect(specification.mission.title).toBe(canonicalDeliverableTitle(specification))
    expect(specification.provenance.fact_origins.filter(origin=>origin.source==='evidence')).toHaveLength(evidenceFacts.length)
    expect(specification.provenance.fact_origins.filter(origin=>origin.source==='evidence').every(origin=>origin.source_reference?.startsWith('source-'))).toBe(true)

    const input={
      specification,specificationId:`spec-${slug}`,specificationHash:'a'.repeat(64),conversationId:`mission-${slug}`,requestedBy:'pilot-operator',driveFolderId:'pilot-drive',
      sources:[{source_id:'source-1',name:'primary-evidence.pdf',media_type:'application/pdf',retrieval_url:'https://evidence.invalid/signed',content_sha256:'b'.repeat(64),sensitivity:'confidential' as const,expires_at:'2026-09-16T13:00:00.000Z'}],
      now:new Date('2026-09-16T12:10:00.000Z'),
    }
    const first=compileApprovedSpecification(input)
    const duplicate=compileApprovedSpecification(input)
    expect(first.ok && duplicate.ok).toBe(true)
    if(!first.ok || !duplicate.ok)return
    expect(first.order.work_order_id).toBe(duplicate.order.work_order_id)
    expect(first.order.deliverable_type).toBe(slug)
    expect(first.order.sources).toEqual(input.sources)
    const revision=buildRevisionOrder(first.order,'Tighten the executive language without changing verified facts or figures.')
    expect(revision.work_order_id).not.toBe(first.order.work_order_id)
    expect(revision.deliverable_type).toBe(slug)
    expect(revision.sources).toEqual(first.order.sources)
    expect(revision.fields).toMatchObject(first.order.fields)
  })

  it('blocks a contradictory required scalar instead of silently selecting a value', () => {
    const module=getModule(slug)!
    const scalar=module.required_fields.find(field=>!/(summary|scope|work|findings|observations|recommendations|exclusions|assumptions|risks|methodology|results|documents|obligations|line)/i.test(field.key))
      ?? module.optional_fields.find(field=>field.key==='effective_date')
      ?? module.required_fields[0]
    expect(scalar).toBeDefined()
    const specification=interpretMission(request).specification
    specification.sources=[{id:'source-a',name:'agreement.pdf',status:'verified'}]
    specification.content.facts=mergeMissionFacts(specification.content.facts,[
      createMissionFact({key:scalar.key,label:scalar.label,value:'Source A controlling value',source:'evidence',source_reference:'source-a',confidence:1}),
      createMissionFact({key:scalar.key,label:scalar.label,value:'Source B contradictory value',source:'evidence',source_reference:'source-b',confidence:1}),
    ])
    expect(executionGaps(specification)).toContainEqual(expect.objectContaining({key:scalar.key,reason:expect.stringMatching(/Conflicting values/)}))
  })
})
