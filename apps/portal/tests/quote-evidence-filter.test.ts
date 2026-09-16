import { describe,expect,it } from 'vitest'
import { createMissionFact } from '../lib/mission-control/contracts'
import { filterSemanticallyUnsupportedEvidenceFacts } from '../lib/mission-control/evidence'

describe('quote evidence filtering',()=>{
  it('rejects scope prose misclassified as line items and unknown placeholders',()=>{
    const source='11111111-1111-4111-8111-111111111111'
    const facts=[
      createMissionFact({key:'line_items',label:'Line items',value:'Coordinate lane access; prepare three pads; perform final inspection.',source:'evidence',source_reference:source,confidence:1}),
      createMissionFact({key:'line_items',label:'Line items',value:'Field labor: 4 days × $2,000/day = $8,000; materials = $1,200',source:'evidence',source_reference:source,confidence:1}),
      createMissionFact({key:'payment_terms',label:'Payment terms',value:'<UNKNOWN>',source:'evidence',source_reference:source,confidence:1}),
    ]
    const filtered=filterSemanticallyUnsupportedEvidenceFacts(facts,[{id:source,text:'source'}],'quote')
    expect(filtered).toHaveLength(1)
    expect(filtered[0]).toEqual(expect.objectContaining({key:'line_items',value:expect.stringContaining('$8,000')}))
  })
})
