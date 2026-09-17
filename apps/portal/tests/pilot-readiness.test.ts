import { describe,expect,it } from 'vitest'
import { auditPilotRelease,PILOT_DELIVERABLES } from '../lib/mission-control/pilot-readiness'
import { interpretMission } from '../lib/mission-control/interpreter'
import { REVISION_SCOPE,revisionDirectiveDigest } from '../lib/mission-control/revision'

function fixture(slug:(typeof PILOT_DELIVERABLES)[number]){
  const spec=interpretMission(`Create a ${slug}.`).specification;spec.artifact.recommended_type=slug;spec.aura.operator_involvement=0;spec.approval={status:'approved',approved_by:'user',approved_at:'2026-09-16T12:00:00Z',unresolved_items_accepted:[]};spec.content.open_questions=[]
  if(slug==='quote')spec.content.facts.push({key:'market_pricing_basis',label:'Market pricing basis',value:'Field labor | USD 110.00–165.00 per hour | typical USD 135.00',normalized_value:'Field labor | USD 110.00–165.00 per hour | typical USD 135.00',source:'research',source_reference:'https://official.example/rates',source_references:['https://official.example/rates'],capture_method:'system_lookup',confidence:.9,verification_state:'verified',sensitivity:'internal',last_editor:'apollo',updated_at:'2026-09-16T12:00:00Z'})
  const conversationId=`mission-${slug}`;const specId=`spec-${slug}`;const evidenceId=`evidence-${slug}`;const failedId=`10000000-0000-5000-a000-${String(PILOT_DELIVERABLES.indexOf(slug)+1).padStart(12,'0')}`;const firstId=`20000000-0000-5000-a000-${String(PILOT_DELIVERABLES.indexOf(slug)+1).padStart(12,'0')}`;const secondId=`30000000-0000-5000-a000-${String(PILOT_DELIVERABLES.indexOf(slug)+1).padStart(12,'0')}`
  const evidenceFact={key:'reference_documents',label:'Reference documents / standards',value:`${slug} source.pdf`,normalized_value:`${slug} source.pdf`,source:'evidence' as const,source_reference:evidenceId,capture_method:'file_extraction' as const,confidence:1,verification_state:'verified' as const,sensitivity:'confidential' as const,last_editor:'apollo',updated_at:'2026-09-16T12:00:00Z'}
  spec.sources=[{id:evidenceId,name:`${slug} source.pdf`,status:'verified'}];spec.content.facts.push(evidenceFact)
  const artifact=(id:string,version:number)=>({artifact_id:`artifact-${id}`,project_id:specId,conversation_id:conversationId,task_id:id,title:slug,filename:`On-Spot_${slug}_Pilot_V${version}.pdf`,document_id:`DOC-${id.slice(0,6)}`,deliverable_type:slug,brand_id:'kit:on-spot',style_id:'industrial',specification_id:specId,specification_hash:'a'.repeat(64),artifact_type:'document' as const,lifecycle:'draft' as const,storage_provider:'google-drive' as const,storage_file_id:`file-${id}`,storage_parent_id:'folder',version,content_sha256:'b'.repeat(64),mime_type:'application/pdf',source_engine_id:'apollo-documents',source_run_id:id,integrity:{bytes:250000,pages:8,text_characters:12000,verified_at:'2026-09-16T12:10:00Z'},created_at:'2026-09-16T12:10:00Z'})
  const order=(id:string,revisionOf?:string)=>{const instruction='Regenerate the approved mission with improved presentation.';return {protocol_version:'1.0' as const,work_order_id:id,idempotency_key:`launch-${id}-${'a'.repeat(16)}`,project_id:specId,conversation_id:conversationId,task_id:id,requested_by:'user',capability:'professional-document-generation',deliverable_type:slug,objective:'Pilot',audience:'Operator',formats:['pdf' as const],fields:revisionOf?{revision_of:revisionOf,revision_instruction:instruction,revision_scope:REVISION_SCOPE,revision_directive_sha256:revisionDirectiveDigest(instruction),artifact_version:2}:{},sources:[],brand_id:'kit:on-spot',style_id:'industrial',sensitivity:'internal' as const,priority:'medium' as const,drive_destination:{folder_id:'folder',lifecycle:'draft' as const},quality_gates:{schema_validation:true as const,source_grounding:true as const,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true as const},trace:{specification_id:specId,specification_hash:'a'.repeat(64),specification_schema_version:'1.0',playbook_id:'pilot',playbook_version:'1',model_versions:[],required_checks:[],accepted_unresolved_items:[]},created_at:'2026-09-16T12:00:00Z'}}
  const jobs=[{id:failedId,conversation_id:conversationId,deliverable_type:slug,state:'failed',progress_percent:25,work_order:order(failedId),artifacts:[],error_code:'TEST_FAILURE',completion_email_status:'pending',failure_email_status:'sent',created_at:'2026-09-16T12:00:00Z',completed_at:'2026-09-16T12:01:00Z'},{id:firstId,conversation_id:conversationId,deliverable_type:slug,state:'delivered',progress_percent:100,work_order:order(firstId),artifacts:[artifact(firstId,1)],error_code:null,completion_email_status:'sent',failure_email_status:'pending',created_at:'2026-09-16T12:02:00Z',completed_at:'2026-09-16T12:08:00Z'},{id:secondId,conversation_id:conversationId,deliverable_type:slug,state:'delivered',progress_percent:100,work_order:order(secondId,firstId),artifacts:[artifact(secondId,2)],error_code:null,completion_email_status:'sent',failure_email_status:'pending',created_at:'2026-09-16T12:09:00Z',completed_at:'2026-09-16T12:15:00Z'}]
  const specialistKey=slug==='fsr'||slug==='final-qc-report'?'field_record_verification':slug==='quote'||slug==='proposal'?'commercial_verification':slug==='cash-flow-budget-package'?'financial_verification':'agreement_verification'
  const events=['accepted','queued','gathering-input','generating','validating','rendering','reviewing','delivered'].map((state,sequence)=>({job_id:secondId,sequence,state,payload:state==='validating'?{workmanship:{passed:true,score:94},[specialistKey]:{required:true}}:{}}))
  return {conversation:{id:conversationId,status:'submitted',readiness:100,current_spec_version:1,updated_at:'2026-09-16T12:10:00Z'},specification:{id:specId,conversation_id:conversationId,version:1,status:'approved',content_hash:'a'.repeat(64),specification:spec},evidence:{id:evidenceId,conversation_id:conversationId,extraction_status:'verified',content_sha256:'c'.repeat(64),retrieval_sha256:'d'.repeat(64),extracted_facts:[evidenceFact],extraction_trace:{schema_version:'1.0' as const,mode:'pdf' as const,source_ids:[evidenceId],planned_passes:4,completed_passes:4,recovery_passes:1,reconciliation_passes:1,started_at:'2026-09-16T11:58:00Z',completed_at:'2026-09-16T11:59:00Z',status:'complete' as const}},jobs,events}
}

describe('pilot release auditor',()=>{
  it('requires authoritative proof across every class and gate',()=>{
    const fixtures=PILOT_DELIVERABLES.map(fixture)
    const report=auditPilotRelease({conversations:fixtures.map(item=>item.conversation),specifications:fixtures.map(item=>item.specification),evidence:fixtures.map(item=>item.evidence),jobs:fixtures.flatMap(item=>item.jobs),events:fixtures.flatMap(item=>item.events)})
    expect(report).toMatchObject({passed:true,passed_classes:6,total_classes:6})
    expect(report.classes.every(item=>item.gates.length===13&&item.gates.every(gate=>gate.passed))).toBe(true)
  })

  it('does not call a delivered PDF pilot-ready without verification, recovery, and regeneration proof',()=>{
    const item=fixture('quote');const delivered=item.jobs[2]
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:[delivered],events:item.events.filter(event=>event.state!=='validating')})
    const quote=report.classes.find(entry=>entry.deliverable_type==='quote')!
    expect(quote.passed).toBe(false)
    expect(quote.gates.filter(gate=>!gate.passed).map(gate=>gate.key)).toEqual(expect.arrayContaining(['launch','verification','recovery','regeneration']))
  })

  it('does not accept generic workmanship without the class specialist verifier',()=>{
    const item=fixture('proposal')
    item.events.find(event=>event.state==='validating')!.payload={workmanship:{passed:true,score:99}}
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const verification=report.classes.find(entry=>entry.deliverable_type==='proposal')!.gates.find(gate=>gate.key==='verification')!
    expect(verification).toMatchObject({passed:false})
    expect(verification.evidence).toContain('commercial_verification=missing')
  })

  it('does not pass when an extracted source fact is lost before approval',()=>{
    const item=fixture('fsr')
    item.specification.specification.content.facts=item.specification.specification.content.facts.filter(fact=>fact.key!=='reference_documents')
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const provenance=report.classes.find(entry=>entry.deliverable_type==='fsr')!.gates.find(gate=>gate.key==='provenance')!
    expect(provenance).toMatchObject({passed:false})
    expect(provenance.evidence).toContain('1 fact(s) lost during reconciliation')
  })

  it('does not pass without durable proof that every multipass extraction step completed',()=>{
    const item=fixture('fsr')
    item.evidence.extraction_trace.completed_passes=3
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const evidence=report.classes.find(entry=>entry.deliverable_type==='fsr')!.gates.find(gate=>gate.key==='evidence')!
    expect(evidence).toMatchObject({passed:false})
    expect(evidence.evidence).toContain('1 incomplete multipass trace(s)')
  })

  it('does not pass the quote class without cited system-lookup pricing research',()=>{
    const item=fixture('quote')
    item.specification.specification.content.facts=item.specification.specification.content.facts.filter(fact=>fact.key!=='market_pricing_basis')
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const gate=report.classes.find(entry=>entry.deliverable_type==='quote')!.gates.find(entry=>entry.key==='market-pricing')!
    expect(gate).toMatchObject({passed:false})
    expect(gate.evidence).toContain('Missing benchmark record')
  })

  it('does not hide the newest failed mission behind an older delivered mission',()=>{
    const older=fixture('quote');older.conversation.updated_at='2026-09-16T12:00:00Z'
    const newer=fixture('quote');newer.conversation.id='mission-quote-new';newer.conversation.updated_at='2026-09-16T13:00:00Z';newer.specification.id='spec-quote-new';newer.specification.conversation_id=newer.conversation.id
    newer.jobs=newer.jobs.slice(0,1).map(job=>({...job,conversation_id:newer.conversation.id}))
    newer.evidence={...newer.evidence,conversation_id:newer.conversation.id}
    const report=auditPilotRelease({conversations:[older.conversation,newer.conversation],specifications:[older.specification,newer.specification],evidence:[older.evidence,newer.evidence],jobs:[...older.jobs,...newer.jobs],events:older.events})
    const quote=report.classes.find(entry=>entry.deliverable_type==='quote')!
    expect(quote.conversation_id).toBe('mission-quote-new')
    expect(quote.gates.find(gate=>gate.key==='launch')).toMatchObject({passed:false})
  })

  it('fails launch and recovery when a later regeneration fails',()=>{
    const item=fixture('fsr')
    const failedAfter={...item.jobs[0],id:'40000000-0000-5000-a000-000000000001',created_at:'2026-09-16T12:20:00Z',completed_at:'2026-09-16T12:21:00Z'}
    item.jobs.push(failedAfter)
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const fsr=report.classes.find(entry=>entry.deliverable_type==='fsr')!
    expect(fsr.gates.find(gate=>gate.key==='launch')).toMatchObject({passed:false})
    expect(fsr.gates.find(gate=>gate.key==='recovery')).toMatchObject({passed:false})
  })

  it('rejects a regeneration that silently changes the approved brand',()=>{
    const item=fixture('proposal')
    item.jobs[2].work_order={...item.jobs[2].work_order,brand_id:'kit:unapproved-brand'}
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const regeneration=report.classes.find(entry=>entry.deliverable_type==='proposal')!.gates.find(gate=>gate.key==='regeneration')!
    expect(regeneration).toMatchObject({passed:false})
    expect(regeneration.evidence).toContain('approved authority=unproven')
  })

  it('rejects a regeneration whose editorial overlay is missing or tampered',()=>{
    const item=fixture('proposal')
    item.jobs[2].work_order.fields.revision_instruction='Change approved customer facts.'
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    expect(report.classes.find(entry=>entry.deliverable_type==='proposal')!.gates.find(gate=>gate.key==='regeneration')).toMatchObject({passed:false})
  })

  it('rejects a delivered artifact without durable parsed-PDF proof',()=>{
    const item=fixture('final-qc-report')
    delete (item.jobs[2].artifacts[0] as {integrity?:unknown}).integrity
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const artifact=report.classes.find(entry=>entry.deliverable_type==='final-qc-report')!.gates.find(gate=>gate.key==='artifact')!
    expect(artifact).toMatchObject({passed:false})
    expect(artifact.evidence).toContain('parsed PDF integrity=missing')
  })

  it('rejects a class whose completion or failure notification is not durably sent',()=>{
    const item=fixture('fsr')
    item.jobs[0].failure_email_status='failed'
    item.jobs[2].completion_email_status='pending'
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const notification=report.classes.find(entry=>entry.deliverable_type==='fsr')!.gates.find(gate=>gate.key==='notifications')!
    expect(notification).toMatchObject({passed:false})
    expect(notification.evidence).toContain('Completion email=pending')
    expect(notification.evidence).toContain('1 failure alert(s), 0 sent')
  })

  it('rejects an artifact whose durable identity drifts from the approved work order',()=>{
    const item=fixture('proposal')
    item.jobs[2].artifacts[0].conversation_id='wrong-mission'
    item.jobs[2].artifacts[0].deliverable_type='fsr'
    item.jobs[2].artifacts[0].specification_hash='c'.repeat(64)
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const artifact=report.classes.find(entry=>entry.deliverable_type==='proposal')!.gates.find(gate=>gate.key==='artifact')!
    expect(artifact).toMatchObject({passed:false})
    expect(artifact.evidence).toContain('output authority=mismatched')
  })

  it('rejects duplicate launch keys or noncanonical job identities',()=>{
    const item=fixture('quote')
    item.jobs[1].work_order.idempotency_key=item.jobs[0].work_order.idempotency_key
    item.jobs[2].work_order.work_order_id=item.jobs[1].id
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const gate=report.classes.find(entry=>entry.deliverable_type==='quote')!.gates.find(entry=>entry.key==='idempotency')!
    expect(gate).toMatchObject({passed:false})
    expect(gate.evidence).toContain('2 launch key(s)')
    expect(gate.evidence).toContain('job identity=mismatched')
  })

  it('rejects a representative mission that never proved full-autonomy resolution',()=>{
    const item=fixture('contract-intelligence-review')
    item.specification.specification.aura.operator_involvement=80
    item.specification.specification.approval.unresolved_items_accepted=['Accept an unsupported contracting party']
    const report=auditPilotRelease({conversations:[item.conversation],specifications:[item.specification],evidence:[item.evidence],jobs:item.jobs,events:item.events})
    const gate=report.classes.find(entry=>entry.deliverable_type==='contract-intelligence-review')!.gates.find(entry=>entry.key==='autonomy')!
    expect(gate).toMatchObject({passed:false})
    expect(gate.evidence).toContain('Operator involvement=80%')
    expect(gate.evidence).toContain('1 unresolved item(s) accepted')
  })
})
