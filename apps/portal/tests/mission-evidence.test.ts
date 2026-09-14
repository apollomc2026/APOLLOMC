import { describe, expect, it } from 'vitest'
import { batchEvidenceSources, evidenceFactsFromToolInput, evidenceMagicMatches, evidenceZipTooLarge, extractEvidence, normalizeEvidenceMime } from '../lib/mission-control/evidence'
import { mergeMissionFacts } from '../lib/mission-control/contracts'

describe('mission evidence custody', () => {
  it('rejects a declared PDF whose bytes are not a PDF', () => {
    expect(evidenceMagicMatches(Buffer.from('not a pdf'), 'application/pdf')).toBe(false)
    expect(evidenceMagicMatches(Buffer.from('%PDF-1.7'), 'application/pdf')).toBe(true)
  })

  it('extracts bounded UTF-8 text for source-grounded execution', async () => {
    const result = await extractEvidence(Buffer.from('Confirmed scope and dates'), 'text/plain')
    expect(result).toEqual({ text: 'Confirmed scope and dates', safeForDirectRetrieval: true })
  })

  it('does not classify ordinary non-zip evidence as a decompression bomb', () => {
    expect(evidenceZipTooLarge(Buffer.from('ordinary evidence'))).toBe(false)
  })

  it('normalizes valid evidence extensions when the browser sends a generic MIME type', () => {
    expect(normalizeEvidenceMime('forecast.xlsx', 'application/octet-stream')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    expect(normalizeEvidenceMime('brief.pdf', '')).toBe('application/pdf')
    expect(normalizeEvidenceMime('brief.pdf', 'image/png')).toBeNull()
    expect(normalizeEvidenceMime('diagnostic.inspect.ndjson', 'application/octet-stream')).toBeNull()
  })

  it('preserves contradictory values from separate evidence sources for reconciliation', () => {
    const extracted = evidenceFactsFromToolInput({ contract_value:[
      { value:'$18,500', source_id:'proposal' },
      { value:'$19,250', source_id:'work-order' },
    ] }, [{ key:'contract_value', label:'Contract value' }], ['proposal','work-order'])
    expect(extracted).toHaveLength(2)
    const [fact] = mergeMissionFacts([], extracted, new Date('2026-09-14T12:00:00.000Z'))
    expect(fact.verification_state).toBe('conflict')
    expect(fact.conflicts).toEqual(expect.arrayContaining([
      expect.objectContaining({ value:'$18,500', source_reference:'proposal' }),
      expect.objectContaining({ value:'$19,250', source_reference:'work-order' }),
    ]))
  })

  it('rejects hallucinated fields and invalid source citations from extraction output', () => {
    const extracted = evidenceFactsFromToolInput({ contract_value:[{ value:'$18,500', source_id:'invented-source' }], invented_field:[{ value:'yes', source_id:'proposal' }] }, [{ key:'contract_value', label:'Contract value' }], ['proposal'])
    expect(extracted).toEqual([])
  })

  it('batches every uploaded source without silently dropping later evidence', () => {
    const sources = Array.from({ length:16 }, (_, index) => `source-${index + 1}`)
    const batches = batchEvidenceSources(sources, 4)
    expect(batches).toHaveLength(4)
    expect(batches.flat()).toEqual(sources)
    expect(batchEvidenceSources(sources, 3).flat()).toEqual(sources)
  })
})
