export type ReadinessState = 'discovery' | 'calibrating' | 'ready'

export type FactSource = 'user' | 'evidence' | 'inferred' | 'default'
export type FactCaptureMethod = 'user' | 'file_extraction' | 'system_lookup' | 'model_inference' | 'default'
export type FactVerificationState = 'stated' | 'verified' | 'unverified' | 'conflict'
export type Sensitivity = 'public' | 'internal' | 'confidential' | 'restricted'

export interface MissionFact {
  key: string
  label: string
  value: string
  normalized_value: string | null
  source: FactSource
  source_reference: string | null
  capture_method: FactCaptureMethod
  confidence: number
  verification_state: FactVerificationState
  sensitivity: Sensitivity
  last_editor: string
  updated_at: string
  conflicts?: Array<{ value: string; normalized_value: string | null; source: FactSource; source_reference: string | null }>
}

function comparableFactValue(fact: MissionFact): string {
  return (fact.normalized_value ?? fact.value).normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase()
}

export function mergeMissionFacts(priorFacts: MissionFact[], incomingFacts: MissionFact[], now = new Date()): MissionFact[] {
  const merged = new Map(priorFacts.map(fact => [fact.key, createMissionFact(fact, now)]))
  for (const incomingValue of incomingFacts) {
    const incoming = createMissionFact(incomingValue, now)
    const prior = merged.get(incoming.key)
    if (!prior || comparableFactValue(prior) === comparableFactValue(incoming)) {
      merged.set(incoming.key, incoming)
      continue
    }
    const candidates = [
      ...(prior.conflicts ?? [{ value: prior.value, normalized_value: prior.normalized_value, source: prior.source, source_reference: prior.source_reference }]),
      { value: incoming.value, normalized_value: incoming.normalized_value, source: incoming.source, source_reference: incoming.source_reference },
    ]
    merged.set(incoming.key, {
      ...prior,
      verification_state: 'conflict',
      confidence: Math.min(prior.confidence, incoming.confidence),
      last_editor: 'apollo',
      updated_at: now.toISOString(),
      conflicts: [...new Map(candidates.map(candidate => [`${candidate.source}:${candidate.source_reference ?? ''}:${candidate.normalized_value ?? candidate.value}`, candidate])).values()],
    })
  }
  return [...merged.values()]
}

export interface SpecificationProvenance {
  fact_origins: Array<{ key: string; source: FactSource; source_reference: string | null }>
  inferences: Array<{ key: string; value: string; confidence: number }>
  defaults: Array<{ key: string; value: string }>
  model_versions: string[]
  created_at: string
}

export function createMissionFact(
  input: Pick<MissionFact, 'key' | 'label' | 'value' | 'source' | 'confidence'> & Partial<Omit<MissionFact, 'key' | 'label' | 'value' | 'source' | 'confidence'>>,
  now = new Date(),
): MissionFact {
  const captureMethod: Record<FactSource, FactCaptureMethod> = { user: 'user', evidence: 'file_extraction', inferred: 'model_inference', default: 'default' }
  return {
    normalized_value: input.value.trim() || null,
    source_reference: null,
    capture_method: captureMethod[input.source],
    verification_state: input.source === 'evidence' ? 'verified' : input.source === 'user' ? 'stated' : 'unverified',
    sensitivity: 'internal',
    last_editor: input.source === 'user' ? 'user' : 'apollo',
    updated_at: now.toISOString(),
    ...input,
  }
}

export function specificationProvenance(facts: MissionFact[], createdAt: string, modelVersions: string[] = ['apollo-deterministic-interpreter@1.0']): SpecificationProvenance {
  return {
    fact_origins: facts.map(fact => ({ key: fact.key, source: fact.source, source_reference: fact.source_reference })),
    inferences: facts.filter(fact => fact.source === 'inferred').map(fact => ({ key: fact.key, value: fact.value, confidence: fact.confidence })),
    defaults: facts.filter(fact => fact.source === 'default').map(fact => ({ key: fact.key, value: fact.value })),
    model_versions: [...new Set(modelVersions)],
    created_at: createdAt,
  }
}

export interface DeliverableSpecification {
  schema_version: '1.0'
  mission: { title: string; objective: string; desired_decision_or_action: string; stakes: 'low' | 'medium' | 'high'; deadline: string | null }
  audience: { primary: string[]; secondary: string[]; knowledge_level: string; relationship: string; sensitivities: string[] }
  artifact: { recommended_family: string; recommended_type: string; alternatives_considered: string[]; rationale: string; required_formats: string[] }
  aura: { authority: number; warmth: number; technicality: number; restraint: number; urgency: number; prestige: number; visual_density: number; keywords: string[]; avoid: string[] }
  content: { facts: MissionFact[]; claims: string[]; requirements: string[]; sections: string[]; commercial_terms: Record<string, string>; obligations: string[]; assumptions: string[]; exclusions: string[]; open_questions: string[] }
  sources: Array<{ id: string; name: string; status: 'pending' | 'processing' | 'verified' | 'conflict' | 'failed' }>
  specialist: { playbook_id: string; playbook_version: string; risk_flags: string[]; required_checks: string[] }
  presentation: { brand_profile_id: string | null; design_profile_id: string; layout_genre: string; logo_policy: string; signature_policy: string; watermark_policy: string }
  approval: { status: 'draft' | 'ready' | 'approved' | 'superseded'; approved_by: string | null; approved_at: string | null; unresolved_items_accepted: string[] }
  provenance: SpecificationProvenance
}
export interface MissionTurnResult { conversation_id?: string; specification_version?: number; acknowledgement: string; question: string | null; question_reason: string | null; readiness: number; readiness_state: ReadinessState; changed_facts: MissionFact[]; specification: DeliverableSpecification }
export interface ConversationTurn { id: string; role: 'user' | 'apollo'; content: string; reason?: string | null; createdAt: string }
