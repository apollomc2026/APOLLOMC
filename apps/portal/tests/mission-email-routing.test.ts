import { afterEach, describe, expect, it } from 'vitest'
import { failedEmail, missionCompleteEmail } from '../lib/email/ses'
import { artifactMatchesNotificationAuthority,workOrderMatchesNotificationAuthority } from '../lib/executor/completion-notification'
import type { ArtifactManifest, DocumentWorkOrder } from '../lib/executor/contracts'

const previousAppUrl = process.env.NEXT_PUBLIC_APP_URL

afterEach(() => {
  process.env.NEXT_PUBLIC_APP_URL = previousAppUrl
})

describe('mission email surface ownership', () => {
  it('sends delivered mission records directly to Telemetry', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://apollo.example'
    const email = missionCompleteEmail('Final QC Report', 'mission / 7', 'https://drive.example/artifact')
    expect(email.html).toContain('https://apollo.example/telemetry?mission=mission%20%2F%207')
    expect(email.text).not.toContain('/dashboard?mission=')
  })

  it('sends failed missions directly to New Mission calibration', () => {
    process.env.NEXT_PUBLIC_APP_URL = 'https://apollo.example'
    const email = failedEmail('Federal Proposal', 'mission / 8')
    expect(email.html).toContain('https://apollo.example/new-mission?mission=mission%20%2F%208')
    expect(email.text).not.toContain('/dashboard?mission=')
  })
})

describe('completion notification authority',()=>{
  const order={protocol_version:'1.0',work_order_id:'10000000-0000-4000-8000-000000000001',idempotency_key:'approved-specification',project_id:'spec-1',conversation_id:'20000000-0000-4000-8000-000000000002',task_id:'30000000-0000-4000-8000-000000000003',requested_by:'user',capability:'professional-document-generation',deliverable_type:'proposal',objective:'Proposal',audience:'Client',formats:['pdf'],fields:{},sources:[],brand_id:'kit:on-spot',style_id:'industrial',sensitivity:'internal',priority:'medium',drive_destination:{folder_id:'folder',lifecycle:'draft'},quality_gates:{schema_validation:true,source_grounding:true,independent_review:false,deterministic_financial_verification:false,human_approval_before_publish:true},trace:{specification_id:'spec-v3',specification_hash:'a'.repeat(64),specification_schema_version:'3.0',playbook_id:'proposal',playbook_version:'1',model_versions:[],required_checks:[],accepted_unresolved_items:[]},created_at:'2026-09-16T00:00:00Z'} as DocumentWorkOrder
  const artifact={artifact_id:'artifact',project_id:order.project_id,conversation_id:order.conversation_id,task_id:order.task_id,title:'Proposal',filename:'On-Spot_Proposal.pdf',document_id:'DOC-1',deliverable_type:order.deliverable_type,brand_id:order.brand_id,style_id:order.style_id,specification_id:order.trace!.specification_id,specification_hash:order.trace!.specification_hash,artifact_type:'document',lifecycle:'draft',storage_provider:'google-drive',storage_file_id:'file',storage_parent_id:'folder',version:1,content_sha256:'b'.repeat(64),mime_type:'application/pdf',source_engine_id:'apollo-documents',source_run_id:order.work_order_id,created_at:'2026-09-16T00:01:00Z'} as ArtifactManifest

  it('accepts only an artifact bound to the approved work order',()=>{
    expect(artifactMatchesNotificationAuthority(artifact,order)).toBe(true)
    expect(artifactMatchesNotificationAuthority({...artifact,deliverable_type:'fsr'},order)).toBe(false)
    expect(artifactMatchesNotificationAuthority({...artifact,specification_hash:'c'.repeat(64)},order)).toBe(false)
  })

  it('binds terminal notifications to the canonical job mission, owner, and deliverable',()=>{
    const job={id:order.work_order_id,conversation_id:order.conversation_id,requested_by:order.requested_by,deliverable_type:order.deliverable_type}
    expect(workOrderMatchesNotificationAuthority(order,job)).toBe(true)
    expect(workOrderMatchesNotificationAuthority(order,{...job,conversation_id:'stale-mission'})).toBe(false)
    expect(workOrderMatchesNotificationAuthority(order,{...job,requested_by:'wrong-owner'})).toBe(false)
    expect(workOrderMatchesNotificationAuthority(order,{...job,deliverable_type:'fsr'})).toBe(false)
    expect(workOrderMatchesNotificationAuthority(order,{...job,id:'duplicate-job'})).toBe(false)
  })
})
