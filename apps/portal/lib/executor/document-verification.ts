import type { DocumentWorkOrder } from './contracts'
import { verifyAgreementDocument } from './agreement-verification'
import { verifyCommercialDocument } from './commercial-verification'
import { verifyFederalDocument } from './federal-verification'
import { verifyFieldRecord } from './field-record-verification'
import { verifyFinancialDocument } from './financial-verification'

export function verifyDocumentContent(order:DocumentWorkOrder,content:string,options:{phase?:'generated'|'rendered'}={}){
  const rendererOwnsFinancialControls=order.deliverable_type==='cash-flow-budget-package'
  return {
    financial:options.phase==='generated'&&rendererOwnsFinancialControls?{required:false,checks:[],verified_values:0}:verifyFinancialDocument(order,content),
    agreement:verifyAgreementDocument(order,content),
    federal:verifyFederalDocument(order,content),
    // The controlled renderer injects field-record identity and service-fact
    // tables from the approved specification. Verify them against the exact
    // delivered PDF, after that deterministic layer has run.
    fieldRecord:options.phase==='generated'?{required:false,verified_fields:[],verified_rows:0}:verifyFieldRecord(order,content),
    commercial:options.phase==='generated'?{required:false,verified_rows:0,verified_figures:0}:verifyCommercialDocument(order,content),
  }
}
