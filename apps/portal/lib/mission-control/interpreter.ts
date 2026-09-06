import type { DeliverableSpecification, MissionFact, MissionTurnResult } from './contracts'
import { executionGaps } from './work-order'

const FIELD_SERVICE = /proposal|estimate|quote|scope|client|job|project|work discussed|service/i
const AGREEMENT = /agreement|contract|nda|legal/i
const REPORT = /report|incident|daily log|site report|inspection/i
const EXECUTIVE = /capability|executive|board|investor|presentation|deck/i
const GOVERNMENT = /rfp|solicitation|government|federal|compliance/i
const FINANCIAL = /cash flow|budget|financial|forecast|variance/i
const EXPLICIT_PROPOSAL = /\b(?:proposal|estimate|quote)\b/i

export type SupportedMissionArtifact = 'proposal' | 'sow' | 'contract-package' | 'daily-construction-report' | 'capability-statement' | 'cash-flow-budget-package' | 'federal-proposal'

/**
 * Preserve a deliverable the user named directly. Broad domain vocabulary is
 * useful only after this check; a caution such as "do not invent financial
 * claims" must never turn an explicitly requested proposal into a budget.
 */
export function explicitMissionArtifact(text: string): SupportedMissionArtifact | null {
  if (/\b(?:rfp|solicitation|federal proposal|government proposal)\b/i.test(text)) return 'federal-proposal'
  if (/\b(?:cash[ -]?flow (?:forecast|budget)|budget(?: vs\.? actual)?|financial forecast|variance analysis)\b/i.test(text)) return 'cash-flow-budget-package'
  if (/\b(?:capability statement|qualifications statement)\b/i.test(text)) return 'capability-statement'
  if (/\b(?:service agreement|contract package|contract|nda|non-disclosure agreement)\b/i.test(text)) return 'contract-package'
  if (/\b(?:daily (?:construction|site) report|incident report|field service report)\b/i.test(text)) return 'daily-construction-report'
  if (/\bstatement of work\b|\bsow\b/i.test(text)) return 'sow'
  if (EXPLICIT_PROPOSAL.test(text)) return 'proposal'
  return null
}

export function recommendMissionArtifact(text: string) {
  if (explicitMissionArtifact(text) === 'proposal') return { family: 'Client decision package', type: 'proposal', playbook: 'field-service-proposal', rationale: 'A proposal with a clear scope and attached terms gives the recipient an easy decision while keeping execution precise.', sections: ['Executive overview', 'Understanding of need', 'Proposed scope', 'Approach and schedule', 'Investment and terms', 'Assumptions and exclusions', 'Acceptance'], checks: ['scope-completeness', 'commercial-terms', 'assumption-disclosure'] }
  if (GOVERNMENT.test(text)) return { family: 'Government response', type: 'federal-proposal', playbook: 'government-response', rationale: 'The mission appears governed by explicit requirements that need traceable compliance coverage.', sections: ['Executive response', 'Compliance matrix', 'Technical approach', 'Management approach', 'Past performance', 'Required representations'], checks: ['requirement-coverage', 'page-limits', 'unmet-requirements'] }
  if (EXECUTIVE.test(text)) return { family: 'Executive communication', type: 'capability-statement', playbook: 'executive-capability', rationale: 'The audience needs a concise statement of credibility, differentiation, and next action.', sections: ['Positioning statement', 'Core capabilities', 'Proof and past performance', 'Differentiators', 'Contact and next action'], checks: ['claim-provenance', 'audience-fit', 'brevity'] }
  if (AGREEMENT.test(text)) return { family: 'Legal agreement', type: 'contract-package', playbook: 'balanced-agreement', rationale: 'The mission centers on mutual obligations and terms that should remain explicit and balanced.', sections: ['Purpose and parties', 'Scope and responsibilities', 'Commercial terms', 'Term and termination', 'Risk allocation', 'Signatures'], checks: ['party-and-authority', 'obligation-balance', 'termination-terms'] }
  if (EXPLICIT_PROPOSAL.test(text)) return { family: 'Client decision package', type: 'proposal', playbook: 'field-service-proposal', rationale: 'A proposal with a clear scope and attached terms gives the recipient an easy decision while keeping execution precise.', sections: ['Executive overview', 'Understanding of need', 'Proposed scope', 'Approach and schedule', 'Investment and terms', 'Assumptions and exclusions', 'Acceptance'], checks: ['scope-completeness', 'commercial-terms', 'assumption-disclosure'] }
  if (FINANCIAL.test(text)) return { family: 'Financial package', type: 'cash-flow-budget-package', playbook: 'financial-package', rationale: 'The outcome depends on reconciled numerical evidence and decision-ready financial explanation.', sections: ['Executive summary', 'Assumptions', 'Cash-flow analysis', 'Variance analysis', 'Risks and sensitivities', 'Recommended actions'], checks: ['arithmetic-reconciliation', 'period-consistency', 'source-traceability'] }
  if (REPORT.test(text)) return { family: 'Operational report', type: 'daily-construction-report', playbook: 'field-service-report', rationale: 'The request is evidence-led and needs a chronological, defensible record.', sections: ['Report summary', 'Conditions and observations', 'Work completed', 'Evidence log', 'Issues and actions', 'Attestation'], checks: ['timeline-consistency', 'evidence-custody', 'unverified-claims'] }
  if (FIELD_SERVICE.test(text)) return { family: 'Client decision package', type: 'proposal', playbook: 'field-service-proposal', rationale: 'A proposal with a clear scope and attached terms gives the recipient an easy decision while keeping execution precise.', sections: ['Executive overview', 'Understanding of need', 'Proposed scope', 'Approach and schedule', 'Investment and terms', 'Assumptions and exclusions', 'Acceptance'], checks: ['scope-completeness', 'commercial-terms', 'assumption-disclosure'] }
  return { family: 'Client decision package', type: 'proposal', playbook: 'field-service-proposal', rationale: 'A proposal with a clear scope and attached terms gives the recipient an easy decision while keeping execution precise.', sections: ['Executive overview', 'Understanding of need', 'Proposed scope', 'Approach and schedule', 'Investment and terms', 'Assumptions and exclusions', 'Acceptance'], checks: ['scope-completeness', 'commercial-terms', 'assumption-disclosure'] }
}

function extractFacts(text: string): MissionFact[] {
  const facts: MissionFact[] = []
  const money = text.match(/\$[\d,]+(?:\.\d{2})?/)
  const date = text.match(/(?:by|before|due)\s+([A-Z][a-z]+\s+\d{1,2}(?:,\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)/i)
  const audience = text.match(/(?:send|give|present|submit)(?:\s+it)?\s+to\s+(?:the\s+)?([^,.]+)/i)
    ?? text.match(/\bfor\s+(?:the\s+)?([^,.$]+?)(?=\s+for\s+\$|\s+(?:due|by|before)\b|[,.]|$)/i)
  if (money) facts.push({ key: 'commercial_value', label: 'Commercial value', value: money[0], source: 'user', confidence: 1 })
  if (date) facts.push({ key: 'deadline', label: 'Deadline', value: date[1], source: 'user', confidence: .92 })
  if (audience) facts.push({ key: 'primary_audience', label: 'Primary audience', value: audience[1].trim(), source: 'user', confidence: .88 })
  if (FIELD_SERVICE.test(text)) facts.push({ key: 'mission_domain', label: 'Mission domain', value: 'Professional or field services', source: 'inferred', confidence: .78 })
  return facts
}

export function interpretMission(text: string, prior?: DeliverableSpecification): MissionTurnResult {
  const choice = recommendMissionArtifact(`${prior?.mission.objective ?? ''} ${text}`)
  const changed = extractFacts(text)
  const factMap = new Map((prior?.content.facts ?? []).map(fact => [fact.key, fact]))
  for (const fact of changed) factMap.set(fact.key, fact)
  const facts = [...factMap.values()]
  const audience = facts.find(fact => fact.key === 'primary_audience')?.value
  const value = facts.find(fact => fact.key === 'commercial_value')?.value
  const deadline = facts.find(fact => fact.key === 'deadline')?.value
  const missing = [!audience && 'Who is the primary recipient?', !value && choice.type === 'proposal' && 'What price or pricing structure should the recipient see?', !deadline && 'When does this need to be ready?', 'What source files or facts should APOLLO treat as evidence?'].filter(Boolean) as string[]
  let readiness = Math.min(88, 34 + facts.length * 14 + (text.length > 120 ? 12 : 0))
  const spec: DeliverableSpecification = {
    schema_version: '1.0', mission: { title: prior?.mission.title || 'Untitled mission', objective: prior?.mission.objective || text.trim(), desired_decision_or_action: prior?.mission.desired_decision_or_action || 'Enable the recipient to understand and act on the request', stakes: value ? 'high' : 'medium', deadline: deadline ?? null },
    audience: { primary: audience ? [audience] : [], secondary: [], knowledge_level: 'To confirm', relationship: 'To confirm', sensitivities: [] },
    artifact: { recommended_family: choice.family, recommended_type: choice.type, alternatives_considered: choice.type === 'proposal' ? ['sow', 'quote'] : [], rationale: choice.rationale, required_formats: ['pdf'] },
    aura: { authority: 78, warmth: 45, technicality: 62, restraint: 84, urgency: deadline ? 72 : 48, prestige: 76, visual_density: 46, keywords: ['precise', 'credible', 'controlled'], avoid: ['ornamental', 'generic', 'overstated'] },
    content: { facts, claims: [], requirements: [], sections: choice.sections, commercial_terms: value ? { value } : {}, obligations: [], assumptions: missing.map(item => item.replace(/\?$/, ' remains unresolved')), exclusions: [], open_questions: missing }, sources: prior?.sources ?? [],
    specialist: { playbook_id: choice.playbook, playbook_version: '1.0', risk_flags: value ? ['commercial-commitment'] : [], required_checks: choice.checks }, presentation: { brand_profile_id: null, design_profile_id: 'apollo-aerospace-industrial', layout_genre: choice.type === 'proposal' ? 'client-decision' : 'professional-report', logo_policy: 'approved-brand-only', signature_policy: choice.type.includes('contract') ? 'required' : 'optional', watermark_policy: 'none-internal' }, approval: { status: readiness >= 75 ? 'ready' : 'draft', approved_by: null, approved_at: null },
  }
  const specialistGaps = executionGaps(spec)
  if (specialistGaps.length) {
    readiness = Math.min(readiness, 70)
    const gapQuestion = `What should APOLLO use for ${specialistGaps[0].label.toLowerCase()}?`
    spec.content.open_questions = [gapQuestion, ...spec.content.open_questions.filter(item => item !== gapQuestion)]
    spec.approval.status = 'draft'
  }
  const question = spec.content.open_questions[0] ?? null
  return { acknowledgement: `I understand this as a ${choice.family.toLowerCase()}. I recommend a ${choice.type.replace(/-/g, ' ')} because ${choice.rationale.charAt(0).toLowerCase()}${choice.rationale.slice(1)}`, question, question_reason: question ? 'This can change the document structure, detail, or approval language.' : null, readiness, readiness_state: readiness >= 75 ? 'ready' : readiness >= 50 ? 'calibrating' : 'discovery', changed_facts: changed, specification: spec }
}
