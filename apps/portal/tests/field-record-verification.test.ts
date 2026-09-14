import { describe, expect, it } from 'vitest'
import { verifyFieldRecord } from '../lib/executor/field-record-verification'
import type { DocumentWorkOrder } from '../lib/executor/contracts'

const daily = {
  deliverable_type:'daily-construction-report',
  fields:{
    project_name:'Nashua Garage Loop Installation', job_number:'WT 3154', site_location:'19 Elm Street, Nashua, NH', prepared_by:'Jonathan Sargent — Principal, OSHA-30', day_summary:'Day 3 — Complete',
    crew_roster:'Jonathan Sargent | Principal / QC | 6.5 | OSHA-30\nTomas Galeano | Technician | 6.5 | OJT',
    work_performed:'07:00–09:00 | Verified loops P1-L1 through P1-L7',
    work_status:'Plaza 1 | 7 loops | QC PASS | Open to traffic',
  },
} as unknown as DocumentWorkOrder

const dailyHtml = `<h2>Report Details</h2><p>Nashua Garage Loop Installation · WT 3154 · 19 Elm Street, Nashua, NH · Jonathan Sargent — Principal, OSHA-30 · Day 3 — Complete</p><table><tr><td>Jonathan Sargent</td><td>Principal / QC</td><td>6.5</td><td>OSHA-30</td></tr><tr><td>Tomas Galeano</td><td>Technician</td><td>6.5</td><td>OJT</td></tr></table><table><tr><td>07:00–09:00</td><td>Verified loops P1-L1 through P1-L7</td></tr></table><table><tr><td>Plaza 1</td><td>7 loops</td><td>QC PASS</td><td>Open to traffic</td></tr></table>`

describe('deterministic field-record verification', () => {
  it('retains approved daily-report identity and operational rows', () => {
    const report = verifyFieldRecord(daily,dailyHtml)
    expect(report.required).toBe(true)
    expect(report.verified_rows).toBe(4)
  })

  it('fails closed when a crew or work row is changed', () => {
    expect(()=>verifyFieldRecord(daily,dailyHtml.replace('6.5</td><td>OJT','8.0</td><td>OJT'))).toThrow(/crew_roster row 2 was changed or omitted/)
  })

  it('retains exact QC criteria and measured results', () => {
    const order = { deliverable_type:'final-qc-report', fields:{ project_name:'Nashua Garage Loop Installation',job_number:'WT 3154',project_period:'May 11–13, 2026',inspector:'Jonathan Sargent — QC Inspector',completion_statement:'All 19 loops verified PASS',acceptance_criteria:'DC Resistance | < 5 Ω | 5–8 Ω | > 8 Ω',test_results:'P1-L1 | Garden St S | ~3 Ω | PASS' } } as unknown as DocumentWorkOrder
    const html='<p>Nashua Garage Loop Installation WT 3154 May 11–13, 2026 Jonathan Sargent — QC Inspector All 19 loops verified PASS</p><table><tr><td>DC Resistance</td><td>&lt; 5 Ω</td><td>5–8 Ω</td><td>&gt; 8 Ω</td></tr></table><table><tr><td>P1-L1</td><td>Garden St S</td><td>~3 Ω</td><td>PASS</td></tr></table>'
    expect(verifyFieldRecord(order,html).verified_rows).toBe(2)
  })

  it('does not impose field checks on unrelated deliverables', () => {
    expect(verifyFieldRecord({ ...daily,deliverable_type:'proposal' },'')).toEqual({ required:false,verified_fields:[],verified_rows:0 })
  })
})
