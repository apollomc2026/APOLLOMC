import { findDeliverable } from '@/lib/apollo/packages-loader'
import type { DeliverableSpecification } from './contracts'

function titleCaseSlug(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

/**
 * A Deliverable Specification owns mission identity. Database projections,
 * telemetry, execution, and filenames may copy this value, but must never
 * infer a competing identity from an earlier conversation turn or job.
 */
export function canonicalDeliverableTitle(specification: DeliverableSpecification) {
  const slug = specification.artifact.recommended_type.trim()
  return findDeliverable(slug)?.label?.trim() || titleCaseSlug(slug) || 'APOLLO Deliverable'
}

export function canonicalizeSpecificationIdentity(specification: DeliverableSpecification): DeliverableSpecification {
  const title = canonicalDeliverableTitle(specification)
  if (specification.mission.title === title) return specification
  return { ...specification, mission: { ...specification.mission, title } }
}
