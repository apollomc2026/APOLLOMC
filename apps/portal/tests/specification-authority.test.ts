import { describe, expect, it } from 'vitest'
import { assertSpecificationAuthority, isApolloControlledOrder } from '../lib/executor/specification-authority'
import type { DocumentWorkOrder } from '../lib/executor/contracts'
import type { DeliverableSpecification } from '../lib/mission-control/contracts'

const specification = { approval:{status:'approved'}, artifact:{recommended_type:'quote'}, presentation:{brand_profile_id:'apollo'} } as DeliverableSpecification
const order = { project_id:'10000000-0000-4000-8000-000000000001', conversation_id:'20000000-0000-4000-8000-000000000002', requested_by:'30000000-0000-4000-8000-000000000003', deliverable_type:'quote', brand_id:'apollo', trace:{specification_id:'10000000-0000-4000-8000-000000000001',specification_hash:'a'.repeat(64)} } as DocumentWorkOrder
const row = { id:order.project_id, conversation_id:order.conversation_id, content_hash:order.trace!.specification_hash, status:'approved', approved_by:order.requested_by, specification }

describe('approved specification authority', () => {
  it('accepts only a fully matching APOLLO work order', () => {
    expect(() => assertSpecificationAuthority(order,row)).not.toThrow()
    expect(isApolloControlledOrder(order)).toBe(true)
  })
  it('rejects stale hashes, changed deliverables, changed brands, and cross-project records', () => {
    expect(() => assertSpecificationAuthority({...order,trace:{...order.trace!,specification_hash:'b'.repeat(64)}},row)).toThrow(/hash/)
    expect(() => assertSpecificationAuthority({...order,deliverable_type:'fsr'},row)).toThrow(/deliverable/)
    expect(() => assertSpecificationAuthority({...order,brand_id:'metis'},row)).toThrow(/brand/)
    expect(isApolloControlledOrder({...order,brand_id:'atlas'})).toBe(false)
  })
})
