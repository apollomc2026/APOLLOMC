const conversationalReferencePatterns = [
  /\ball of the above\b/i,
  /\b(original|uploaded|attached) (?:doc|document|file|record)\b/i,
  /\bplease (?:scan|check|use|review|see)\b/i,
  /\bremaining questions?\b/i,
  /\bno tagging required\b/i,
  /\banswered in\b/i,
]

export function isUsableExternalReference(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const candidate = value.trim()
  if (!candidate || candidate.length > 64 || conversationalReferencePatterns.some(pattern => pattern.test(candidate))) return false
  return /\d/.test(candidate) && /^[a-z0-9][a-z0-9 ./#_-]*$/i.test(candidate)
}

export function cleanDisplayAddress(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/^address\s+is\s+/i, '').replace(/\s+/g, ' ').replace(/\b([a-z]{2})$/i, (_, state:string) => state.toUpperCase())
}

export function isUsableSiteAddress(value: unknown): value is string {
  if(typeof value!=='string')return false
  const candidate=cleanDisplayAddress(value)
  if(!candidate || /\b(?:unknown|not provided|not available|not found|find it|same as site|use site name|to be confirmed|tbd|n\/?a)\b/i.test(candidate))return false
  if(/^P\.?O\.? Box\s+\d+/i.test(candidate))return true
  return /\b\d{1,6}[A-Za-z-]*\s+[^,\n]{2,}(?:Street|St\.?|Road|Rd\.?|Avenue|Ave\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Way|Court|Ct\.?|Parkway|Pkwy\.?|Highway|Hwy\.?|Route|Terrace|Ter\.?|Place|Pl\.?|Circle|Cir\.?|Broadway)\b/i.test(candidate)
}

export function cleanExecutionFields(fields: Record<string, unknown>): Record<string, unknown> {
  const cleaned = { ...fields }
  if ('site_address' in cleaned) {
    cleaned.site_address = cleanDisplayAddress(cleaned.site_address)
    if(!isUsableSiteAddress(cleaned.site_address))delete cleaned.site_address
  }
  if ('work_order_number' in cleaned && !isUsableExternalReference(cleaned.work_order_number)) delete cleaned.work_order_number
  if ('equipment_asset_id' in cleaned && !isUsableExternalReference(cleaned.equipment_asset_id)) delete cleaned.equipment_asset_id
  return cleaned
}
