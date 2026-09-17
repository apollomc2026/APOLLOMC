import type { DocumentWorkOrder } from './contracts'

export interface CommercialVerificationReport {
  required:boolean
  verified_rows:number
  verified_figures:number
}

const ROW_FIELDS:Record<string,string[]> = {
  quote:['line_items'],
  invoice:['line_items'],
  'change-order':['cost_breakdown'],
}

const PROPOSAL_ANCHORS=['prospect_organization','pricing_model']

function searchable(value:unknown,containsHtml=false) {
  let text=String(value??'')
  if(containsHtml) text=text.replace(/<[^>]+>/g,' ')
  return text.replace(/&lt;/gi,'<').replace(/&gt;/gi,'>').replace(/&(?:amp|nbsp|#160);/gi,' ').replace(/[^a-z0-9]+/gi,' ').trim().toLowerCase()
}

function numberValue(value:unknown):number {
  const numeric=Number(String(value??'').replace(/[,$\s]/g,''))
  if(!Number.isFinite(numeric)) throw new Error(`Commercial verification failed: invalid approved figure '${String(value)}'`)
  return numeric
}

function outputNumbers(contentHtml:string):number[] {
  const plain=contentHtml.replace(/<[^>]+>/g,' ').replace(/&minus;|&#8722;/gi,'-')
  return (plain.match(/\(?-?\$?\d[\d,]*(?:\.\d+)?\)?/g)??[]).map(raw=>{
    const negative=raw.includes('(')||raw.includes('-')
    const parsed=Number(raw.replace(/[,$()\s-]/g,''))
    return negative?-Math.abs(parsed):parsed
  }).filter(Number.isFinite)
}

function approvedNumbers(value:unknown):number[]{
  return outputNumbers(String(value??''))
}

function containsFigure(figures:number[],expected:number){return figures.some(value=>Math.abs(value-expected)<0.005)}

function approvedRows(raw:string):string[]{
  const lines=raw.split(/\r?\n/).map(value=>value.trim()).filter(Boolean)
  if(lines.length>1)return lines
  // Evidence extraction commonly serializes quote rows as one semicolon-delimited
  // value. Preserve each commercial item as its own verification boundary.
  const segments=raw.split(/\s*;\s*/).map(value=>value.trim()).filter(Boolean)
  return segments.length>1?segments:lines
}

/** Commercial documents may format approved data, but may not rewrite it. */
export function verifyCommercialDocument(order:DocumentWorkOrder,contentHtml:string):CommercialVerificationReport {
  const rowFields=ROW_FIELDS[order.deliverable_type]
  const isProposal=order.deliverable_type==='proposal'
  if(!rowFields&&!isProposal)return{required:false,verified_rows:0,verified_figures:0}
  const documentText=searchable(contentHtml,true)
  let verifiedRows=0
  for(const key of rowFields??[]){
    const raw=order.fields[key]
    if(typeof raw!=='string'||!raw.trim())throw new Error(`Commercial verification failed: approved ${key} was empty`)
    for(const [index,line] of approvedRows(raw).entries()){
      const approved=searchable(line.replace(/\|/g,' '))
      if(!approved||!documentText.includes(approved))throw new Error(`Commercial verification failed: ${key} row ${index+1} was changed or omitted`)
      verifiedRows+=1
    }
  }
  let verifiedFigures=0
  if(isProposal){
    const missing=PROPOSAL_ANCHORS.filter(key=>{
      const approved=searchable(order.fields[key])
      return !approved||!documentText.includes(approved)
    })
    if(missing.length)throw new Error(`Commercial verification failed: approved ${missing.join(', ')} ${missing.length===1?'was':'were'} changed or omitted`)
    verifiedRows+=PROPOSAL_ANCHORS.length
    const pricingDetail=order.fields.pricing_detail
    if(typeof pricingDetail!=='string'||!pricingDetail.trim())throw new Error('Commercial verification failed: approved pricing_detail was empty')
    for(const [index,line] of approvedRows(pricingDetail).entries()){
      const approved=searchable(line.replace(/[|:]/g,' '))
      if(!approved||!documentText.includes(approved))throw new Error(`Commercial verification failed: pricing_detail row ${index+1} was changed, reassigned, or omitted`)
      verifiedRows+=1
    }
    const figures=outputNumbers(contentHtml)
    for(const value of approvedNumbers(pricingDetail)){
      if(!containsFigure(figures,value))throw new Error(`Commercial verification failed: proposal pricing figure ${value} was changed or omitted`)
      verifiedFigures+=1
    }
  }
  if(order.deliverable_type==='change-order'){
    const figures=outputNumbers(contentHtml)
    const original=numberValue(order.fields.original_contract_sum_dollars)
    const prior=numberValue(order.fields.prior_change_orders_total_dollars)
    const impact=numberValue(order.fields.cost_impact_dollars)
    const expected=[original,prior,impact,original+prior,original+prior+impact]
    for(const value of expected){
      if(!containsFigure(figures,value))throw new Error(`Commercial verification failed: contract-sum figure ${value} was changed or omitted`)
      verifiedFigures+=1
    }
  }
  return{required:true,verified_rows:verifiedRows,verified_figures:verifiedFigures}
}
