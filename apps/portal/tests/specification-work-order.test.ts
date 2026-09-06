import { describe, expect, it } from 'vitest'
import { compileApprovedSpecification } from '../lib/mission-control/work-order'
import { interpretMission } from '../lib/mission-control/interpreter'
import { getModule } from '../lib/apollo/packages-loader'
import { buildRevisionOrder } from '../lib/mission-control/revision'

const ids = { specificationId: '11111111-1111-4111-8111-111111111111', specificationHash: 'a'.repeat(64), conversationId: '22222222-2222-4222-8222-222222222222', requestedBy: '33333333-3333-4333-8333-333333333333', callbackUrl: 'https://metis-sage.vercel.app/api/apollo/callback', driveFolderId: 'drive-folder', now: new Date('2026-09-06T12:00:00Z') }

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
    if (!result.ok) expect(result.missing.map(item => item.key)).toEqual(expect.arrayContaining(['prospect_contact_name', 'proposed_methodology']))
  })

  it('uses stable job identities when an approved version is submitted again', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    specification.approval.status = 'approved'
    for (const field of getModule('proposal')!.required_fields) specification.content.facts.push({ key: field.key, label: field.label, value: `Confirmed ${field.label}`, source: 'user', confidence: 1 })
    const first = compileApprovedSpecification({ specification, ...ids })
    const second = compileApprovedSpecification({ specification, ...ids })
    expect(first.ok).toBe(true); expect(second.ok).toBe(true)
    if (first.ok && second.ok) {
      expect(first.order.work_order_id).toBe(second.order.work_order_id)
      expect(first.order.task_id).toBe(second.order.task_id)
    }
  })

  it('preserves the prior draft and makes identical revision instructions idempotent', () => {
    const specification = interpretMission('Send a proposal to Acme Facilities for $18,500 before October 15, 2026.').specification
    specification.approval.status = 'approved'
    for (const field of getModule('proposal')!.required_fields) specification.content.facts.push({ key: field.key, label: field.label, value: `Confirmed ${field.label}`, source: 'user', confidence: 1 })
    const compiled = compileApprovedSpecification({ specification, ...ids })
    expect(compiled.ok).toBe(true)
    if (compiled.ok) {
      const first = buildRevisionOrder(compiled.order, 'Make the executive summary more concise.')
      const second = buildRevisionOrder(compiled.order, 'Make the executive summary more concise.')
      expect(first.work_order_id).toBe(second.work_order_id)
      expect(first.work_order_id).not.toBe(compiled.order.work_order_id)
      expect(first.fields.revision_of).toBe(compiled.order.work_order_id)
    }
  })
})
