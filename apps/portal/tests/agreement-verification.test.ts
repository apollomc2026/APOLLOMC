import { describe, expect, it } from 'vitest'
import { verifyAgreementDocument } from '../lib/executor/agreement-verification'
import type { DocumentWorkOrder } from '../lib/executor/contracts'

const order = {
  deliverable_type:'contract-package',
  fields:{ party_a_name:'On Spot Solutions LLC', party_b_name:'Riverfront Center', governing_law:'Commonwealth of Massachusetts', term_length:'12 months' },
} as unknown as DocumentWorkOrder

describe('deterministic agreement verification', () => {
  it('retains approved parties, governing law, and term', () => {
    const report = verifyAgreementDocument(order, '<h2>Parties</h2><p>This agreement is between On Spot Solutions LLC and Riverfront Center for 12 months and is governed by the Commonwealth of Massachusetts.</p>')
    expect(report).toEqual({ required:true, verified_fields:['party_a_name','party_b_name','governing_law','term_length'] })
  })

  it('fails closed when an approved legal anchor is changed or omitted', () => {
    expect(() => verifyAgreementDocument(order, '<p>Agreement between On Spot Solutions LLC and Riverfront Center for 24 months under New Hampshire law.</p>')).toThrow(/governing_law, term_length were changed or omitted/)
  })

  it('does not impose contract checks on unrelated deliverables', () => {
    expect(verifyAgreementDocument({ ...order, deliverable_type:'proposal' }, '')).toEqual({ required:false, verified_fields:[] })
  })
})
