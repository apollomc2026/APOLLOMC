import type { DeliverableSpecification } from './contracts'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'

const DELIVERABLE_LABELS:Record<string,string>={
  fsr:'Field Service Report',
  quote:'Quote / Estimate',
  proposal:'Proposal',
  'final-qc-report':'Final QC Report',
  'cash-flow-budget-package':'Financial Packet',
  'contract-intelligence-review':'Contract Intelligence Review',
}

const SUBJECT_KEYS=['site_name','project_name','customer_name','client_name','prospect_organization','organization','case_name','contract_name']
const DATE_KEYS=['service_date','visit_date','report_date','quote_date','proposal_date','date','as_of_date']

function usableFact(specification:DeliverableSpecification,keys:string[]){
  for(const key of keys){
    const fact=specification.content.facts.find(item=>item.key===key&&item.verification_state!=='conflict'&&item.value.trim())
    if(fact)return fact.value.trim().replace(/\s+/g,' ')
  }
  return null
}

function titleCaseSlug(value:string){
  return value.split('-').map(word=>word?word[0].toUpperCase()+word.slice(1):word).join(' ')
}

export function missionDisplayIdentity(specification:DeliverableSpecification){
  const deliverableType=specification.artifact.recommended_type
  const deliverableLabel=DELIVERABLE_LABELS[deliverableType]??titleCaseSlug(deliverableType)
  const subject=usableFact(specification,SUBJECT_KEYS)
  const date=usableFact(specification,DATE_KEYS)
  const genericTitle=/^(?:untitled mission|field service|field service report|quote|proposal|final qc report|financial packet|contract intelligence review)$/i.test(specification.mission.title.trim())
  const authoredTitle=!genericTitle?specification.mission.title.trim():null
  const base=subject??authoredTitle??deliverableLabel
  const displayTitle=subject&&!subject.toLowerCase().includes(deliverableLabel.toLowerCase())?`${subject} · ${deliverableLabel}`:base
  return { displayTitle,subject,deliverableLabel,date,context:[subject,date].filter(Boolean).join(' · ') }
}

export function flightDisplayIdentity(input:{specification:DeliverableSpecification;workOrder:Pick<DocumentWorkOrder,'fields'>|null;sequence:number}){
  const mission=missionDisplayIdentity(input.specification)
  const fields=input.workOrder?.fields??{}
  const revision=typeof fields.revision_instruction==='string'?fields.revision_instruction.trim():''
  const isReflight=Boolean(fields.revision_of)
  const number=Number(fields.artifact_version)
  const flightNumber=Number.isSafeInteger(number)&&number>0?number:input.sequence
  const flightLabel=isReflight?`Reflight ${String(Math.max(1,flightNumber-1)).padStart(2,'0')}`:`Launch ${String(Math.max(1,flightNumber)).padStart(2,'0')}`
  const generic=/^Regenerate this deliverable using the current approved evidence/i.test(revision)
  const purpose=!revision?'Approved specification':generic?'Clean regeneration':revision.length>96?`${revision.slice(0,93).trimEnd()}…`:revision
  return { flightLabel,flightName:`${mission.displayTitle} · ${flightLabel}`,purpose }
}
