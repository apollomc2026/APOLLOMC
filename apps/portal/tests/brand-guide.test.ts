import { describe, expect, it } from 'vitest'
import { normalizeBrandProfile } from '@/lib/mission-control/brand-guide'

describe('brand guide interpretation', () => {
  it('normalizes supported identity attributes and rejects malformed colors', () => {
    expect(normalizeBrandProfile({
      primary_color:'#aabbcc', secondary_color:'orange', accent_color:'#123456',
      heading_font:'  Neue Haas  ', body_font:'Inter', voice:'  Direct and factual.  ', ignored:'value',
    })).toEqual({
      primary_color:'#AABBCC', secondary_color:null, accent_color:'#123456',
      heading_font:'Neue Haas', body_font:'Inter', voice:'Direct and factual.',
    })
  })
})
