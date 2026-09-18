import { createServiceClient } from '@/lib/supabase/server'
import type { DeliverableSpecification } from '@/lib/mission-control/contracts'
import type { DocumentWorkOrder } from './contracts'

type SpecificationAuthorityRow = {
  id: string
  conversation_id: string
  content_hash: string
  status: string
  approved_by: string | null
  specification: DeliverableSpecification
}

export function isApolloBrandId(value: string): boolean {
  return value === 'apollo' || value === 'on-spot-solutions' || /^kit:[0-9a-f-]{36}$/i.test(value)
}

export function assertSpecificationAuthority(order: DocumentWorkOrder, row: SpecificationAuthorityRow): void {
  if (!order.trace) throw new Error('work order trace is required')
  const expectedBrand = row.specification.presentation.brand_profile_id ?? 'apollo'
  if (row.id !== order.trace.specification_id || order.project_id !== row.id) throw new Error('work order is not bound to its approved specification')
  if (row.status !== 'approved' || row.specification.approval.status !== 'approved') throw new Error('work order specification is not approved')
  if (row.content_hash !== order.trace.specification_hash) throw new Error('work order specification hash is stale or invalid')
  if (row.conversation_id !== order.conversation_id) throw new Error('work order conversation does not match its specification')
  if (row.approved_by !== order.requested_by) throw new Error('work order requester did not approve this specification')
  if (row.specification.artifact.recommended_type !== order.deliverable_type) throw new Error('work order deliverable type differs from the approved specification')
  if (!isApolloBrandId(order.brand_id) || order.brand_id !== expectedBrand) throw new Error('work order brand differs from the approved APOLLO brand')
}

export async function requireApprovedSpecificationAuthority(order: DocumentWorkOrder): Promise<void> {
  if (!order.trace) throw new Error('work order trace is required')
  const db = await createServiceClient()
  const result = await db.from('apollo_specification_versions')
    .select('id,conversation_id,content_hash,status,approved_by,specification')
    .eq('id', order.trace.specification_id)
    .maybeSingle()
  if (result.error) throw new Error(`approved specification lookup failed: ${result.error.message}`)
  if (!result.data) throw new Error('approved specification was not found')
  assertSpecificationAuthority(order, result.data as SpecificationAuthorityRow)
}

export function isApolloControlledOrder(value: unknown): value is DocumentWorkOrder {
  if (!value || typeof value !== 'object') return false
  const order = value as Partial<DocumentWorkOrder>
  return Boolean(order.trace && order.project_id === order.trace.specification_id && isApolloBrandId(String(order.brand_id ?? '')))
}
