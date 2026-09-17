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

  it('retains the approved market-pricing provenance, citations, and benchmark figures',()=>{
    const order={deliverable_type:'quote',fields:{
      line_items:'Field labor | 16 | hour | $135.00 | $2,160.00',
      market_pricing_research_required:'true',
      market_pricing_basis:'Research date: 2026-09-17\nGeography: New Hampshire\nField labor | USD 110.00–165.00 per hour | typical USD 135.00 | Published regional schedule | https://official.example/rates',
    }} as unknown as DocumentWorkOrder
    const html='<table><tr><td>Field labor</td><td>16</td><td>hour</td><td>$135.00</td><td>$2,160.00</td></tr></table><section><p>Research date: 2026-09-17. Geography: New Hampshire.</p><p>Published benchmark: USD 110.00–165.00 per hour; typical USD 135.00.</p><a href="https://official.example/rates">Official rate schedule</a></section>'
    expect(verifyCommercialDocument(order,html)).toEqual({required:true,verified_rows:1,verified_figures:0})
  })

  it('fails closed when a market-informed quote omits its public citation',()=>{
    const order={deliverable_type:'quote',fields:{
      line_items:'Field labor | 16 | hour | $135.00 | $2,160.00',
      market_pricing_research_required:'true',
      market_pricing_basis:'Research date: 2026-09-17\nGeography: New Hampshire\nField labor | USD 110.00–165.00 per hour | typical USD 135.00 | https://official.example/rates',
    }} as unknown as DocumentWorkOrder
    const html='<p>Field labor 16 hour $135.00 $2,160.00. Research date 2026-09-17. Geography New Hampshire. USD 110.00–165.00, typical USD 135.00.</p>'
    expect(()=>verifyCommercialDocument(order,html)).toThrow(/market pricing source/)
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

  it('retains proposal identity, pricing model, and every approved pricing figure',()=>{
    const order={deliverable_type:'proposal',fields:{prospect_organization:'Riverfront Center',pricing_model:'milestone-based',pricing_detail:'Mobilization: $4,500; Field execution: $18,750; Closeout: $3,250; Total: $26,500'}} as unknown as DocumentWorkOrder
    const html='<h2>Proposal for Riverfront Center</h2><p>Milestone-based investment.</p><table><tr><td>Mobilization</td><td>$4,500</td></tr><tr><td>Field execution</td><td>$18,750</td></tr><tr><td>Closeout</td><td>$3,250</td></tr><tr><td>Total</td><td>$26,500</td></tr></table>'
    expect(verifyCommercialDocument(order,html)).toEqual({required:true,verified_rows:6,verified_figures:4})
  })

  it('fails closed when a proposal price is altered',()=>{
    const order={deliverable_type:'proposal',fields:{prospect_organization:'Riverfront Center',pricing_model:'fixed-fee',pricing_detail:'Total: $26,500'}} as unknown as DocumentWorkOrder
    expect(()=>verifyCommercialDocument(order,'<p>Riverfront Center fixed fee total $25,600</p>')).toThrow(/pricing_detail row 1/)
  })

  it('fails closed when proposal prices are reassigned between approved rows',()=>{
    const order={deliverable_type:'proposal',fields:{prospect_organization:'Riverfront Center',pricing_model:'milestone-based',pricing_detail:'Mobilization: $4,500; Closeout: $3,250; Total: $7,750'}} as unknown as DocumentWorkOrder
    const html='<h2>Riverfront Center</h2><p>Milestone-based pricing.</p><table><tr><td>Mobilization</td><td>$3,250</td></tr><tr><td>Closeout</td><td>$4,500</td></tr><tr><td>Total</td><td>$7,750</td></tr></table><p>Approved figures include $4,500 and $3,250.</p>'
    expect(()=>verifyCommercialDocument(order,html)).toThrow(/pricing_detail row 1 was changed, reassigned, or omitted/)
  })

  it('does not impose commercial checks on unrelated deliverables',()=>{
    const order={deliverable_type:'meeting-minutes',fields:{}} as unknown as DocumentWorkOrder
    expect(verifyCommercialDocument(order,'')).toEqual({required:false,verified_rows:0,verified_figures:0})
  })
})
