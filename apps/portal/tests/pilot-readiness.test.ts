import { describe,expect,it } from 'vitest'
import { auditPilotRelease,PILOT_DELIVERABLES } from '../lib/mission-control/pilot-readiness'
import { interpretMission } from '../lib/mission-control/interpreter'

function fixture(slug:(typeof PILOT_DELIVERABLES)[number]){
  const spec=interpretMission(`Create a ${slug}.`).specification;spec.artifact.recommended_type=slug;spec.approval={status:'approved',approved_by:'user',approved_at:'2026-09-16T12:00:00Z',unresolved_items_accepted:[]};spec.content.open_questions=[]
  const conversationId=`mission-${slug}`;const specId=`spec-${slug}`;const failedId=`10000000-0000-5000-a000-${String(PILOT_DELIVERABLES.indexOf(slug)+1).padStart(12,'0')}`;const firstId=`20000000-0000-5000-a000-${String(PILOT_DELIVERABLES.indexOf(slug)+1).padStart(12,'0')}`;const secondId=`30000000-0000-5000-a000-${String(PILOT_DELIVERABLES.indexOf(slug)+1).padStart(12,'0')}`
  const artifact=(id:string,version:number)=>({artifact_id:`artifact-${id}`,project_id:specId,conversation_id:conversationId,task_id:id,title:slug,artifact_type:'document' as const,lifecycle:'draft' as const,storage_provider:'google-drive' as const,storage_file_id:`file-${id}`,storage_parent_id:'folder',version,content_sha256:'b'.repeat(64),mime_type:'application/pdf',source_engine_id:'apollo-documents',source_run_id:id,created_at:'2026-09-16T12:10:00Z'})
  const order=(id:string,revisionOf?:string)=>({protocol_version:'1.0' as const,work_order_id:id,idempotency_key:`spec-${'a'.repeat(64)}`,project_id:specId,conversation_id:conversationId,task_id:id,requested_by:'user',capability:'professional-document-generation',deliverable_type:slug,objective:'Pilot',audience:'Operator',formats:['pdf' as const],fields:revisionOf?{revision_of:revisionOf,artifact_version:2}:{},sources:[],brand_id:'kit:on-spot',style_id:'industrial',sensitivity:'internal' as const,priority:'medium' as const,drive_destination:{folder_id:'folder',lifecycle:'draft' as const},quality_gates:{schema_validation:true as const,source_grounding:true as const,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true as const},trace:{specification_id:specId,specification_hash:'a'.repeat(64),specification_schema_version:'1.0',playbook_id:'pilot',playbook_version:'1',model_versions:[],required_checks:[],accepted_unresolved_items:[]},created_at:'2026-09-16T12:00:00Z'})
  const jobs=[{id:failedId,conversation_id:conversationId,deliverable_type:slug,state:'failed',progress_percent:25,work_order:order(failedId),artifacts:[],error_code:'TEST_FAILURE',created_at:'2026-09-16T12:00:00Z',completed_at:'2026-09-16T12:01:00Z'},{id:firstId,conversation_id:conversationId,deliverable_type:slug,state:'delivered',progress_percent:100,work_order:order(firstId),artifacts:[artifact(firstId,1)],error_code:null,created_at:'2026-09-16T12:02:00Z',completed_at:'2026-09-16T12:08:00Z'},{id:secondId,conversation_id:conversationId,deliverable_type:slug,state:'delivered',progress_percent:100,work_order:order(secondId,firstId),artifacts:[artifact(secondId,2)],error_code:null,created_at:'2026-09-16T12:09:00Z',completed_at:'2026-09-16T12:15:00Z'}]
  const events=['accepted','queued','gathering-input','generating','validating','rendering','reviewing','delivered'].map((state,sequence)=>({job_id:secondId,sequence,state,payload:state==='validating'?{workmanship:{passed:true,score:94}}:{}}))
  return {conversation:{id:conversationId,status:'submitted',readiness:100,current_spec_version:1,updated_at:'2026-09-16T12:10:00Z'},specification:{id:specId,conversation_id:conversationId,version:1,status:'approved',content_hash:'a'.repeat(64),specification:spec},evidence:{id:`evidence-${slug}`,conversation_id:conversationId,extraction_status:'verified',content_sha256:'c'.repeat(64),retrieval_sha256:'d'.repeat(64)},jobs,events}
}

describe('pilot release auditor',()=>{
  it('requires authoritative proof across every class and gate',()=>{
    const fixtures=PILOT_DELIVERABLES.map(fixture)
    const report=auditPilotRelease({conversations:fixtures.map(item=>item.conversation),specifications:fixtures.map(item=>item.specification),evidence:fixtures.map(item=>item.evidence),jobs:fixtures.flatMap(item=>item.jobs),events:fixtures.flatMap(item=>item.events)})
    expect(report).toMatchObject({passed:true,passed_classes:6,total_classes:6})
    expect(report.classes.every(item=>item.gates.length===8&&item.gates.every(gate=>gate.passed))).toBe(true)
  })

  it('does not call a delivered PDF pilot-ready without verification, recovery, and regeneration proof',()=>{
    const item=fixture('quote');const delivered=item.jobs[2]
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:[delivered],events:item.events.filter(event=>event.state!=='validating')})
    const quote=report.classes.find(entry=>entry.deliverable_type==='quote')!
    expect(quote.passed).toBe(false)
    expect(quote.gates.filter(gate=>!gate.passed).map(gate=>gate.key)).toEqual(expect.arrayContaining(['launch','verification','recovery','regeneration']))
  })
})
