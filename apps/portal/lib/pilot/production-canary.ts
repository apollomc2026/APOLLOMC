import {createHash} from 'node:crypto'
import {loadBrand,loadBrandPalette} from '@/lib/apollo/brands'
import {buildPdf} from '@/lib/apollo/pdf'
import {chooseLayoutForSlug,orchestrate,shouldRenderToc} from '@/lib/apollo/orchestrate'
import {findDeliverable,getModule,getSchema,getStylesForIndustry} from '@/lib/apollo/packages-loader'
import type {Template} from '@/lib/apollo/templates'
import {applyClaudeInterpretation,applyExpertRecommendationMode} from '@/lib/mission-control/ai-interpreter'
import {calibrateMissionSpecification} from '@/lib/mission-control/calibration'
import {mergeMissionFacts,specificationProvenance} from '@/lib/mission-control/contracts'
import {extractEvidenceFactsWithTraceFromArtifact,extractionTracesCoverSources} from '@/lib/mission-control/evidence'
import {interpretMission} from '@/lib/mission-control/interpreter'
import {applyQuotePricingApproval,pricingResearchFact,researchQuotePricing} from '@/lib/mission-control/quote-pricing-research'
import {PRICING_APPROVAL_DIRECTIVE} from '@/lib/mission-control/commercial-directives'
import {compileApprovedSpecification,executionFields,materializeSpecificationDefaults} from '@/lib/mission-control/work-order'
import {verifyDocumentContent} from '@/lib/executor/document-verification'
import {verifyRenderedPdf} from '@/lib/executor/pdf-integrity'

export const PILOT_CANARY_SLUGS=['fsr','final-qc-report','quote','proposal','cash-flow-budget-package','contract-intelligence-review'] as const
export type PilotCanarySlug=(typeof PILOT_CANARY_SLUGS)[number]

const FIXTURES:Record<PilotCanarySlug,Record<string,unknown>>={
  fsr:{work_order_number:'WO-CANARY-1047',site_name:'Northstar East Plant',site_address:'100 Industrial Way, Worcester, MA 01608',customer_contact_onsite:'Avery Morgan, Facilities Director',visit_date:'2026-09-17',arrival_time:'07:00',departure_time:'16:30',technician_name:'Morgan Reed',equipment_asset_id:'EER-FDR-A-001',equipment_make_model:'Square D Power-Zone 4 switchgear',issue_reported:'Intermittent insulation-resistance alarm.',work_performed:'07:00 | Verified work permit and lockout\n09:10 | Performed insulation-resistance testing\n13:15 | Corrected loose terminal and repeated tests\n16:15 | Secured equipment',warranty_status:'not applicable',time_on_site_hours:9.5,follow_up_required:'none'},
  'final-qc-report':{project_name:'Northstar Facility Modernization',job_number:'NSF-2026-014',project_period:'September 10–17, 2026',report_date:'2026-09-17',inspector:'Alex Morgan, Quality Control Lead',reference_documents:'Approved drawing A-101 Rev 3\nManufacturer instruction MI-44',completion_statement:'The inspected installation is complete with the exceptions recorded in this report.',acceptance_criteria:'Circuit identification | Labels match approved schedule | Pass\nFastener torque | 35 in-lb | Pass',test_results:'QC-01 | Main electrical room | Label schedule match | Pass\nQC-02 | Main electrical room | 35 in-lb measured torque | Pass'},
  quote:{customer_name:'Northstar Fabrication LLC',customer_address:'100 Industrial Way, Worcester, MA 01608',quote_date:'2026-09-17',valid_until:'2026-10-17',scope_summary:'Provide a controlled electrical-room assessment, corrective-work verification, and executive closeout package.',line_items:'Field condition assessment | 1 | visit | $8,500.00 | $8,500.00\nCorrective-work verification | 2 | visit | $3,250.00 | $6,500.00\nExecutive closeout package | 1 | package | $4,750.00 | $4,750.00\nProject Total | $19,750.00',payment_terms:'50% deposit / 50% on completion'},
  proposal:{prospect_organization:'Northstar Fabrication LLC',proposal_date:'2026-09-17',problem_statement:'Northstar requires an evidence-grounded field assessment before capital approval.',our_understanding:'The client needs a decision-ready package linking observed conditions, corrective actions, ownership, schedule, and acceptance.',win_themes:'Evidence before assertion\nField-to-desk speed\nAccountable closeout',proposed_methodology:'Mobilize and validate evidence\nAssess conditions\nEngineer corrective actions\nVerify completion',risks_and_mitigations:'Site access | Confirm window\nIncomplete records | Flag unsupported claims',assumptions:'Client provides safe access and one decision authority',pricing_model:'fixed-fee',pricing_detail:'Fixed fee | $18,750.00',validity_period_days:30,next_steps_call_to_action:'Approve the scope and authorize kickoff.'},
  'cash-flow-budget-package':{entity_name:'Northstar Fabrication LLC',forecast_period:'October 2026 through March 2027',base_case_lines:'Oct 2026 | 250000 | 185000 | 172000 | 13000 | 263000\nNov 2026 | 263000 | 192000 | 181000 | 11000 | 274000\nDec 2026 | 274000 | 215000 | 207000 | 8000 | 282000',scenario_summary:'Best | 320000 | 250000 | 620000 | 550000\nBase | 282000 | 250000 | 592000 | 560000\nWorst | 218000 | 205000 | 520000 | 552000',key_assumptions:'Opening cash is $250,000\nReceipts follow the approved aging schedule\nNo unapproved capital purchases are included'},
  'contract-intelligence-review':{review_perspective:'Customer purchasing a vehicle service contract',review_goal:'Understand current coverage, preserve every claim right, identify exclusions and deadlines, and obtain the full value of the protection.',as_of_date:'2026-09-17',jurisdiction:'Massachusetts'},
}

const CONTRACT_EVIDENCE=`NORTHSTAR VEHICLE SERVICE CONTRACT — SYNTHETIC CANARY
Contract NS-VSC-2026-0917. Effective September 17, 2026. Expires September 17, 2031 or at 75,000 miles, whichever occurs first. Contract price: $2,495.
Covered components include engine, transmission, steering, suspension, electrical, air conditioning, fuel, and cooling systems. Deductible is $100 per visit and $0 at the selling dealer.
Towing is limited to $150. Rental reimbursement is $50 per day for five days. Receipts must be submitted within 30 days.
Before repair or teardown, call 800-555-0147 and obtain authorization. Emergency repairs are limited to $500 without prior authorization and require notice within five business days.
Routine maintenance, pre-existing conditions, collision, misuse, and repairs covered by another warranty are excluded.
Cancellation within 30 days with no paid claim receives a full refund. Later cancellation is pro rata less paid claims and a $50 fee. Transfer requires a form, proof of sale, maintenance records, and $75 within 30 days of sale. Massachusetts law governs.`

function evidenceText(slug:PilotCanarySlug,fields:Record<string,unknown>){
  const module=getModule(slug)
  if(!module)throw new Error('pilot module unavailable')
  const labeled=[...module.required_fields,...module.optional_fields].flatMap(field=>fields[field.key]===undefined?[]:[`${field.label}:\n${String(fields[field.key])}`])
  return [`CONTROLLED SYNTHETIC PILOT EVIDENCE — ${slug}`,...labeled,slug==='contract-intelligence-review'?CONTRACT_EVIDENCE:''].join('\n\n')
}

export async function runProductionPilotCanary(slug:PilotCanarySlug){
  const summary=findDeliverable(slug);const module=getModule(slug);const schema=getSchema(slug)
  if(!summary||!module||!schema)throw new Error('pilot catalog resources unavailable')
  const style=getStylesForIndustry(summary.industry_slug)[0];const brand=await loadBrand('on-spot-solutions');const palette=await loadBrandPalette('on-spot-solutions')
  if(!style||!brand)throw new Error('pilot presentation resources unavailable')
  const sourceId=`pilot-canary-${slug}`;const text=evidenceText(slug,FIXTURES[slug]);const bytes=Buffer.from(text)
  const extracted=await extractEvidenceFactsWithTraceFromArtifact({id:sourceId,name:`${slug}-canary.txt`,mime:'text/plain',bytes,text},slug)
  if(!extractionTracesCoverSources([sourceId],[extracted.trace]))throw new Error('multipass extraction trace incomplete')
  const turn=interpretMission(`Create a ${summary.label}${slug==='quote'?' using current fair-market research':''}.`)
  turn.specification.artifact.recommended_type=slug;turn.specification.aura.operator_involvement=0;turn.specification.sources=[{id:sourceId,name:`${slug}-canary.txt`,status:'verified'}]
  turn.specification.content.facts=mergeMissionFacts(turn.specification.content.facts,extracted.facts)
  turn.specification.provenance=specificationProvenance(turn.specification.content.facts,turn.specification.provenance.created_at,turn.specification.provenance.model_versions)
  let specification=applyClaudeInterpretation(turn,applyExpertRecommendationMode({},'Use your expert recommendations for every noncritical decision.',turn.specification,true)).specification
  specification=materializeSpecificationDefaults(specification,new Date('2026-09-17T12:00:00Z'))
  if(slug==='quote'){
    const research=await researchQuotePricing({scopeSummary:String(FIXTURES.quote.scope_summary),lineItems:String(FIXTURES.quote.line_items),geography:String(FIXTURES.quote.customer_address)})
    if(!research)throw new Error('cited market research returned no verified benchmark')
    specification.content.facts=[...specification.content.facts.filter(fact=>fact.key!=='market_pricing_basis'),pricingResearchFact(research)]
    specification=applyQuotePricingApproval(specification,PRICING_APPROVAL_DIRECTIVE)
  }
  const calibrated=calibrateMissionSpecification(specification,82)
  if(calibrated.gaps.length)throw new Error(`calibration left gaps: ${calibrated.gaps.map(gap=>gap.key).join(', ')}`)
  specification={...calibrated.specification,approval:{status:'approved',approved_by:'pilot-canary',approved_at:'2026-09-17T12:05:00Z',unresolved_items_accepted:[]}}
  const specificationHash=createHash('sha256').update(JSON.stringify(specification)).digest('hex')
  const compiled=compileApprovedSpecification({specification,specificationId:'11111111-1111-4111-8111-111111111111',specificationHash,conversationId:'22222222-2222-4222-8222-222222222222',requestedBy:'33333333-3333-4333-8333-333333333333',driveFolderId:'pilot-canary',now:new Date('2026-09-17T12:06:00Z')})
  if(!compiled.ok)throw new Error(`work-order compilation failed: ${compiled.missing.map(gap=>gap.key).join(', ')}`)
  const uploads=[{id:sourceId,upload_kind:'reference_doc',original_filename:`${slug}-canary.txt`,content_type:'text/plain',size_bytes:bytes.length,caption:'Synthetic pilot evidence',extracted_text:text,bytes:null}]
  const fields=executionFields(specification,new Date('2026-09-17T12:06:00Z'))
  for(const [key,expected] of Object.entries(FIXTURES[slug])){
    const actual=fields[key]
    const normalize=(value:unknown)=>String(value??'').replace(/\r\n/g,'\n').trim()
    if(normalize(actual)!==normalize(expected))throw new Error(`controlled evidence custody mismatch for ${key}: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}`)
  }
  const generated=await orchestrate({slug,deliverableLabel:summary.label,industryLabel:summary.industry_label,module,schema:schema as Record<string,unknown>,style,brand,fields,uploads})
  verifyDocumentContent(compiled.order,generated.contentHtml,{phase:'generated'})
  const template:Template={slug,label:summary.label,description:summary.description,category:summary.industry_slug,supports_images:true,has_signature_block:slug==='proposal',has_toc:shouldRenderToc(slug),layout:chooseLayoutForSlug(slug),fields:[],sections:module.sections.map(section=>({id:section.key,title:section.label})),generation_notes:''}
  const pdf=await buildPdf({template,brand,inputs:fields,contentHtml:generated.contentHtml,documentId:`CANARY-${slug.toUpperCase()}`,preparedDate:'September 17, 2026',palette,sourceNames:[`${slug}-canary.txt`]})
  const integrity=await verifyRenderedPdf(pdf)
  let verification:ReturnType<typeof verifyDocumentContent>
  try{verification=verifyDocumentContent(compiled.order,integrity.text,{phase:'rendered'})}
  catch(error){
    const sample=integrity.text.replace(/\s+/g,' ').trim().slice(0,1200)
    throw new Error(`${error instanceof Error?error.message:String(error)}; controlled canary PDF sample: ${sample}`)
  }
  return {slug,passed:true,source_sha256:createHash('sha256').update(bytes).digest('hex'),specification_hash:specificationHash,extracted_facts:extracted.facts.length,trace:extracted.trace,open_questions:specification.content.open_questions.length,quality:generated.quality,verification,pdf:{sha256:createHash('sha256').update(pdf).digest('hex'),...integrity.integrity}}
}
