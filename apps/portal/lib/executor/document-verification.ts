import type { DocumentWorkOrder } from './contracts'
import { verifyAgreementDocument } from './agreement-verification'
import { verifyCommercialDocument } from './commercial-verification'
import { verifyFederalDocument } from './federal-verification'
import { verifyFieldRecord } from './field-record-verification'
import { verifyFinancialDocument } from './financial-verification'

export function verifyDocumentContent(order:DocumentWorkOrder,content:string){
  return {
    financial:verifyFinancialDocument(order,content),
    agreement:verifyAgreementDocument(order,content),
    federal:verifyFederalDocument(order,content),
    fieldRecord:verifyFieldRecord(order,content),
    commercial:verifyCommercialDocument(order,content),
  }
}
