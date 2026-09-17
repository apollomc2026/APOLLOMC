import { createMissionFact, mergeMissionFacts, specificationProvenance, type DeliverableSpecification, type MissionFact } from './contracts'
import { executionGaps } from './work-order'
import { canonicalizeSpecificationIdentity } from './identity'

export function mergeEvidenceIntoSpecification(input: {
  prior: DeliverableSpecification
  evidence: { id: string; name: string; status: 'verified' | 'failed'; facts: MissionFact[] }
}) {
  const { prior, evidence } = input
  const mergedFacts = mergeMissionFacts(prior.content.facts.map(fact => createMissionFact(fact)), evidence.facts)
  const priorProvenance = prior.provenance ?? specificationProvenance(prior.content.facts, new Date().toISOString())
  let specification: DeliverableSpecification = {
    ...prior,
    sources: [...prior.sources.filter(source => source.id !== evidence.id), { id:evidence.id, name:evidence.name, status:evidence.status }],
    content: { ...prior.content, facts:mergedFacts },
    approval: { status:'draft', approved_by:null, approved_at:null, unresolved_items_accepted:[] },
    provenance: specificationProvenance(mergedFacts, priorProvenance.created_at, priorProvenance.model_versions),
  }
  let gaps = executionGaps(specification)
  const blockingConflict = gaps.some(gap => /Conflicting values/.test(gap.reason))
  const effectiveStatus = blockingConflict ? 'conflict' as const : evidence.status
  if(blockingConflict){
    specification={...specification,sources:specification.sources.map(source=>source.id===evidence.id?{...source,status:effectiveStatus}:source)}
    gaps=executionGaps(specification)
  }
  const readiness = gaps.length ? Math.min(70, Math.max(50, mergedFacts.length * 8)) : 82
  specification.approval.status = readiness >= 75 ? 'ready' : 'draft'
  return { specification:canonicalizeSpecificationIdentity(specification), readiness, effectiveStatus }
}
