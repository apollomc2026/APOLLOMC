import { describe,expect,it } from 'vitest'
import type { DocumentWorkOrder } from '../lib/executor/contracts'
import { jobMatchesCurrentSpecification } from '../lib/mission-control/telemetry-authority'

const identity={specification_id:'spec-v4',specification_hash:'a'.repeat(64),version:4,title:'Final QC Report',deliverable_type:'final-qc-report'}
const order={work_order_id:'job',conversation_id:'mission',requested_by:'user',deliverable_type:'final-qc-report',trace:{specification_id:identity.specification_id,specification_hash:identity.specification_hash}} as DocumentWorkOrder

describe('telemetry specification authority',()=>{
  it('treats only jobs bound to the current specification as current mission state',()=>{
    expect(jobMatchesCurrentSpecification({deliverable_type:'final-qc-report',work_order:order},identity)).toBe(true)
    expect(jobMatchesCurrentSpecification({deliverable_type:'contract-package',work_order:{...order,deliverable_type:'contract-package'}},identity)).toBe(false)
    expect(jobMatchesCurrentSpecification({deliverable_type:'final-qc-report',work_order:{...order,trace:{...order.trace!,specification_hash:'b'.repeat(64)}}},identity)).toBe(false)
    expect(jobMatchesCurrentSpecification({deliverable_type:'final-qc-report',work_order:null},identity)).toBe(false)
  })
})
