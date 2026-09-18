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
    anchors:['project_name','job_number','project_period','report_date','inspector','completion_statement'],
    rowFields:['reference_documents','acceptance_criteria','test_results'],
  },
  fsr: {
    anchors:['work_order_number','site_name','site_address','customer_contact_onsite','visit_date','arrival_time','departure_time','technician_name','equipment_asset_id','equipment_make_model','issue_reported','warranty_status','time_on_site_hours','follow_up_required'],
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

function dateVariants(value:unknown):string[]{
  const raw=String(value??'').trim();const match=raw.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if(!match)return[]
  const date=new Date(`${raw}T12:00:00Z`)
  if(Number.isNaN(date.getTime()))return[]
  return [raw,date.toLocaleDateString('en-US',{timeZone:'UTC',month:'long',day:'numeric',year:'numeric'}),date.toLocaleDateString('en-US',{timeZone:'UTC',month:'short',day:'numeric',year:'numeric'})].map(item=>searchable(item))
}

function timeVariants(value:unknown):string[]{
  const raw=String(value??'').trim();const match=raw.match(/^(\d{1,2}):(\d{2})(?:\s*([ap])\.?m\.?)?$/i)
  if(!match)return[]
  let hour=Number(match[1]);const minute=match[2];const meridiem=match[3]?.toLowerCase()
  if(meridiem){hour%=12;if(meridiem==='p')hour+=12}
  if(hour>23)return[]
  const displayHour=hour%12||12;const suffix=hour>=12?'PM':'AM'
  return [raw,`${String(hour).padStart(2,'0')}:${minute}`,`${displayHour}:${minute} ${suffix}`].map(item=>searchable(item))
}

const US_STATE_NAMES:Record<string,string>={
  al:'alabama',ak:'alaska',az:'arizona',ar:'arkansas',ca:'california',co:'colorado',ct:'connecticut',de:'delaware',fl:'florida',ga:'georgia',hi:'hawaii',id:'idaho',il:'illinois',in:'indiana',ia:'iowa',ks:'kansas',ky:'kentucky',la:'louisiana',me:'maine',md:'maryland',ma:'massachusetts',mi:'michigan',mn:'minnesota',ms:'mississippi',mo:'missouri',mt:'montana',ne:'nebraska',nv:'nevada',nh:'new hampshire',nj:'new jersey',nm:'new mexico',ny:'new york',nc:'north carolina',nd:'north dakota',oh:'ohio',ok:'oklahoma',or:'oregon',pa:'pennsylvania',ri:'rhode island',sc:'south carolina',sd:'south dakota',tn:'tennessee',tx:'texas',ut:'utah',vt:'vermont',va:'virginia',wa:'washington',wv:'west virginia',wi:'wisconsin',wy:'wyoming',dc:'district of columbia',
}

function addressVariants(value:unknown):string[]{
  const raw=String(value??'').trim()
  if(!raw)return[]
  const normalized=searchable(raw)
  const expanded=normalized.split(' ').map(token=>US_STATE_NAMES[token]??token).join(' ')
  return [...new Set([normalized,expanded])]
}

function anchorPresent(key:string,value:unknown,documentText:string){
  const exact=searchable(value)
  if(exact&&documentText.includes(exact))return true
  const variants=/(?:^|_)date$/.test(key)?dateVariants(value):/(?:arrival|departure)_time$/.test(key)?timeVariants(value):/(?:^|_)address$/.test(key)?addressVariants(value):[]
  return variants.some(variant=>variant&&documentText.includes(variant))
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
    return !anchorPresent(key,order.fields[key],documentText)
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
