import { describe, expect, it } from 'vitest'
import { interpretMission } from '../lib/mission-control/interpreter'
import { createMissionFact } from '../lib/mission-control/contracts'
import { preserveHistoricalEvidenceFacts } from '../lib/mission-control/repository'

describe('evidence recalibration continuity',()=>{
  it('preserves verified facts missed by a later pass over the same secured source',()=>{
    const historical=interpretMission('Create a quote for US Foods.').specification
    historical.content.facts.push(
      createMissionFact({key:'customer_name',label:'Customer name',value:'US Foods',source:'evidence',source_reference:'source-1',confidence:1}),
      createMissionFact({key:'quote_date',label:'Quote date',value:'September 16, 2026',source:'evidence',source_reference:'source-1',confidence:1}),
    )
    const current=[createMissionFact({key:'scope_summary',label:'Scope summary',value:'Repair access controls',source:'evidence',source_reference:'source-1',confidence:1})]
    expect(preserveHistoricalEvidenceFacts({current,history:[historical],securedSourceIds:new Set(['source-1'])})).toEqual(expect.arrayContaining([
      expect.objectContaining({key:'scope_summary'}),expect.objectContaining({key:'customer_name',value:'US Foods'}),expect.objectContaining({key:'quote_date'}),
    ]))
  })

  it('does not revive facts from evidence that is no longer secured',()=>{
    const historical=interpretMission('Create a quote for US Foods.').specification
    historical.content.facts.push(createMissionFact({key:'customer_name',label:'Customer name',value:'US Foods',source:'evidence',source_reference:'removed-source',confidence:1}))
    expect(preserveHistoricalEvidenceFacts({current:[],history:[historical],securedSourceIds:new Set(['source-1'])})).not.toEqual(expect.arrayContaining([expect.objectContaining({key:'customer_name'})]))
  })
})
