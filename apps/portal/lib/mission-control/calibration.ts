import { assumptionLedger, reconcileEquivalentMissionConflicts, specificationProvenance, type DeliverableSpecification, type ReadinessState } from './contracts'
import { executionGaps } from './work-order'

export type MissionGap={key:string;label:string;reason:string}

export function questionForMissionGap(gap:MissionGap,specification:DeliverableSpecification):string {
  if(gap.key==='market_pricing_approval')return 'Review APOLLO’s cited market pricing basis and approve the current quote line items, or revise the commercial figures.'
  if(gap.key==='market_pricing_basis')return 'APOLLO has not completed the requested cited market-pricing research. Retry calibration; launch will remain safely blocked until verified benchmarks are available.'
  if(gap.key==='site_address'){
    const site=specification.content.facts.find(fact=>fact.key==='site_name'&&fact.verification_state!=='conflict')?.value.trim()
    return site?`Confirm the complete street address for ${site}. APOLLO did not find a usable postal address in the secured evidence.`:'Confirm the complete street address for this service location.'
  }
  return `What should APOLLO use for ${gap.label.toLowerCase()}?`
}

export function calibrateMissionSpecification(specification:DeliverableSpecification,priorReadiness=0){
  const facts=reconcileEquivalentMissionConflicts(specification.content.facts)
  if(facts.some((fact,index)=>fact!==specification.content.facts[index]))specification={...specification,content:{...specification.content,facts},provenance:specificationProvenance(facts,specification.provenance.created_at,specification.provenance.model_versions)}
  const gaps=executionGaps(specification) as MissionGap[]
  const openQuestions=gaps.map(gap=>questionForMissionGap(gap,specification))
  const readiness=gaps.length?Math.min(70,Math.max(50,82-gaps.length*8)):Math.max(82,priorReadiness)
  const readinessState:ReadinessState=readiness>=75?'ready':readiness>=50?'calibrating':'discovery'
  return {
    gaps,
    readiness,
    readinessState,
    question:openQuestions[0]??null,
    questionReason:gaps[0]?.reason??null,
    specification:{
      ...specification,
      content:{...specification.content,open_questions:openQuestions,assumptions:assumptionLedger(specification.content.facts,gaps)},
      approval:{status:gaps.length?'draft':'ready',approved_by:null,approved_at:null,unresolved_items_accepted:[]},
    } satisfies DeliverableSpecification,
  }
}
