import Anthropic from '@anthropic-ai/sdk'
import { createHash } from 'node:crypto'
import { modelFor } from '@/lib/ai/models'
import { createMissionFact, type DeliverableSpecification, type MissionFact } from './contracts'
import { PRICING_APPROVAL_DIRECTIVE } from './commercial-directives'

export interface PricingBenchmark {
  item:string
  unit:string
  currency:string
  low:number
  typical:number
  high:number
  rationale:string
  source_urls:string[]
}

export interface QuotePricingResearch {
  as_of_date:string
  geography:string
  benchmarks:PricingBenchmark[]
  limitations:string[]
}

function finitePositive(value:unknown):number|null {
  const parsed=typeof value==='number'?value:Number(value)
  return Number.isFinite(parsed)&&parsed>=0?parsed:null
}

export function verifiedPricingResearch(input:unknown,allowedUrls:Set<string>,now=new Date()):QuotePricingResearch|null {
  if(!input||typeof input!=='object')return null
  const row=input as Record<string,unknown>
  const geography=typeof row.geography==='string'?row.geography.trim():''
  const benchmarks=Array.isArray(row.benchmarks)?row.benchmarks.flatMap(value=>{
    if(!value||typeof value!=='object')return []
    const candidate=value as Record<string,unknown>
    const item=typeof candidate.item==='string'?candidate.item.trim():''
    const unit=typeof candidate.unit==='string'?candidate.unit.trim():''
    const currency=typeof candidate.currency==='string'?candidate.currency.trim().toUpperCase():''
    const rationale=typeof candidate.rationale==='string'?candidate.rationale.trim():''
    const low=finitePositive(candidate.low);const typical=finitePositive(candidate.typical);const high=finitePositive(candidate.high)
    const source_urls=Array.isArray(candidate.source_urls)?[...new Set(candidate.source_urls.filter((url):url is string=>typeof url==='string'&&allowedUrls.has(url)))]:[]
    if(!item||!unit||!currency||!rationale||low===null||typical===null||high===null||low>typical||typical>high||!source_urls.length)return []
    return [{item,unit,currency,low,typical,high,rationale,source_urls}]
  }):[]
  if(!benchmarks.length)return null
  const limitations=Array.isArray(row.limitations)?row.limitations.filter((value):value is string=>typeof value==='string'&&Boolean(value.trim())).map(value=>value.trim()).slice(0,8):[]
  return {as_of_date:now.toISOString().slice(0,10),geography:geography||'Not geographically constrained',benchmarks:benchmarks.slice(0,20),limitations}
}

export function pricingResearchFact(research:QuotePricingResearch):MissionFact {
  const sources=[...new Set(research.benchmarks.flatMap(item=>item.source_urls))]
  const value=[
    `Research date: ${research.as_of_date}`,
    `Geography: ${research.geography}`,
    ...research.benchmarks.map(item=>`${item.item} | ${item.currency} ${item.low.toFixed(2)}–${item.high.toFixed(2)} per ${item.unit} | typical ${item.currency} ${item.typical.toFixed(2)} | ${item.rationale} | ${item.source_urls.join(', ')}`),
    ...(research.limitations.length?[`Limitations: ${research.limitations.join('; ')}`]:[]),
  ].join('\n')
  return createMissionFact({key:'market_pricing_basis',label:'Market pricing basis',value,source:'research',source_reference:sources[0]??null,source_references:sources,confidence:.9,sensitivity:'internal'})
}

export function requestsMarketPricingResearch(text:string):boolean {
  return /\b(?:fair[- ]market|market[- ]informed|market research|competitive pricing|pricing research|benchmark (?:the )?(?:price|pricing|rates?)|research (?:the )?(?:price|pricing|rates?))\b/i.test(text)
}

export function quotePricingApprovalToken(specification:DeliverableSpecification):string|null {
  if(specification.artifact.recommended_type!=='quote')return null
  const values=new Map(specification.content.facts.filter(fact=>fact.verification_state!=='conflict').map(fact=>[fact.key,fact.value.trim()]))
  const research=values.get('market_pricing_basis');const lineItems=values.get('line_items')
  if(!research||!lineItems)return null
  return createHash('sha256').update(`${research}\n---APPROVED-LINE-ITEMS---\n${lineItems}`).digest('hex')
}

export function hasCurrentQuotePricingApproval(specification:DeliverableSpecification):boolean {
  const token=quotePricingApprovalToken(specification)
  return Boolean(token&&specification.content.facts.some(fact=>fact.key==='market_pricing_approval'&&fact.source==='user'&&fact.value===token))
}

export function applyQuotePricingApproval(specification:DeliverableSpecification,text:string):DeliverableSpecification {
  if(text.trim()!==PRICING_APPROVAL_DIRECTIVE)return specification
  const token=quotePricingApprovalToken(specification)
  if(!token)return specification
  const approval=createMissionFact({key:'market_pricing_approval',label:'Market-informed pricing approval',value:token,source:'user',confidence:1,sensitivity:'confidential'})
  return {...specification,content:{...specification.content,facts:[...specification.content.facts.filter(fact=>fact.key!=='market_pricing_approval'),approval]}}
}

export async function researchQuotePricing(input:{scopeSummary:string;lineItems?:string;geography?:string}):Promise<QuotePricingResearch|null> {
  if(!process.env.ANTHROPIC_API_KEY)return null
  const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY})
  const response=await client.messages.create({
    model:modelFor('extraction'),max_tokens:5000,
    system:'Research current public market pricing for the supplied quote scope. Search the web first. Return benchmark ranges only when supported by returned search results. Distinguish labor, equipment, material, mobilization, and specialty-service units where the public evidence permits. Never present a benchmark as an approved customer price, never invent a margin, and never change supplied quantities or amounts. Prefer current primary sources, public rate sheets, government schedules, manufacturer/distributor pricing, and reputable published cost data. State limitations when geography, exact specification, freight, taxes, prevailing wage, union conditions, access, or site conditions can materially change price.',
    tools:[
      {type:'web_search_20250305',name:'web_search',max_uses:8},
      {name:'emit_pricing_research',description:'Return only pricing benchmarks supported by URLs from this search.',input_schema:{type:'object',properties:{geography:{type:'string'},benchmarks:{type:'array',maxItems:20,items:{type:'object',properties:{item:{type:'string'},unit:{type:'string'},currency:{type:'string'},low:{type:'number'},typical:{type:'number'},high:{type:'number'},rationale:{type:'string'},source_urls:{type:'array',items:{type:'string'}}},required:['item','unit','currency','low','typical','high','rationale','source_urls']}},limitations:{type:'array',items:{type:'string'}}},required:['geography','benchmarks','limitations']}},
    ],
    messages:[{role:'user',content:`QUOTE SCOPE:\n${input.scopeSummary}\n\nSUPPLIED LINE ITEMS (preserve; research only):\n${input.lineItems||'No line items supplied'}\n\nGEOGRAPHY:\n${input.geography||'Determine only from the supplied scope; otherwise state not geographically constrained.'}`}],
  })
  const allowedUrls=new Set<string>()
  for(const block of response.content)if(block.type==='web_search_tool_result'&&Array.isArray(block.content))for(const result of block.content)if(result.type==='web_search_result')allowedUrls.add(result.url)
  const emitted=response.content.find(block=>block.type==='tool_use'&&block.name==='emit_pricing_research')
  return emitted?.type==='tool_use'?verifiedPricingResearch(emitted.input,allowedUrls):null
}
