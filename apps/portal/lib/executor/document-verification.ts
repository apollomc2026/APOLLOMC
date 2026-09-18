import type { DocumentWorkOrder } from './contracts'
import { verifyAgreementDocument } from './agreement-verification'
import { verifyCommercialDocument } from './commercial-verification'
import { verifyFederalDocument } from './federal-verification'
import { verifyFieldRecord } from './field-record-verification'
import { verifyFinancialDocument } from './financial-verification'

export function verifyDocumentContent(order:DocumentWorkOrder,content:string,options:{phase?:'generated'|'rendered'}={}){
  return {
    financial:verifyFinancialDocument(order,content),
    agreement:verifyAgreementDocument(order,content),
    federal:verifyFederalDocument(order,content),
    // The controlled renderer injects field-record identity and service-fact
    // tables from the approved specification. Verify them against the exact
    // delivered PDF, after that deterministic layer has run.
    fieldRecord:options.phase==='generated'?{required:false,verified_fields:[],verified_rows:0}:verifyFieldRecord(order,content),
    commercial:verifyCommercialDocument(order,content),
  }
}
