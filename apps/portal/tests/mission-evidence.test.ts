import { describe, expect, it } from 'vitest'
import { evidenceMagicMatches, evidenceZipTooLarge, extractEvidence } from '../lib/mission-control/evidence'

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
})
