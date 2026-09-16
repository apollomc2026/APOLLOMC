import Anthropic from '@anthropic-ai/sdk'
import { modelFor } from '@/lib/ai/models'
import { isUsableSiteAddress } from './field-quality'

export interface SiteAddressCandidate { address:string; source_url:string; source_title:string }

export function verifiedAddressCandidates(input:unknown,allowedUrls:Set<string>):SiteAddressCandidate[] {
  if(!input || typeof input!=='object' || !('candidates' in input) || !Array.isArray(input.candidates))return []
  return input.candidates.flatMap(candidate=>{
    if(!candidate || typeof candidate!=='object')return []
    const address='address' in candidate?String(candidate.address).trim():''
    const source_url='source_url' in candidate?String(candidate.source_url).trim():''
    const source_title='source_title' in candidate?String(candidate.source_title).trim():''
    return isUsableSiteAddress(address)&&allowedUrls.has(source_url)&&source_title?[{address,source_url,source_title}]:[]
  }).slice(0,3)
}

export async function searchPublicSiteAddresses(siteName:string):Promise<SiteAddressCandidate[]> {
  if(!process.env.ANTHROPIC_API_KEY)return []
  const client=new Anthropic({apiKey:process.env.ANTHROPIC_API_KEY})
  const response=await client.messages.create({
    model:modelFor('extraction'),max_tokens:1800,
    system:'Find the public street address for the named service site. Search first. Return only complete postal-address candidates directly supported by a search result. Do not infer an address from the site name, city, or model memory. Prefer the organization’s official site or an authoritative government/business listing. If locations are ambiguous, return up to three candidates.',
    tools:[
      {type:'web_search_20250305',name:'web_search',max_uses:3},
      {name:'emit_address_candidates',description:'Return sourced public postal-address candidates.',input_schema:{type:'object',properties:{candidates:{type:'array',maxItems:3,items:{type:'object',properties:{address:{type:'string'},source_url:{type:'string'},source_title:{type:'string'}},required:['address','source_url','source_title']}}},required:['candidates']}},
    ],
    messages:[{role:'user',content:`Service site name: ${siteName}`}],
  })
  const allowedUrls=new Set<string>()
  for(const block of response.content)if(block.type==='web_search_tool_result'&&Array.isArray(block.content))for(const result of block.content)if(result.type==='web_search_result')allowedUrls.add(result.url)
  const emitted=response.content.find(block=>block.type==='tool_use'&&block.name==='emit_address_candidates')
  return emitted?.type==='tool_use'?verifiedAddressCandidates(emitted.input,allowedUrls):[]
}
