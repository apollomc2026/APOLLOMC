import { createMissionFact, mergeMissionFacts, specificationProvenance, type DeliverableSpecification, type MissionFact } from './contracts'
import { executionGaps } from './work-order'

export function mergeEvidenceIntoSpecification(input: {
  prior: DeliverableSpecification
  evidence: { id: string; name: string; status: 'verified' | 'failed'; facts: MissionFact[] }
}) {
  const { prior, evidence } = input
  const mergedFacts = mergeMissionFacts(prior.content.facts.map(fact => createMissionFact(fact)), evidence.facts)
  const hasConflict = mergedFacts.some(fact => fact.verification_state === 'conflict' && evidence.facts.some(extracted => extracted.key === fact.key))
  const effectiveStatus = hasConflict ? 'conflict' as const : evidence.status
  const priorProvenance = prior.provenance ?? specificationProvenance(prior.content.facts, new Date().toISOString())
  const specification: DeliverableSpecification = {
    ...prior,
    sources: [...prior.sources.filter(source => source.id !== evidence.id), { id:evidence.id, name:evidence.name, status:effectiveStatus }],
    content: { ...prior.content, facts:mergedFacts },
    approval: { status:'draft', approved_by:null, approved_at:null, unresolved_items_accepted:[] },
    provenance: specificationProvenance(mergedFacts, priorProvenance.created_at, priorProvenance.model_versions),
  }
  const gaps = executionGaps(specification)
  const readiness = gaps.length ? Math.min(70, Math.max(50, mergedFacts.length * 8)) : 82
  specification.approval.status = readiness >= 75 ? 'ready' : 'draft'
  return { specification, readiness, effectiveStatus }
}
