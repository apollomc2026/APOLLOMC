import type { ArtifactManifest, DocumentWorkOrder } from '@/lib/executor/contracts'
import { missionFactSourceReferences, type DeliverableSpecification, type MissionFact } from './contracts'

export const PILOT_DELIVERABLES=['fsr','final-qc-report','quote','proposal','cash-flow-budget-package','contract-intelligence-review'] as const
export type PilotDeliverable=(typeof PILOT_DELIVERABLES)[number]

type ConversationRow={id:string;status:string;readiness:number;current_spec_version:number;updated_at:string}
type SpecificationRow={id:string;conversation_id:string;version:number;status:string;content_hash:string;specification:DeliverableSpecification}
type EvidenceRow={id:string;conversation_id:string;extraction_status:string;content_sha256:string|null;retrieval_sha256:string|null;extracted_facts:MissionFact[]}
type JobRow={id:string;conversation_id:string;deliverable_type:string;state:string;progress_percent:number;work_order:DocumentWorkOrder;artifacts:ArtifactManifest[];error_code:string|null;completion_email_status:string;failure_email_status:string;created_at:string;completed_at:string|null}
type EventRow={job_id:string;sequence:number;state:string;payload:Record<string,unknown>}

export interface PilotAuditInput { conversations:ConversationRow[]; specifications:SpecificationRow[]; evidence:EvidenceRow[]; jobs:JobRow[]; events:EventRow[] }
export interface PilotGate { key:string; label:string; passed:boolean; evidence:string }
export interface PilotClassAudit { deliverable_type:PilotDeliverable; conversation_id:string|null; passed:boolean; gates:PilotGate[] }

const UNSAFE_INFERRED_KEYS=new Set(['customer_name','client_name','prospect_organization','line_items','pricing_detail','contract_value','commercial_value','test_results','base_case_lines','scenario_summary','contracting_parties','effective_date','expiration_date','governing_law'])
const REQUIRED_EVENT_SEQUENCE=['accepted','queued','gathering-input','generating','validating','rendering','reviewing','delivered']

function asRecord(value:unknown):Record<string,unknown>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>: {}}
function artifactIsControlled(artifact:ArtifactManifest){return artifact.mime_type==='application/pdf'&&/^[a-f0-9]{64}$/.test(artifact.content_sha256)&&artifact.source_engine_id==='apollo-documents'&&artifact.lifecycle==='draft'&&Boolean(artifact.storage_file_id)&&Number(artifact.integrity?.bytes)>=1024&&Number(artifact.integrity?.pages)>=1&&Number(artifact.integrity?.text_characters)>=40&&Boolean(artifact.integrity?.verified_at)}
function governedSourceIdentity(order:DocumentWorkOrder){return order.sources.map(source=>`${source.source_id}:${source.media_type}:${source.content_sha256.toLowerCase()}`).sort()}
function revisionPreservesAuthority(prior:DocumentWorkOrder,revision:DocumentWorkOrder){
  return revision.deliverable_type===prior.deliverable_type
    &&revision.project_id===prior.project_id
    &&revision.conversation_id===prior.conversation_id
    &&revision.requested_by===prior.requested_by
    &&revision.brand_id===prior.brand_id
    &&revision.style_id===prior.style_id
    &&revision.objective===prior.objective
    &&revision.audience===prior.audience
    &&revision.trace?.specification_id===prior.trace?.specification_id
    &&revision.trace?.specification_hash===prior.trace?.specification_hash
    &&JSON.stringify(governedSourceIdentity(revision))===JSON.stringify(governedSourceIdentity(prior))
}
function sequencePresent(events:EventRow[]){let cursor=-1;return REQUIRED_EVENT_SEQUENCE.every(state=>{const index=events.findIndex((event,position)=>position>cursor&&event.state===state);if(index<0)return false;cursor=index;return true})}
function specialistVerification(deliverableType:PilotDeliverable,payload:Record<string,unknown>):{passed:boolean;evidence:string}{
  const key=deliverableType==='fsr'||deliverableType==='final-qc-report'?'field_record_verification':deliverableType==='quote'||deliverableType==='proposal'?'commercial_verification':deliverableType==='cash-flow-budget-package'?'financial_verification':'agreement_verification'
  const report=asRecord(payload[key])
  return {passed:report.required===true,evidence:`${key}=${report.required===true?'passed':'missing'}`}
}

export function auditPilotRelease(input:PilotAuditInput):{passed:boolean;passed_classes:number;total_classes:number;classes:PilotClassAudit[]} {
  const specsByConversation=new Map(input.specifications.map(row=>[`${row.conversation_id}:${row.version}`,row]))
  const classes=PILOT_DELIVERABLES.map(deliverableType=>{
    const candidates=input.conversations.map(conversation=>({conversation,specification:specsByConversation.get(`${conversation.id}:${conversation.current_spec_version}`)}))
      .filter((candidate):candidate is {conversation:ConversationRow;specification:SpecificationRow}=>candidate.specification?.specification.artifact.recommended_type===deliverableType)
      .sort((a,b)=>Date.parse(b.conversation.updated_at)-Date.parse(a.conversation.updated_at))
    // The newest representative mission is authoritative. Falling back to an
    // older delivered mission would conceal a regression in the current run.
    const selected=candidates[0]
    if(!selected)return {deliverable_type:deliverableType,conversation_id:null,passed:false,gates:[{key:'mission',label:'Representative mission exists',passed:false,evidence:'No current specification exists for this pilot class.'}]}
    const {conversation,specification:specRow}=selected;const spec=specRow.specification
    const evidence=input.evidence.filter(row=>row.conversation_id===conversation.id)
    const jobs=input.jobs.filter(row=>row.conversation_id===conversation.id).sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at))
    const delivered=jobs.filter(job=>job.state==='delivered');const latest=delivered.at(-1);const current=jobs.at(-1)
    const events=latest?input.events.filter(event=>event.job_id===latest.id).sort((a,b)=>a.sequence-b.sequence):[]
    const validation=events.find(event=>event.state==='validating');const payload=asRecord(validation?.payload);const workmanship=asRecord(payload.workmanship)
    const specialist=specialistVerification(deliverableType,payload)
    const pricingResearch=spec.content.facts.find(fact=>fact.key==='market_pricing_basis'&&fact.source==='research'&&fact.capture_method==='system_lookup'&&fact.verification_state==='verified')
    const pricingSources=pricingResearch?[...new Set([pricingResearch.source_reference,...(pricingResearch.source_references??[])].filter((value):value is string=>Boolean(value)))]:[]
    const evidenceIds=new Set(evidence.map(row=>row.id))
    const inventoryIds=new Set(spec.sources.map(source=>source.id))
    const specificationEvidenceReferences=new Set(spec.content.facts.flatMap(missionFactSourceReferences).filter(reference=>evidenceIds.has(reference)))
    const malformedExtractedFacts=evidence.flatMap(row=>row.extracted_facts??[]).filter(fact=>fact.source!=='evidence'||!fact.source_reference||!evidenceIds.has(fact.source_reference))
    const extractedKeysBySource=new Map<string,Set<string>>()
    for(const row of evidence)for(const fact of row.extracted_facts??[]){const keys=extractedKeysBySource.get(row.id)??new Set<string>();keys.add(fact.key);extractedKeysBySource.set(row.id,keys)}
    const missingReconciledFacts=evidence.flatMap(row=>[...(extractedKeysBySource.get(row.id)??[])].filter(key=>!spec.content.facts.some(fact=>fact.key===key&&missionFactSourceReferences(fact).includes(row.id))).map(key=>`${row.id}:${key}`))
    const unsafeInferences=spec.content.facts.filter(fact=>fact.source==='inferred'&&UNSAFE_INFERRED_KEYS.has(fact.key))
    const unresolvedConflicts=spec.content.facts.filter(fact=>fact.verification_state==='conflict'&&!fact.supersession)
    const latestOrder=latest?.work_order;const artifacts=latest?.artifacts??[]
    const revision=delivered.find(job=>Boolean(job.work_order.fields.revision_of)&&job.work_order.fields.revision_of!==job.id)
    const revisionParent=revision?jobs.find(job=>job.id===revision.work_order.fields.revision_of):undefined
    const revisionAuthority=Boolean(revision&&revisionParent&&revisionPreservesAuthority(revisionParent.work_order,revision.work_order))
    const failedAttempts=jobs.map((job,index)=>({job,index})).filter(({job})=>['failed','blocked'].includes(job.state))
    const recovered=failedAttempts.length>0&&failedAttempts.every(({index})=>jobs.slice(index+1).some(candidate=>candidate.state==='delivered'))
    const currentDelivered=current?.state==='delivered'
    const completionNotificationSent=currentDelivered&&current?.completion_email_status==='sent'
    const failedNotificationsSent=failedAttempts.length>0&&failedAttempts.every(({job})=>job.failure_email_status==='sent')
    const gates:PilotGate[]=[
      {key:'evidence',label:'Evidence inventory and custody',passed:evidence.length>0&&evidence.every(row=>['verified','conflict'].includes(row.extraction_status)&&/^[a-f0-9]{64}$/.test(row.content_sha256??'')&&/^[a-f0-9]{64}$/.test(row.retrieval_sha256??'')),evidence:`${evidence.length} source(s); ${evidence.filter(row=>row.extraction_status==='failed').length} failed.`},
      {key:'provenance',label:'Complete evidence provenance',passed:evidence.length===inventoryIds.size&&evidence.every(row=>inventoryIds.has(row.id))&&malformedExtractedFacts.length===0&&missingReconciledFacts.length===0&&evidence.filter(row=>(row.extracted_facts??[]).length>0).every(row=>specificationEvidenceReferences.has(row.id)),evidence:`${inventoryIds.size}/${evidence.length} inventoried; ${malformedExtractedFacts.length} malformed extracted fact(s); ${missingReconciledFacts.length} fact(s) lost during reconciliation.`},
      {key:'calibration',label:'Minimal-friction calibrated specification',passed:spec.content.open_questions.length===0&&unresolvedConflicts.length===0&&unsafeInferences.length===0,evidence:`${spec.content.open_questions.length} open; ${unresolvedConflicts.length} unresolved conflicts; ${unsafeInferences.length} unsafe inferences.`},
      {key:'authority',label:'Approved specification is authoritative',passed:Boolean(latestOrder)&&specRow.status==='approved'&&spec.approval.status==='approved'&&latestOrder?.deliverable_type===deliverableType&&latestOrder.trace?.specification_id===specRow.id&&latestOrder.trace?.specification_hash===specRow.content_hash,evidence:`Spec v${specRow.version}; job=${latest?.id??'none'}.`},
      {key:'launch',label:'Durable launch and telemetry completion',passed:Boolean(latest)&&currentDelivered&&latest?.id===current?.id&&latest.progress_percent===100&&sequencePresent(events),evidence:`Current=${current?.state??'not launched'}; latest delivered=${latest?.id??'none'} at ${latest?.progress_percent??0}%; ${events.length} lifecycle event(s).`},
      {key:'verification',label:'Deterministic verification and workmanship',passed:Boolean(validation)&&specialist.passed&&workmanship.passed===true&&Number(workmanship.score)>=80,evidence:`Workmanship ${String(workmanship.score??'missing')}/100; ${specialist.evidence}; validation=${validation?'recorded':'missing'}.`},
      {key:'market-pricing',label:'Cited market-informed pricing',passed:deliverableType!=='quote'||Boolean(pricingResearch)&&pricingSources.length>0&&pricingSources.every(source=>/^https:\/\//i.test(source)),evidence:deliverableType!=='quote'?'Not applicable to this pilot class.':`${pricingResearch?'Verified benchmark record':'Missing benchmark record'}; ${pricingSources.length} cited source(s).`},
      {key:'artifact',label:'Controlled branded PDF artifact',passed:artifacts.length>0&&artifacts.every(artifactIsControlled)&&Boolean(latestOrder?.brand_id)&&Boolean(latestOrder?.style_id),evidence:`${artifacts.length} artifact(s); brand=${latestOrder?.brand_id??'missing'}; style=${latestOrder?.style_id??'missing'}; parsed PDF integrity=${artifacts.every(artifact=>Boolean(artifact.integrity))?'recorded':'missing'}.`},
      {key:'notifications',label:'Terminal notifications delivered',passed:completionNotificationSent&&failedNotificationsSent,evidence:`Completion email=${current?.completion_email_status??'missing'}; ${failedAttempts.length} failure alert(s), ${failedAttempts.filter(({job})=>job.failure_email_status==='sent').length} sent.`},
      {key:'recovery',label:'Failure recovery proven',passed:recovered,evidence:recovered?`${failedAttempts.length} failed/blocked attempt(s) were followed by successful delivery.`:failedAttempts.length?'A failed/blocked attempt remains unrecovered.':'No controlled failure-to-success recovery is recorded.'},
      {key:'regeneration',label:'Regeneration lineage proven',passed:Boolean(revision)&&delivered.length>=2&&Number(revision?.artifacts?.[0]?.version??0)>=2&&revisionAuthority,evidence:`${delivered.length} delivered deployment(s); revision=${revision?.id??'missing'}; approved authority=${revisionAuthority?'preserved':'unproven'}.`},
    ]
    return {deliverable_type:deliverableType,conversation_id:conversation.id,passed:gates.every(gate=>gate.passed),gates}
  })
  return {passed:classes.every(item=>item.passed),passed_classes:classes.filter(item=>item.passed).length,total_classes:classes.length,classes}
}
