import { describe,expect,it } from 'vitest'
import { verifyCommercialDocument } from '../lib/executor/commercial-verification'
import type { DocumentWorkOrder } from '../lib/executor/contracts'

describe('deterministic commercial verification',()=>{
  it('retains every approved quote line item',()=>{
    const order={deliverable_type:'quote',fields:{line_items:'Loop sealant | 5 | bottle | $42.00 | $210.00\nField labor | 16 | hour | $125.00 | $2,000.00'}} as unknown as DocumentWorkOrder
    const html='<table><tr><td>Loop sealant</td><td>5</td><td>bottle</td><td>$42.00</td><td>$210.00</td></tr><tr><td>Field labor</td><td>16</td><td>hour</td><td>$125.00</td><td>$2,000.00</td></tr></table>'
    expect(verifyCommercialDocument(order,html)).toEqual({required:true,verified_rows:2,verified_figures:0})
  })

  it('verifies semicolon-delimited quote line items as separate rows',()=>{
    const order={deliverable_type:'quote',fields:{line_items:'Field labor: 4 planned field days × $2,000/day = $8,000; Deployment charges: 4 deployments × $150 = $600; Materials allowance: Concrete, reinforcing steel, anchors = $1,200; Working Project Total = $9,800'}} as unknown as DocumentWorkOrder
    const html='<table><tr><td>Field labor</td><td>4 planned field days</td><td>$2,000/day</td><td>$8,000</td></tr><tr><td>Deployment charges</td><td>4 deployments</td><td>$150</td><td>$600</td></tr><tr><td>Materials allowance</td><td>Concrete, reinforcing steel, anchors</td><td>$1,200</td></tr><tr><td>Working Project Total</td><td>$9,800</td></tr></table>'
    expect(verifyCommercialDocument(order,html)).toEqual({required:true,verified_rows:4,verified_figures:0})
  })

  it('fails closed when an invoice row changes',()=>{
    const order={deliverable_type:'invoice',fields:{line_items:'LAB-01 | Field labor | 16 | $125.00 | No | $2,000.00'}} as unknown as DocumentWorkOrder
    expect(()=>verifyCommercialDocument(order,'<table><tr><td>LAB-01</td><td>Field labor</td><td>18</td><td>$125.00</td><td>No</td><td>$2,250.00</td></tr></table>')).toThrow(/line_items row 1 was changed or omitted/)
  })

  it('verifies change-order cost rows and computed contract sum',()=>{
    const order={deliverable_type:'change-order',fields:{cost_breakdown:'Labor | $5,000.00\nMaterials | $2,500.00\nTotal Change Order Amount | $7,500.00',original_contract_sum_dollars:100000,prior_change_orders_total_dollars:5000,cost_impact_dollars:7500}} as unknown as DocumentWorkOrder
    const html='<table><tr><td>Labor</td><td>$5,000.00</td></tr><tr><td>Materials</td><td>$2,500.00</td></tr><tr><td>Total Change Order Amount</td><td>$7,500.00</td></tr></table><p>Original Contract Sum $100,000.00; prior changes $5,000.00; contract before this change $105,000.00; this change $7,500.00; new contract sum $112,500.00.</p>'
    expect(verifyCommercialDocument(order,html)).toEqual({required:true,verified_rows:3,verified_figures:5})
  })

  it('fails closed when computed change-order sum is wrong',()=>{
    const order={deliverable_type:'change-order',fields:{cost_breakdown:'Total Change Order Amount | $7,500.00',original_contract_sum_dollars:100000,prior_change_orders_total_dollars:5000,cost_impact_dollars:7500}} as unknown as DocumentWorkOrder
    const html='<p>Total Change Order Amount $7,500.00. Original $100,000.00. Prior $5,000.00. Before $105,000.00. New $111,500.00.</p>'
    expect(()=>verifyCommercialDocument(order,html)).toThrow(/contract-sum figure 112500 was changed or omitted/)
  })

  it('does not impose commercial checks on unrelated deliverables',()=>{
    const order={deliverable_type:'proposal',fields:{}} as unknown as DocumentWorkOrder
    expect(verifyCommercialDocument(order,'')).toEqual({required:false,verified_rows:0,verified_figures:0})
  })
})
