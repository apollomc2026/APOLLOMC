import type { DocumentWorkOrder } from './contracts'

export interface FieldRecordVerificationReport {
  required:boolean
  verified_fields:string[]
  verified_rows:number
}

const FIELD_RULES:Record<string,{ anchors:string[]; rowFields:string[] }> = {
  'daily-construction-report': {
    anchors:['project_name','job_number','site_location','prepared_by','day_summary'],
    rowFields:['crew_roster','work_performed','work_status'],
  },
  'final-qc-report': {
    anchors:['project_name','job_number','project_period','inspector','completion_statement'],
    rowFields:['acceptance_criteria','test_results'],
  },
  fsr: {
    anchors:['site_name','site_address','customer_contact_onsite','visit_date','technician_name','equipment_make_model','follow_up_required'],
    rowFields:['work_performed'],
  },
}

function searchable(value:unknown, containsHtml=false) {
  let text = String(value ?? '')
  if (containsHtml) text = text.replace(/<[^>]+>/g, ' ')
  return text
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&(?:amp|nbsp|#160);/gi, ' ')
    .replace(/[^a-z0-9]+/gi, ' ')
    .trim()
    .toLowerCase()
}

/**
 * Field records are evidence instruments. Their approved identifiers and
 * pipe-delimited operational rows must survive generation before decoration.
 */
export function verifyFieldRecord(order:DocumentWorkOrder, contentHtml:string):FieldRecordVerificationReport {
  const rules = FIELD_RULES[order.deliverable_type]
  if (!rules) return { required:false, verified_fields:[], verified_rows:0 }
  const documentText = searchable(contentHtml,true)
  const missingAnchors = rules.anchors.filter(key => {
    const approved = searchable(order.fields[key])
    return !approved || !documentText.includes(approved)
  })
  if (missingAnchors.length) throw new Error(`Field record verification failed: approved ${missingAnchors.join(', ')} ${missingAnchors.length === 1 ? 'was' : 'were'} changed or omitted`)

  let verifiedRows = 0
  for (const key of rules.rowFields) {
    const raw = order.fields[key]
    if (typeof raw !== 'string' || !raw.trim()) throw new Error(`Field record verification failed: approved ${key} was empty`)
    for (const [index,line] of raw.split(/\r?\n/).map(value=>value.trim()).filter(Boolean).entries()) {
      const approvedRow = searchable(line.replace(/\|/g,' '))
      if (!approvedRow || !documentText.includes(approvedRow)) throw new Error(`Field record verification failed: ${key} row ${index + 1} was changed or omitted`)
      verifiedRows += 1
    }
  }
  return { required:true, verified_fields:[...rules.anchors,...rules.rowFields], verified_rows:verifiedRows }
}
