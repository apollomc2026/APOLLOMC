import { describe, expect, it } from 'vitest'
import { buildDocumentIdentity } from '@/lib/executor/pipeline'
import { cleanDisplayAddress, cleanExecutionFields, isUsableExternalReference } from '@/lib/mission-control/field-quality'
import type { DocumentWorkOrder } from '@/lib/executor/contracts'

function order(fields:Record<string,unknown>):DocumentWorkOrder {
  return {
    protocol_version:'1.0', work_order_id:'4bbe687f-af0c-528a-a71a-d35b2872a804', idempotency_key:'test', project_id:'c36fe50c-fdd9-421b-83ef-f45b36c96d4b', conversation_id:'conversation', task_id:'task', requested_by:'user', capability:'professional-document-generation', deliverable_type:'fsr', objective:'Create an FSR', audience:'Operations', formats:['pdf'], fields, sources:[], brand_id:'kit:on-spot', style_id:'industrial', sensitivity:'internal', priority:'medium', drive_destination:{ folder_id:'folder', lifecycle:'draft' }, quality_gates:{ schema_validation:true, source_grounding:true, independent_review:false, deterministic_financial_verification:false, human_approval_before_publish:true }, trace:{ specification_id:'spec', specification_hash:'hash', specification_schema_version:'1', playbook_id:'fsr', playbook_version:'1', model_versions:[], required_checks:[], accepted_unresolved_items:[] }, created_at:'2026-09-16T00:00:00.000Z',
  }
}

describe('controlled document identity', () => {
  it('rejects conversational text masquerading as a work-order reference', () => {
    const bad = 'all of the above is answered in the original doc i uploaded please scan and check for the needed information'
    expect(isUsableExternalReference(bad)).toBe(false)
    expect(cleanExecutionFields({ work_order_number:bad })).not.toHaveProperty('work_order_number')
  })

  it('cleans conversational address prefixes without inventing an address', () => {
    expect(cleanDisplayAddress('address is 1 Broadway Everett ma')).toBe('1 Broadway Everett MA')
  })

  it('uses a labeled service-record identity and a human-readable filename when no customer work order exists', () => {
    const identity = buildDocumentIdentity({ order:order({ site_name:'Encore Boston Harbor', visit_date:'2026-09-15' }), brandLabel:'On Spot Solutions', generatedAt:new Date('2026-09-16T12:00:00Z'), artifactVersion:2 })
    expect(identity.documentId).toBe('ONS-FSR-20260916-SR-4BBE68')
    expect(identity.filename).toBe('On-Spot-Solutions_FSR_Encore-Boston-Harbor_2026-09-15_SR-4BBE68_V2.pdf')
    expect(identity.filename).not.toContain('c36fe50c')
  })

  it('preserves a trustworthy customer work order in document control', () => {
    const identity = buildDocumentIdentity({ order:order({ site_name:'Encore Boston Harbor', visit_date:'2026-09-15', work_order_number:'GTI-2026-0814' }), brandLabel:'On Spot Solutions', generatedAt:new Date('2026-09-16T12:00:00Z'), artifactVersion:1 })
    expect(identity.documentId).toBe('GTI-2026-0814')
    expect(identity.filename).toContain('WO-GTI-2026-0814')
  })
})
