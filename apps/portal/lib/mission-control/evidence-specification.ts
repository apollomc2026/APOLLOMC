import { createMissionFact, mergeMissionFacts, specificationProvenance, type DeliverableSpecification, type MissionFact } from './contracts'
import { canonicalizeSpecificationIdentity } from './identity'
import { calibrateMissionSpecification } from './calibration'

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
  let calibration=calibrateMissionSpecification(specification)
  const blockingConflict = calibration.gaps.some(gap => /Conflicting values/.test(gap.reason))
  const effectiveStatus = blockingConflict ? 'conflict' as const : evidence.status
  if(blockingConflict){
    specification={...specification,sources:specification.sources.map(source=>source.id===evidence.id?{...source,status:effectiveStatus}:source)}
    calibration=calibrateMissionSpecification(specification)
  }
  return { specification:canonicalizeSpecificationIdentity(calibration.specification), readiness:calibration.readiness, effectiveStatus }
}
