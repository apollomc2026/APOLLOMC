import type { ArtifactManifest, DocumentWorkOrder } from '@/lib/executor/contracts'
import type { DeliverableSpecification } from './contracts'

export const PILOT_DELIVERABLES=['fsr','final-qc-report','quote','proposal','cash-flow-budget-package','contract-intelligence-review'] as const
export type PilotDeliverable=(typeof PILOT_DELIVERABLES)[number]

type ConversationRow={id:string;status:string;readiness:number;current_spec_version:number;updated_at:string}
type SpecificationRow={id:string;conversation_id:string;version:number;status:string;content_hash:string;specification:DeliverableSpecification}
type EvidenceRow={id:string;conversation_id:string;extraction_status:string;content_sha256:string|null;retrieval_sha256:string|null}
type JobRow={id:string;conversation_id:string;deliverable_type:string;state:string;progress_percent:number;work_order:DocumentWorkOrder;artifacts:ArtifactManifest[];error_code:string|null;created_at:string;completed_at:string|null}
type EventRow={job_id:string;sequence:number;state:string;payload:Record<string,unknown>}

export interface PilotAuditInput { conversations:ConversationRow[]; specifications:SpecificationRow[]; evidence:EvidenceRow[]; jobs:JobRow[]; events:EventRow[] }
export interface PilotGate { key:string; label:string; passed:boolean; evidence:string }
export interface PilotClassAudit { deliverable_type:PilotDeliverable; conversation_id:string|null; passed:boolean; gates:PilotGate[] }

const UNSAFE_INFERRED_KEYS=new Set(['customer_name','client_name','prospect_organization','line_items','pricing_detail','contract_value','commercial_value','test_results','base_case_lines','scenario_summary','contracting_parties','effective_date','expiration_date','governing_law'])
const REQUIRED_EVENT_SEQUENCE=['accepted','queued','gathering-input','generating','validating','rendering','reviewing','delivered']

function asRecord(value:unknown):Record<string,unknown>{return value&&typeof value==='object'&&!Array.isArray(value)?value as Record<string,unknown>: {}}
function artifactIsControlled(artifact:ArtifactManifest){return artifact.mime_type==='application/pdf'&&/^[a-f0-9]{64}$/.test(artifact.content_sha256)&&artifact.source_engine_id==='apollo-documents'&&artifact.lifecycle==='draft'&&Boolean(artifact.storage_file_id)}
function sequencePresent(events:EventRow[]){let cursor=-1;return REQUIRED_EVENT_SEQUENCE.every(state=>{const index=events.findIndex((event,position)=>position>cursor&&event.state===state);if(index<0)return false;cursor=index;return true})}

export function auditPilotRelease(input:PilotAuditInput):{passed:boolean;passed_classes:number;total_classes:number;classes:PilotClassAudit[]} {
  const specsByConversation=new Map(input.specifications.map(row=>[`${row.conversation_id}:${row.version}`,row]))
  const classes=PILOT_DELIVERABLES.map(deliverableType=>{
    const candidates=input.conversations.map(conversation=>({conversation,specification:specsByConversation.get(`${conversation.id}:${conversation.current_spec_version}`)}))
      .filter((candidate):candidate is {conversation:ConversationRow;specification:SpecificationRow}=>candidate.specification?.specification.artifact.recommended_type===deliverableType)
      .sort((a,b)=>Date.parse(b.conversation.updated_at)-Date.parse(a.conversation.updated_at))
    const selected=candidates.find(candidate=>input.jobs.some(job=>job.conversation_id===candidate.conversation.id&&job.state==='delivered'))??candidates[0]
    if(!selected)return {deliverable_type:deliverableType,conversation_id:null,passed:false,gates:[{key:'mission',label:'Representative mission exists',passed:false,evidence:'No current specification exists for this pilot class.'}]}
    const {conversation,specification:specRow}=selected;const spec=specRow.specification
    const evidence=input.evidence.filter(row=>row.conversation_id===conversation.id)
    const jobs=input.jobs.filter(row=>row.conversation_id===conversation.id).sort((a,b)=>Date.parse(a.created_at)-Date.parse(b.created_at))
    const delivered=jobs.filter(job=>job.state==='delivered');const latest=delivered.at(-1)
    const events=latest?input.events.filter(event=>event.job_id===latest.id).sort((a,b)=>a.sequence-b.sequence):[]
    const validation=events.find(event=>event.state==='validating');const payload=asRecord(validation?.payload);const workmanship=asRecord(payload.workmanship)
    const unsafeInferences=spec.content.facts.filter(fact=>fact.source==='inferred'&&UNSAFE_INFERRED_KEYS.has(fact.key))
    const unresolvedConflicts=spec.content.facts.filter(fact=>fact.verification_state==='conflict'&&!fact.supersession)
    const latestOrder=latest?.work_order;const artifacts=latest?.artifacts??[]
    const revision=delivered.find(job=>Boolean(job.work_order.fields.revision_of)&&job.work_order.fields.revision_of!==job.id)
    const recovered=jobs.some((job,index)=>['failed','blocked'].includes(job.state)&&jobs.slice(index+1).some(candidate=>candidate.state==='delivered'))
    const gates:PilotGate[]=[
      {key:'evidence',label:'Evidence inventory and custody',passed:evidence.length>0&&evidence.every(row=>['verified','conflict'].includes(row.extraction_status)&&/^[a-f0-9]{64}$/.test(row.content_sha256??'')&&/^[a-f0-9]{64}$/.test(row.retrieval_sha256??'')),evidence:`${evidence.length} source(s); ${evidence.filter(row=>row.extraction_status==='failed').length} failed.`},
      {key:'calibration',label:'Minimal-friction calibrated specification',passed:spec.content.open_questions.length===0&&unresolvedConflicts.length===0&&unsafeInferences.length===0,evidence:`${spec.content.open_questions.length} open; ${unresolvedConflicts.length} unresolved conflicts; ${unsafeInferences.length} unsafe inferences.`},
      {key:'authority',label:'Approved specification is authoritative',passed:Boolean(latestOrder)&&specRow.status==='approved'&&spec.approval.status==='approved'&&latestOrder?.deliverable_type===deliverableType&&latestOrder.trace?.specification_id===specRow.id&&latestOrder.trace?.specification_hash===specRow.content_hash,evidence:`Spec v${specRow.version}; job=${latest?.id??'none'}.`},
      {key:'launch',label:'Durable launch and telemetry completion',passed:Boolean(latest)&&latest?.state==='delivered'&&latest.progress_percent===100&&sequencePresent(events),evidence:`${latest?.state??'not launched'} at ${latest?.progress_percent??0}%; ${events.length} lifecycle event(s).`},
      {key:'verification',label:'Deterministic verification and workmanship',passed:Boolean(validation)&&workmanship.passed===true&&Number(workmanship.score)>=80,evidence:`Workmanship ${String(workmanship.score??'missing')}/100; validation=${validation?'recorded':'missing'}.`},
      {key:'artifact',label:'Controlled branded PDF artifact',passed:artifacts.length>0&&artifacts.every(artifactIsControlled)&&Boolean(latestOrder?.brand_id)&&Boolean(latestOrder?.style_id),evidence:`${artifacts.length} artifact(s); brand=${latestOrder?.brand_id??'missing'}; style=${latestOrder?.style_id??'missing'}.`},
      {key:'recovery',label:'Failure recovery proven',passed:recovered,evidence:recovered?'A failed/blocked attempt was followed by successful delivery.':'No controlled failure-to-success recovery is recorded.'},
      {key:'regeneration',label:'Regeneration lineage proven',passed:Boolean(revision)&&delivered.length>=2&&Number(revision?.artifacts?.[0]?.version??0)>=2,evidence:`${delivered.length} delivered deployment(s); revision=${revision?.id??'missing'}.`},
    ]
    return {deliverable_type:deliverableType,conversation_id:conversation.id,passed:gates.every(gate=>gate.passed),gates}
  })
  return {passed:classes.every(item=>item.passed),passed_classes:classes.filter(item=>item.passed).length,total_classes:classes.length,classes}
}
