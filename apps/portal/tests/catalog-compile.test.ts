import { describe, expect, it } from 'vitest'
import { getCatalog, getModule, getSchema } from '../lib/apollo/packages-loader'
import { createMissionFact } from '../lib/mission-control/contracts'
import { explicitMissionArtifact, interpretMission } from '../lib/mission-control/interpreter'
import { compileApprovedSpecification } from '../lib/mission-control/work-order'
import { parseWorkOrder } from '../lib/executor/contracts'

const UUIDS = {
  specification:'11111111-1111-4111-8111-111111111111',
  conversation:'22222222-2222-4222-8222-222222222222',
  operator:'33333333-3333-4333-8333-333333333333',
}

describe('complete active deliverable catalog', () => {
  const deliverables = getCatalog().industries
    .filter(industry => industry.status === 'active')
    .flatMap(industry => industry.deliverables)

  it('contains the complete 38-deliverable pilot catalog', () => {
    expect(deliverables).toHaveLength(38)
    expect(new Set(deliverables.map(item => item.slug)).size).toBe(deliverables.length)
  })

  for (const deliverable of deliverables) it(`${deliverable.label} is directly reachable through conversational intake`, () => {
    expect(explicitMissionArtifact(`Prepare a ${deliverable.label} using the attached evidence.`)).toBe(deliverable.slug)
    expect(interpretMission(`Prepare a ${deliverable.label} using the attached evidence.`).specification.artifact.recommended_type).toBe(deliverable.slug)
  })

  for (const deliverable of deliverables) it(`${deliverable.slug} locks all required facts into a valid work order`, () => {
    const documentModule = getModule(deliverable.slug)
    expect(documentModule, `missing module for ${deliverable.slug}`).not.toBeNull()
    expect(getSchema(deliverable.slug), `missing output schema for ${deliverable.slug}`).not.toBeNull()

    const specification = interpretMission(`Prepare the ${deliverable.label} for internal pilot validation.`).specification
    specification.artifact.recommended_family = deliverable.industry_label
    specification.artifact.recommended_type = deliverable.slug
    specification.artifact.required_formats = ['pdf']
    specification.content.sections = documentModule!.sections.map(section => section.label)
    specification.content.open_questions = []
    specification.content.assumptions = []
    specification.content.facts = documentModule!.required_fields.map(field => createMissionFact({
      key:field.key,
      label:field.label,
      value:field.type === 'date' ? '2026-09-14' : field.type === 'number' ? '100' : `Verified ${field.label}`,
      source:'user',
      confidence:1,
      sensitivity:'confidential',
    }))
    specification.approval.status = 'approved'

    const compiled = compileApprovedSpecification({
      specification,
      specificationId:UUIDS.specification,
      specificationHash:'b'.repeat(64),
      conversationId:UUIDS.conversation,
      requestedBy:UUIDS.operator,
      driveFolderId:'pilot-catalog-custody',
      now:new Date('2026-09-14T12:00:00.000Z'),
    })
    expect(compiled, `compile failure for ${deliverable.slug}`).toMatchObject({ ok:true })
    if (compiled.ok) expect(parseWorkOrder(compiled.order).deliverable_type).toBe(deliverable.slug)
  })
})
