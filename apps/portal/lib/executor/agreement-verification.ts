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
  if (order.deliverable_type === 'contract-intelligence-review') {
    const documentText = searchable(contentHtml)
    const candidateFields = ['contract_title','contracting_parties','effective_date','expiration_date','current_status','governing_law']
    const approvedFields = candidateFields.filter(key => searchable(order.fields[key]))
    const missingFields = approvedFields.filter(key => !documentText.includes(searchable(order.fields[key])))
    const missingSources = order.sources.filter(source => {
      const basename = source.name.replace(/\.[^.]+$/, '')
      return !searchable(basename) || !documentText.includes(searchable(basename))
    })
    if (missingFields.length) throw new Error(`Agreement factual verification failed: approved ${missingFields.join(', ')} ${missingFields.length === 1 ? 'was' : 'were'} changed or omitted`)
    if (missingSources.length) throw new Error(`Agreement source verification failed: ${missingSources.map(source => source.name).join(', ')} ${missingSources.length === 1 ? 'was' : 'were'} omitted from the contract review`)
    if (!approvedFields.length && !order.sources.length) throw new Error('Agreement verification failed: contract review has no approved contract facts or source documents')
    return { required:true, verified_fields:[...approvedFields,...order.sources.map(source => `source:${source.name}`)] }
  }
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
