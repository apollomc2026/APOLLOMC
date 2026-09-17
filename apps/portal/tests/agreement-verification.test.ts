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

  it('retains contract-review anchors and identifies every reviewed source', () => {
    const review={deliverable_type:'contract-intelligence-review',fields:{contract_title:'Platinum Vehicle Service Agreement',contracting_parties:'Customer and Secure Warranty Administrators',effective_date:'2025-06-01',expiration_date:'2030-06-01',current_status:'Active',governing_law:'Commonwealth of Massachusetts',material_obligations:'Submit claim within 30 days | Section 8, page 14',commercial_rights_and_limits:'Deductible | $100 per repair visit | Schedule A, page 22'},sources:[{name:'Vehicle_Warranty_Contract.pdf'}]} as unknown as DocumentWorkOrder
    const html='<p>Platinum Vehicle Service Agreement between Customer and Secure Warranty Administrators. Effective 2025-06-01; expires 2030-06-01; status Active; governed by the Commonwealth of Massachusetts.</p><p>Submit claim within 30 days — Section 8, page 14.</p><p>Deductible: $100 per repair visit — Schedule A, page 22.</p><h2>Clause and Source Index</h2><p>Vehicle Warranty Contract, pages 1–28.</p><footer>Operational contract intelligence; not legal advice.</footer>'
    expect(verifyAgreementDocument(review,html)).toMatchObject({required:true,verified_fields:expect.arrayContaining(['contract_title','material_obligations:1','commercial_rights_and_limits:1','source:Vehicle_Warranty_Contract.pdf','boundary:not-legal-advice'])})
  })

  it('fails closed when a contract-review source disappears from the source index', () => {
    const review={deliverable_type:'contract-intelligence-review',fields:{contract_title:'Platinum Vehicle Service Agreement'},sources:[{name:'Vehicle_Warranty_Contract.pdf'},{name:'Amendment_1.pdf'}]} as unknown as DocumentWorkOrder
    expect(()=>verifyAgreementDocument(review,'<p>Platinum Vehicle Service Agreement. Source: Vehicle Warranty Contract. Not legal advice.</p>')).toThrow(/Amendment_1.pdf was omitted/)
  })

  it('fails closed when an approved monetary contract right is reassigned or omitted',()=>{
    const review={deliverable_type:'contract-intelligence-review',fields:{contract_title:'Service Agreement',commercial_rights_and_limits:'Deductible | $100 per repair visit | Schedule A, page 22'},sources:[{name:'Service_Agreement.pdf'}]} as unknown as DocumentWorkOrder
    const html='<p>Service Agreement. Service Agreement source. The deductible is $250 per repair visit. Schedule A, page 22. This is not legal advice.</p>'
    expect(()=>verifyAgreementDocument(review,html)).toThrow(/commercial_rights_and_limits item 1 was changed or omitted/)
  })

  it('does not impose contract checks on unrelated deliverables', () => {
    expect(verifyAgreementDocument({ ...order, deliverable_type:'proposal' }, '')).toEqual({ required:false, verified_fields:[] })
  })
})
