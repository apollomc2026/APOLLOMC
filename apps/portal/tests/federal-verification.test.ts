import { describe, expect, it } from 'vitest'
import { verifyFederalDocument } from '../lib/executor/federal-verification'
import type { DocumentWorkOrder } from '../lib/executor/contracts'

const order = {
  deliverable_type:'federal-proposal',
  fields:{
    solicitation_number:'W911QY-26-R-0001',
    solicitation_title:'Field Intelligence Modernization',
    issuing_agency:'Department of Defense, Army Contracting Command',
    offeror_name:'Apollo Mission Control LLC',
    naics_code:'541512',
    set_aside:'SDVOSB',
  },
} as unknown as DocumentWorkOrder

describe('deterministic federal response verification', () => {
  it('retains approved solicitation and offeror anchors', () => {
    const report = verifyFederalDocument(order, '<h2>Response</h2><p>Apollo Mission Control LLC responds to W911QY-26-R-0001, Field Intelligence Modernization, issued by Department of Defense, Army Contracting Command. NAICS 541512. Set-aside: SDVOSB.</p>')
    expect(report).toEqual({ required:true, verified_fields:['solicitation_number','solicitation_title','issuing_agency','offeror_name','naics_code','set_aside'] })
  })

  it('fails closed when approved federal identity data is changed or omitted', () => {
    expect(() => verifyFederalDocument(order, '<p>Apollo Mission Control LLC responds to W911QY-26-R-9999 for Field Intelligence Modernization under NAICS 541511.</p>')).toThrow(/solicitation_number, issuing_agency, naics_code, set_aside were changed or omitted/)
  })

  it('does not impose federal checks on unrelated deliverables', () => {
    expect(verifyFederalDocument({ ...order, deliverable_type:'proposal' }, '')).toEqual({ required:false, verified_fields:[] })
  })
})
