import Anthropic from '@anthropic-ai/sdk'
import { modelFor } from '@/lib/ai/models'
import { explicitMissionArtifact, interpretMission, recommendMissionArtifact } from './interpreter'
import { createMissionFact, specificationProvenance, type DeliverableSpecification, type MissionFact, type MissionTurnResult } from './contracts'
import { executionGaps } from './work-order'
import { getModule } from '@/lib/apollo/packages-loader'

interface ClaudeInterpretation {
  acknowledgement?: string
  objective?: string
  desired_action?: string
  primary_audience?: string
  recommendation?: 'proposal' | 'sow' | 'contract-package' | 'daily-construction-report' | 'capability-statement' | 'cash-flow-budget-package' | 'federal-proposal'
  rationale?: string
  stated_facts?: Array<{ key: string; label: string; value: string }>
  inferred_facts?: Array<{ key: string; label: string; value: string; confidence: number }>
  next_question?: string
  question_reason?: string
}

export function promoteAcknowledgedGap(patch: ClaudeInterpretation, text: string, prior?: DeliverableSpecification): ClaudeInterpretation {
  const activeGap = prior ? executionGaps(prior)[0] : null
  const acknowledgement = safeText(patch.acknowledgement, 1200)
  if (!activeGap || !acknowledgement || !/\b(?:received|resolved|confirmed|provided|captured)\b/i.test(acknowledgement)) return patch
  return {
    ...patch,
    stated_facts: [
      ...(patch.stated_facts ?? []).filter(fact => fact.key !== activeGap.key),
      { key: activeGap.key, label: activeGap.label, value: text.trim() },
    ],
  }
}

export function applyExpertRecommendationMode(patch: ClaudeInterpretation, text: string, specification: DeliverableSpecification): ClaudeInterpretation {
  if (!/^Use your expert recommendations\b/i.test(text.trim())) return patch
  const existing = new Set(specification.content.facts.filter(fact => fact.source === 'user' || fact.source === 'evidence' || fact.confidence >= .75).map(fact => fact.key))
  const recommendations = [
    { key: 'win_themes', label: 'Win themes (3–4)', value: 'Operational clarity; safety-controlled execution; decision-ready prioritization; commercial certainty', confidence: .86 },
    { key: 'proposed_methodology', label: 'Proposed methodology / phases', value: `Mobilize and confirm controls; inspect and document the defined scope; perform permitted functional assessment; analyze and prioritize verified findings; review and deliver the controlled final artifact. Tailor each phase to: ${specification.mission.objective}`, confidence: .84 },
    { key: 'risks_and_mitigations', label: 'Risks and mitigations', value: 'Restricted access or operating windows | coordinate access and sequencing before mobilization\nUnsafe or unavailable equipment | limit work to safe, permitted observation and document constraints\nIncomplete records | identify evidence gaps and qualify affected conclusions\nOperational disruption | coordinate controls and preserve site operations', confidence: .82 },
    { key: 'validity_period_days', label: 'Proposal validity (days)', value: '30', confidence: .8 },
    { key: 'next_steps_call_to_action', label: 'Next steps / call to action', value: 'Confirm acceptance of scope and commercial terms, execute the controlling agreement, satisfy mobilization requirements, designate the client coordinator, and schedule kickoff.', confidence: .84 },
  ]
  if (Object.keys(specification.content.commercial_terms).length || /fixed[- ]fee/i.test(specification.mission.objective)) recommendations.push({ key: 'pricing_model', label: 'Pricing model', value: 'fixed-fee', confidence: .95 })
  return { ...patch, acknowledgement: 'Expert recommendation mode applied. I resolved every professional default supported by the mission and preserved genuinely client-specific facts for explicit confirmation.', inferred_facts: [...(patch.inferred_facts ?? []), ...recommendations.filter(fact => !existing.has(fact.key))] }
}

const SYSTEM = `You are APOLLO's mission interpreter. Convert a natural professional request into evidence-aware mission state.
Return one JSON object only. Never invent names, dates, prices, obligations, qualifications, or evidence.
Put directly stated information in stated_facts. Put interpretations only in inferred_facts with confidence from 0 to 1.
Recommend exactly one supported deliverable type. Ask only the single most consequential unresolved question.
When the new user turn begins "Use your expert recommendations", enter expert-recommendation mode: resolve every safely inferable open decision in one response, not just the first. Use the exact specialist fact keys supplied in the prompt, place each recommendation in inferred_facts with an honest confidence score, and explain that they are recommendations. Derive methodology, themes, risks, formatting, and next steps from the existing specification. Never fill personal names, credentials, legal identities, client-only facts, prices, or dates that are not already supported; leave only those genuinely non-inferable items unresolved.
Keys: acknowledgement, objective, desired_action, primary_audience, recommendation, rationale, stated_facts, inferred_facts, next_question, question_reason.`

function safeText(value: unknown, max = 2000): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined
}

function safeFacts(items: unknown, source: MissionFact['source'], now = new Date()): MissionFact[] {
  if (!Array.isArray(items)) return []
  return items.slice(0, 20).flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const key = safeText(row.key, 80); const label = safeText(row.label, 120); const value = safeText(row.value, 2000)
    if (!key || !label || !value) return []
    const confidence = source === 'user' ? 1 : Math.max(0, Math.min(1, Number(row.confidence) || .6))
    return [createMissionFact({ key: key.replace(/[^a-z0-9_]/gi, '_').toLowerCase(), label, value, source, confidence }, now)]
  })
}

export function applyClaudeInterpretation(base: MissionTurnResult, patch: ClaudeInterpretation): MissionTurnResult {
  const facts = [...base.specification.content.facts]
  const merged = new Map(facts.map(fact => [fact.key, fact]))
  for (const fact of [...safeFacts(patch.stated_facts, 'user'), ...safeFacts(patch.inferred_facts, 'inferred')]) merged.set(fact.key, fact)
  const primaryAudience = safeText(patch.primary_audience, 300)
  const objective = safeText(patch.objective, 2000)
  const desiredAction = safeText(patch.desired_action, 1000)
  let question = safeText(patch.next_question, 500) ?? base.question
  let questionReason = safeText(patch.question_reason, 500) ?? base.question_reason
  const recommendation = patch.recommendation ? recommendMissionArtifact(`Create a ${patch.recommendation}`) : null
  const specification: DeliverableSpecification = {
    ...base.specification,
    mission: { ...base.specification.mission, objective: objective ?? base.specification.mission.objective, desired_decision_or_action: desiredAction ?? base.specification.mission.desired_decision_or_action },
    audience: { ...base.specification.audience, primary: primaryAudience ? [primaryAudience] : base.specification.audience.primary },
    artifact: recommendation ? { ...base.specification.artifact, recommended_family: recommendation.family, recommended_type: recommendation.type, rationale: safeText(patch.rationale, 1200) ?? recommendation.rationale } : { ...base.specification.artifact, rationale: safeText(patch.rationale, 1200) ?? base.specification.artifact.rationale },
    content: { ...base.specification.content, facts: [...merged.values()], sections: recommendation?.sections ?? base.specification.content.sections, open_questions: question ? [question, ...base.specification.content.open_questions.filter(item => item !== base.question && item !== question)] : base.specification.content.open_questions },
    specialist: recommendation ? { ...base.specification.specialist, playbook_id: recommendation.playbook, required_checks: recommendation.checks } : base.specification.specialist,
  }
  let readiness = Math.min(92, base.readiness + Math.min(16, Math.max(0, merged.size - facts.length) * 4))
  const gaps = executionGaps(specification)
  const gapQuestions = gaps.map(gap => `What should APOLLO use for ${gap.label.toLowerCase()}?`)
  if (gaps.length) {
    readiness = Math.min(readiness, 70)
    question = gapQuestions[0]
    questionReason = `${gaps[0].label} is required by the selected document module and cannot be invented.`
  }
  const modelQuestion = safeText(patch.next_question, 500)
  const openQuestions = [...new Set([...gapQuestions, ...(modelQuestion && !gapQuestions.includes(modelQuestion) ? [modelQuestion] : [])])]
  specification.content.open_questions = openQuestions
  specification.content.assumptions = openQuestions.map(item => item.replace(/\?$/, ' remains unresolved'))
  specification.provenance = specificationProvenance([...merged.values()], specification.provenance.created_at, specification.provenance.model_versions)
  if (!gaps.length) question = modelQuestion ?? null
  specification.approval.status = readiness >= 75 ? 'ready' : 'draft'
  return { ...base, acknowledgement: safeText(patch.acknowledgement, 1200) ?? base.acknowledgement, question, question_reason: questionReason, readiness, readiness_state: readiness >= 75 ? 'ready' : readiness >= 50 ? 'calibrating' : 'discovery', specification }
}

export function applyExplicitMissionDirectives(result: MissionTurnResult, text: string): MissionTurnResult {
  const selectsApolloBrand = /(?:approved\s+)?apollo(?:\s+mission\s+control)?\s+(?:brand|logo)|(?:brand|logo)(?:\s+profile)?\s+(?:is|use)\s+(?:the\s+)?(?:approved\s+)?apollo/i.test(text)
  if (!selectsApolloBrand) return result
  const isBrandQuestion = (item: string) => /brand_profile_id|brand profile|approved.*(?:brand|logo)/i.test(item)
  const openQuestions = result.specification.content.open_questions.filter(item => !isBrandQuestion(item))
  const assumptions = result.specification.content.assumptions.filter(item => !isBrandQuestion(item))
  const question = result.question && isBrandQuestion(result.question) ? openQuestions[0] ?? null : result.question
  return {
    ...result,
    question,
    question_reason: question ? result.question_reason : null,
    specification: {
      ...result.specification,
      content: { ...result.specification.content, open_questions: openQuestions, assumptions },
      presentation: { ...result.specification.presentation, brand_profile_id: 'apollo' },
    },
  }
}

export async function interpretMissionWithClaude(text: string, prior?: DeliverableSpecification): Promise<MissionTurnResult> {
  const base = interpretMission(text, prior)
  const safeFallback = () => applyExplicitMissionDirectives(applyClaudeInterpretation(base, applyExpertRecommendationMode({}, text, base.specification)), text)
  if (!process.env.ANTHROPIC_API_KEY) return safeFallback()
  try {
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    const fieldGuide = getModule(base.specification.artifact.recommended_type)?.required_fields.map(field => `${field.key}: ${field.label}`).join(', ') ?? ''
    // Sonnet 5 can spend part of the output allowance on adaptive thinking.
    // Leave enough room for both that reasoning and the complete JSON contract;
    // a truncated object must never silently discard a multi-fact user answer.
    const response = await client.messages.create({ model: modelFor('mission_interpretation'), max_tokens: 6000, system: SYSTEM, messages: [{ role: 'user', content: `Existing specification:\n${JSON.stringify(prior ?? null)}\n\nNew user turn:\n${text}\n\nFor the recommended specialist module, use these exact fact keys when directly stated: ${fieldGuide}` }] })
    const raw = response.content.find(block => block.type === 'text')
    if (!raw || raw.type !== 'text') return base
    const json = raw.text.match(/\{[\s\S]*\}/)?.[0]
    if (!json) return base
    const parsed = JSON.parse(json) as ClaudeInterpretation
    const patch = promoteAcknowledgedGap(applyExpertRecommendationMode(parsed, text, base.specification), text, prior)
    const explicit = explicitMissionArtifact(text)
    if (explicit) patch.recommendation = explicit
    const result = applyExplicitMissionDirectives(applyClaudeInterpretation(base, patch), text)
    result.specification.provenance = specificationProvenance(result.specification.content.facts, result.specification.provenance.created_at, [...result.specification.provenance.model_versions, `anthropic:${modelFor('mission_interpretation')}`])
    return result
  } catch (error) {
    console.warn('[mission-control] Claude interpretation fallback:', error instanceof Error ? error.message : 'unknown error')
    return safeFallback()
  }
}
