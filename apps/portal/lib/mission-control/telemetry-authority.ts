import type { DocumentWorkOrder } from '@/lib/executor/contracts'

export interface CurrentSpecificationIdentity {
  specification_id:string
  specification_hash:string
  version:number
  title:string
  deliverable_type:string
  display_title?:string
  display_context?:string
  specification?:import('./contracts').DeliverableSpecification
}

export function jobMatchesCurrentSpecification(job:{deliverable_type:string;work_order:DocumentWorkOrder|null},identity:CurrentSpecificationIdentity|undefined){
  const order=job.work_order
  return Boolean(identity&&order
    &&job.deliverable_type===identity.deliverable_type
    &&order.deliverable_type===identity.deliverable_type
    &&order.trace?.specification_id===identity.specification_id
    &&order.trace?.specification_hash===identity.specification_hash)
}
