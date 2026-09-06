import { describe, expect, it } from 'vitest'
import { getModule } from '../lib/apollo/packages-loader'
import { interpretMission } from '../lib/mission-control/interpreter'
import { compileApprovedSpecification } from '../lib/mission-control/work-order'

const golden = [
  ['field-service proposal', 'Prepare a proposal for the client site work.', 'proposal'],
  ['inspection proposal', 'Prepare a decisive field service proposal using the attached inspection evidence.', 'proposal'],
  ['balanced agreement', 'Prepare a balanced service agreement with termination terms.', 'contract-package'],
  ['site report', 'Prepare the daily construction site report with photos.', 'daily-construction-report'],
  ['capability statement', 'Prepare our concise capability statement for an executive audience.', 'capability-statement'],
  ['financial package', 'Prepare a cash flow budget forecast with variance analysis.', 'cash-flow-budget-package'],
  ['government response', 'Prepare a response to this federal RFP solicitation.', 'federal-proposal'],
] as const

describe('guiding-light golden missions', () => {
  for (const [name, prompt, type] of golden) it(`${name} routes and compiles without invented gaps when all facts are supplied`, () => {
    const specification = interpretMission(prompt).specification
    expect(specification.artifact.recommended_type).toBe(type)
    for (const field of getModule(type)!.required_fields) specification.content.facts.push({ key: field.key, label: field.label, value: `Verified ${field.label}`, source: 'user', confidence: 1 })
    specification.approval.status = 'approved'
    const result = compileApprovedSpecification({ specification, specificationId: '11111111-1111-4111-8111-111111111111', specificationHash: 'b'.repeat(64), conversationId: '22222222-2222-4222-8222-222222222222', requestedBy: '33333333-3333-4333-8333-333333333333', callbackUrl: 'https://metis-sage.vercel.app/api/apollo/callback', driveFolderId: 'golden-mission-custody', now: new Date('2026-09-06T12:00:00Z') })
    expect(result.ok).toBe(true)
  })
})
