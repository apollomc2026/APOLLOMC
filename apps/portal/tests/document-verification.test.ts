import {describe,expect,it} from 'vitest'
import type {DocumentWorkOrder} from '../lib/executor/contracts'
import {verifyDocumentContent} from '../lib/executor/document-verification'

describe('shared HTML and rendered-PDF factual gate',()=>{
  it('applies the same specialist verification to plain text extracted from a PDF',()=>{
    const order={deliverable_type:'fsr',quality_gates:{schema_validation:true,source_grounding:true,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true},fields:{work_order_number:'WO-4102',site_name:'Encore Boston Harbor',site_address:'1 Broadway, Everett, MA 02149',customer_contact_onsite:'Sam Barrette',visit_date:'2026-09-15',arrival_time:'12:30 PM',departure_time:'2:30 PM',technician_name:'Jon Sargent',equipment_asset_id:'LANE-03',equipment_make_model:'SKIDATA Power.Gate',issue_reported:'Barrier fault E14',warranty_status:'Out of warranty',time_on_site_hours:'2.0',follow_up_required:'parts-order',work_performed:'12:30 | Inspected controller and documented fault E14'}} as unknown as DocumentWorkOrder
    const text='WO-4102 Encore Boston Harbor 1 Broadway Everett MA 02149 Sam Barrette 2026-09-15 12:30 PM 2:30 PM Jon Sargent LANE-03 SKIDATA Power.Gate Barrier fault E14 Out of warranty 2.0 parts-order 12:30 Inspected controller and documented fault E14'
    expect(verifyDocumentContent(order,text).fieldRecord).toMatchObject({required:true,verified_rows:1})
    expect(()=>verifyDocumentContent(order,text.replace('1 Broadway Everett MA 02149','200 Broadway Chelsea MA 02150'))).toThrow(/site_address/)
  })
})
