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

  it('defers renderer-owned field-record anchors until the delivered artifact',()=>{
    const order={deliverable_type:'fsr',quality_gates:{schema_validation:true,source_grounding:true,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true},fields:{work_order_number:'WO-1',site_name:'Northstar',site_address:'100 Industrial Way',customer_contact_onsite:'Avery Morgan',visit_date:'2026-09-17',arrival_time:'07:00',departure_time:'16:30',technician_name:'Morgan Reed',equipment_asset_id:'ASSET-1',equipment_make_model:'Model X',issue_reported:'Alarm',warranty_status:'not applicable',time_on_site_hours:'9.5',follow_up_required:'none',work_performed:'07:00 | Inspected equipment'}} as unknown as DocumentWorkOrder
    expect(verifyDocumentContent(order,'<p>07:00 Inspected equipment</p>',{phase:'generated'}).fieldRecord.required).toBe(false)
    expect(()=>verifyDocumentContent(order,'<p>07:00 Inspected equipment</p>',{phase:'rendered'})).toThrow(/work_order_number/)
  })
  it('defers renderer-owned commercial schedules until the delivered artifact',()=>{
    const order={deliverable_type:'quote',quality_gates:{schema_validation:true,source_grounding:true,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true},fields:{customer_name:'Northstar',customer_address:'100 Industrial Way',quote_date:'2026-09-17',valid_until:'2026-10-17',scope_summary:'Site assessment',payment_terms:'Net 30',line_items:'Assessment | 1 | visit | $100.00 | $100.00'}} as unknown as DocumentWorkOrder
    expect(verifyDocumentContent(order,'<p>Draft narrative</p>',{phase:'generated'}).commercial.required).toBe(false)
    expect(()=>verifyDocumentContent(order,'<p>Draft narrative</p>',{phase:'rendered'})).toThrow(/customer_name/)
  })
  it('defers renderer-owned cash-flow schedules until the delivered artifact',()=>{
    const order={deliverable_type:'cash-flow-budget-package',quality_gates:{schema_validation:true,source_grounding:true,independent_review:false,deterministic_financial_verification:true,human_approval_before_publish:true},fields:{entity_name:'Northstar',forecast_period:'October 2026',base_case_lines:'Oct 2026 | 250000 | 185000 | 172000 | 13000 | 263000',scenario_summary:'Base | 263000 | 250000 | 185000 | 172000',key_assumptions:'Opening cash is $250,000'}} as unknown as DocumentWorkOrder
    expect(verifyDocumentContent(order,'<p>Draft narrative</p>',{phase:'generated'}).financial.required).toBe(false)
    expect(()=>verifyDocumentContent(order,'<p>Draft narrative</p>',{phase:'rendered'})).toThrow(/base_case_lines row 1/)
  })
})
