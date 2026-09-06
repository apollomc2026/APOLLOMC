import Anthropic from '@anthropic-ai/sdk'
import { modelFor } from '@/lib/ai/models'
import { explicitMissionArtifact, interpretMission, recommendMissionArtifact } from './interpreter'
import type { DeliverableSpecification, MissionFact, MissionTurnResult } from './contracts'
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

const SYSTEM = `You are APOLLO's mission interpreter. Convert a natural professional request into evidence-aware mission state.
Return one JSON object only. Never invent names, dates, prices, obligations, qualifications, or evidence.
Put directly stated information in stated_facts. Put interpretations only in inferred_facts with confidence from 0 to 1.
Recommend exactly one supported deliverable type. Ask only the single most consequential unresolved question.
Keys: acknowledgement, objective, desired_action, primary_audience, recommendation, rationale, stated_facts, inferred_facts, next_question, question_reason.`

function safeText(value: unknown, max = 2000): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, max) : undefined
}

function safeFacts(items: unknown, source: MissionFact['source']): MissionFact[] {
  if (!Array.isArray(items)) return []
  return items.slice(0, 20).flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const row = item as Record<string, unknown>
    const key = safeText(row.key, 80); const label = safeText(row.label, 120); const value = safeText(row.value, 2000)
    if (!key || !label || !value) return []
    const confidence = source === 'user' ? 1 : Math.max(0, Math.min(1, Number(row.confidence) || .6))
    return [{ key: key.replace(/[^a-z0-9_]/gi, '_').toLowerCase(), label, value, source, confidence }]
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
  }
  const modelQuestion = safeText(patch.next_question, 500)
  const openQuestions = [...new Set([...gapQuestions, ...(modelQuestion && !gapQuestions.includes(modelQuestion) ? [modelQuestion] : [])])]
  specification.content.open_questions = openQuestions
  specification.content.assumptions = openQuestions.map(item => item.replace(/\?$/, ' remains unresolved'))
  if (!gaps.length) question = modelQuestion ?? null
  specification.approval.status = readiness >= 75 ? 'ready' : 'draft'
  return { ...base, acknowledgement: safeText(patch.acknowledgement, 1200) ?? base.acknowledgement, question, question_reason: safeText(patch.question_reason, 500) ?? base.question_reason, readiness, readiness_state: readiness >= 75 ? 'ready' : readiness >= 50 ? 'calibrating' : 'discovery', specification }
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
  if (!process.env.ANTHROPIC_API_KEY) return base
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
    const patch = JSON.parse(json) as ClaudeInterpretation
    const explicit = explicitMissionArtifact(text)
    if (explicit) patch.recommendation = explicit
    return applyExplicitMissionDirectives(applyClaudeInterpretation(base, patch), text)
  } catch (error) {
    console.warn('[mission-control] Claude interpretation fallback:', error instanceof Error ? error.message : 'unknown error')
    return base
  }
}
