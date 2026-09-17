import {describe,expect,it} from 'vitest'
import {pricingResearchFact,requestsMarketPricingResearch,verifiedPricingResearch} from '../lib/mission-control/quote-pricing-research'

describe('quote market-pricing research custody',()=>{
  it('accepts only ordered benchmark ranges backed by returned search URLs',()=>{
    const allowed=new Set(['https://official.example/rates'])
    const result=verifiedPricingResearch({geography:'New Hampshire',benchmarks:[
      {item:'Field labor',unit:'hour',currency:'usd',low:110,typical:135,high:165,rationale:'Published regional schedule',source_urls:['https://official.example/rates']},
      {item:'Invented mobilization',unit:'trip',currency:'USD',low:100,typical:200,high:300,rationale:'Unsupported',source_urls:['https://invented.example']},
      {item:'Backwards range',unit:'day',currency:'USD',low:900,typical:700,high:800,rationale:'Invalid',source_urls:['https://official.example/rates']},
    ],limitations:['Freight excluded']},allowed,new Date('2026-09-16T12:00:00Z'))
    expect(result).toEqual({as_of_date:'2026-09-16',geography:'New Hampshire',benchmarks:[expect.objectContaining({item:'Field labor',currency:'USD',typical:135})],limitations:['Freight excluded']})
    const fact=pricingResearchFact(result!)
    expect(fact).toEqual(expect.objectContaining({key:'market_pricing_basis',source:'research',capture_method:'system_lookup',verification_state:'verified',source_reference:'https://official.example/rates'}))
    expect(fact.value).toContain('USD 110.00–165.00 per hour')
  })

  it('requires an explicit market-research request',()=>{
    expect(requestsMarketPricingResearch('Research fair-market pricing and keep this quote profitable.')).toBe(true)
    expect(requestsMarketPricingResearch('Create a quote from the attached estimate.')).toBe(false)
  })
})
