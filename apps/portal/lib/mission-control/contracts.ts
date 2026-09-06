export type ReadinessState = 'discovery' | 'calibrating' | 'ready'

export interface MissionFact { key: string; label: string; value: string; source: 'user' | 'evidence' | 'inferred' | 'default'; confidence: number }
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
  approval: { status: 'draft' | 'ready' | 'approved' | 'superseded'; approved_by: string | null; approved_at: string | null }
}
export interface MissionTurnResult { conversation_id?: string; specification_version?: number; acknowledgement: string; question: string | null; question_reason: string | null; readiness: number; readiness_state: ReadinessState; changed_facts: MissionFact[]; specification: DeliverableSpecification }
export interface ConversationTurn { id: string; role: 'user' | 'apollo'; content: string; reason?: string | null; createdAt: string }
