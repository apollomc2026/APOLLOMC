import { NextResponse } from 'next/server'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { createMissionFact, specificationProvenance, type DeliverableSpecification } from '@/lib/mission-control/contracts'
import { createClient, createServiceClient } from '@/lib/supabase/server'

const fixtureTimestamp = '2026-09-06T11:45:00.000Z'
const reviewFacts = [createMissionFact({
  key: 'value',
  label: 'Program value',
  value: '$18,500',
  normalized_value: '18500 USD',
  source: 'user',
  source_reference: 'conversation:mission-demo',
  capture_method: 'user',
  confidence: 1,
  verification_state: 'stated',
  sensitivity: 'confidential',
  last_editor: 'test-user',
  updated_at: fixtureTimestamp,
}, new Date(fixtureTimestamp))]

const reviewSpecification = {
  schema_version: '1.0',
  mission: {
    title: 'Field Operations Proposal',
    objective: 'Secure approval for a controlled inspection, remediation, and verification program.',
    desired_decision_or_action: 'Authorize the proposed field operations program.',
    stakes: 'high',
    deadline: '2026-10-15',
  },
  audience: { primary: ['Facilities director'], secondary: ['Procurement'], knowledge_level: 'expert', relationship: 'prospective client', sensitivities: ['Operational continuity'] },
  artifact: { recommended_family: 'Commercial proposal', recommended_type: 'field-service-proposal', alternatives_considered: ['Statement of work'], rationale: 'A decision-ready proposal best supports authorization.', required_formats: ['pdf'] },
  aura: { authority: 90, warmth: 42, technicality: 74, restraint: 82, urgency: 55, prestige: 86, visual_density: 48, keywords: ['decisive', 'evidence-led'], avoid: ['generic claims'] },
  content: {
    facts: reviewFacts,
    claims: ['The proposed program reduces operational uncertainty.'],
    requirements: ['Define inspection, remediation, and verification phases.'],
    sections: ['Executive decision brief', 'Existing conditions', 'Execution methodology', 'Commercial terms', 'Authorization'],
    commercial_terms: { investment: '$18,500' },
    obligations: ['Maintain site access'],
    assumptions: ['Work occurs during approved windows'],
    exclusions: ['Unidentified concealed conditions'],
    open_questions: [],
  },
  sources: [{ id: 'ev-demo', name: 'site-survey.pdf', status: 'verified' }],
  specialist: { playbook_id: 'field-service-proposal', playbook_version: '1.0', risk_flags: [], required_checks: ['Commercial reconciliation', 'Evidence traceability'] },
  presentation: { brand_profile_id: null, design_profile_id: 'apollo-executive', layout_genre: 'aerospace-industrial', logo_policy: 'cover-and-footer', signature_policy: 'authorization-block', watermark_policy: 'none' },
  approval: { status: 'approved', approved_by: 'test-user', approved_at: fixtureTimestamp, unresolved_items_accepted: [] },
  provenance: specificationProvenance(reviewFacts, fixtureTimestamp),
} satisfies DeliverableSpecification

const reviewFixture = {
  conversation_id: 'mission-demo',
  readiness: 100,
  specification_version: 3,
  status: 'submitted',
  turns: [],
  specification: reviewSpecification,
  job: {
    id: 'job-demo', state: 'delivered', progress_percent: 100, message: 'Document deliverables are ready',
    artifacts: [{ title: 'Field Operations Proposal', web_view_url: 'https://drive.google.com/', version: 2, content_sha256: '9df2632a3b613339110db848462d2994f751818317a42b282e97057381d11c45' }],
    artifact_url: 'https://drive.google.com/', revision_of: 'job-original', revision_instruction: 'Tighten the executive decision brief.', missing_inputs: [], error_code: null, created_at: '2026-09-06T12:00:00.000Z', completed_at: '2026-09-06T12:06:00.000Z',
  },
  jobs: [
    { id: 'job-demo', state: 'delivered', progress_percent: 100, message: 'Document deliverables are ready', artifacts: [{ title: 'Field Operations Proposal', web_view_url: 'https://drive.google.com/', version: 2, content_sha256: '9df2632a3b613339110db848462d2994f751818317a42b282e97057381d11c45' }], revision_of: 'job-original', revision_instruction: 'Tighten the executive decision brief.', missing_inputs: [], error_code: null, created_at: '2026-09-06T12:00:00.000Z', completed_at: '2026-09-06T12:06:00.000Z' },
    { id: 'job-original', state: 'delivered', progress_percent: 100, message: 'Document deliverables are ready', artifacts: [{ title: 'Field Operations Proposal', web_view_url: 'https://drive.google.com/', version: 1 }], revision_of: null, revision_instruction: null, missing_inputs: [], error_code: null, created_at: '2026-09-06T11:45:00.000Z', completed_at: '2026-09-06T11:53:00.000Z' },
  ],
}

export async function GET(request: Request) {
  if (process.env.PLAYWRIGHT_TESTING === 'true') {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 })
    if (id !== reviewFixture.conversation_id) return NextResponse.json({ error: 'Mission conversation was not found' }, { status: 404 })
    return NextResponse.json(reviewFixture)
  }
  const allowed = await requireAllowedUser()
  if (!allowed.ok) return NextResponse.json({ error: allowed.error }, { status: allowed.status })
  const id = new URL(request.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Conversation id is required' }, { status: 400 })
  const db = await createClient()
  const conversation = await db.from('apollo_conversations').select('id, readiness, current_spec_version, status').eq('id', id).eq('user_id', allowed.user.userId).single()
  if (conversation.error || !conversation.data) return NextResponse.json({ error: 'Mission conversation was not found' }, { status: 404 })
  const [turns, spec, evidence] = await Promise.all([
    db.from('apollo_conversation_turns').select('id, role, content, rationale, created_at').eq('conversation_id', id).order('sequence'),
    db.from('apollo_specification_versions').select('specification').eq('conversation_id', id).eq('version', conversation.data.current_spec_version).single(),
    db.from('apollo_conversation_evidence').select('id, original_name, extraction_status, extracted_facts').eq('conversation_id', id).eq('user_id', allowed.user.userId).order('created_at'),
  ])
  if (turns.error || spec.error || evidence.error) return NextResponse.json({ error: turns.error?.message ?? spec.error?.message ?? evidence.error?.message }, { status: 500 })
  const specification = spec.data.specification as Record<string, unknown>
  specification.sources = evidence.data.map(item => ({ id: item.id, name: item.original_name, status: item.extraction_status }))
  const content = specification.content as { facts?: Array<{ key: string }> }
  const facts = [...(content.facts ?? []), ...evidence.data.flatMap(item => Array.isArray(item.extracted_facts) ? item.extracted_facts : [])] as Array<{ key: string }>
  content.facts = [...new Map(facts.map(fact => [fact.key, fact])).values()]
  const service = await createServiceClient()
  const jobs = await service.from('apollo_document_jobs').select('id,state,progress_percent,status_message,artifacts,work_order,missing_inputs,error_code,created_at,completed_at').eq('conversation_id', id).eq('requested_by', allowed.user.userId).order('created_at', { ascending: false })
  if (jobs.error) return NextResponse.json({ error: jobs.error.message }, { status: 500 })
  const history = (jobs.data ?? []).map(item => {
    const artifacts = (item.artifacts as Array<{ title?: string; web_view_url?: string; version?: number; content_sha256?: string }> | null) ?? []
    const workOrder = item.work_order as { fields?: { revision_of?: string; revision_instruction?: string } } | null
    return { id:item.id, state:item.state, progress_percent:item.progress_percent, message:item.status_message, artifacts, revision_of:workOrder?.fields?.revision_of ?? null, revision_instruction:workOrder?.fields?.revision_instruction ?? null, missing_inputs:item.missing_inputs ?? [], error_code:item.error_code ?? null, created_at:item.created_at, completed_at:item.completed_at }
  })
  const latest = history[0] ?? null
  return NextResponse.json({ conversation_id: id, readiness: conversation.data.readiness, specification_version: conversation.data.current_spec_version, status: conversation.data.status, turns: turns.data.map(turn => ({ id: turn.id, role: turn.role, content: turn.content, reason: turn.rationale, createdAt: turn.created_at })), specification, job: latest ? { ...latest, artifact_url: latest.artifacts[0]?.web_view_url ?? null } : null, jobs: history })
}
