import type { DocumentWorkOrder } from './contracts'

export interface AgreementVerificationReport {
  required:boolean
  verified_fields:string[]
}

function searchable(value:unknown) {
  return String(value ?? '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Legal anchors are not matters of writing style. A contract package must
 * retain these operator-approved values verbatim enough to be independently
 * found after generation; otherwise publication stops before rendering.
 */
export function verifyAgreementDocument(order:DocumentWorkOrder, contentHtml:string):AgreementVerificationReport {
  if (order.deliverable_type !== 'contract-package') return { required:false, verified_fields:[] }
  const documentText = searchable(contentHtml)
  const criticalFields = ['party_a_name','party_b_name','governing_law','term_length']
  const missing = criticalFields.filter(key => {
    const approved = searchable(order.fields[key])
    return !approved || !documentText.includes(approved)
  })
  if (missing.length) throw new Error(`Agreement factual verification failed: approved ${missing.join(', ')} ${missing.length === 1 ? 'was' : 'were'} changed or omitted`)
  return { required:true, verified_fields:criticalFields }
}
