import type { DocumentWorkOrder } from './contracts'

export interface FederalVerificationReport {
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
 * Federal response identity is controlled data, not creative copy. Stop the
 * workflow before rendering when generation changes or drops an approved
 * solicitation or offeror anchor.
 */
export function verifyFederalDocument(order:DocumentWorkOrder, contentHtml:string):FederalVerificationReport {
  if (order.deliverable_type !== 'federal-proposal') return { required:false, verified_fields:[] }
  const documentText = searchable(contentHtml)
  const criticalFields = ['solicitation_number','solicitation_title','issuing_agency','offeror_name','naics_code','set_aside']
  const missing = criticalFields.filter(key => {
    const approved = searchable(order.fields[key])
    return !approved || !documentText.includes(approved)
  })
  if (missing.length) throw new Error(`Federal response verification failed: approved ${missing.join(', ')} ${missing.length === 1 ? 'was' : 'were'} changed or omitted`)
  return { required:true, verified_fields:criticalFields }
}
