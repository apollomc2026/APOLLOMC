import { mkdir, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import path from 'node:path'
import type { Template } from '../lib/apollo/templates'

type RuntimeModule = Record<string, unknown> & { default?:Record<string, unknown> }
function exportsOf(module:RuntimeModule):Record<string, unknown> { return module.default ?? module }
const pdfExports = exportsOf(await import('../lib/apollo/pdf') as RuntimeModule)
const brandExports = exportsOf(await import('../lib/apollo/brands') as RuntimeModule)
const packageExports = exportsOf(await import('../lib/apollo/packages-loader') as RuntimeModule)
const orchestrateExports = exportsOf(await import('../lib/apollo/orchestrate') as RuntimeModule)
const { buildPdf } = pdfExports as typeof import('../lib/apollo/pdf')
const { loadBrand, loadBrandPalette } = brandExports as typeof import('../lib/apollo/brands')
const { findDeliverable, getModule, getSchema, getStylesForIndustry } = packageExports as typeof import('../lib/apollo/packages-loader')
const { orchestrate, chooseLayoutForSlug, shouldRenderToc } = orchestrateExports as typeof import('../lib/apollo/orchestrate')

const FIXTURES: Record<string, Record<string, unknown>> = {
  'contract-package': {
    contract_type:'Professional Services Agreement', party_a_name:'Northstar Fabrication LLC', party_a_role:'Client', party_b_name:'On Spot Solutions LLC', party_b_role:'Consultant',
    scope_of_agreement:'Field inspection, corrective-work documentation, and final quality-control reporting for the Northstar facility modernization program.', governing_law:'Commonwealth of Massachusetts', term_length:'September 14, 2026 through December 31, 2026',
  },
  proposal: {
    prospect_organization:'Northstar Fabrication LLC', proposal_date:'2026-09-14', problem_statement:'Northstar requires an evidence-grounded field assessment and documented remediation plan before capital approval.', our_understanding:'The client needs a decision-ready package linking observed conditions, corrective actions, ownership, schedule, and acceptance criteria.',
    win_themes:'Evidence before assertion\nField-to-desk speed\nAccountable closeout\nDecision-ready clarity', proposed_methodology:'1. Mobilize and validate evidence\n2. Assess conditions and document findings\n3. Engineer prioritized corrective actions\n4. Verify completion and deliver the controlled record', risks_and_mitigations:'Site access constraints | Confirm access window before mobilization\nIncomplete records | Flag unsupported claims and maintain an open-decision register\nSchedule compression | Sequence critical-path observations first', assumptions:'Client provides safe site access\nClient designates one decision authority\nExisting records are supplied before field mobilization', pricing_model:'fixed-fee', pricing_detail:'Fixed fee: $18,750\n25% at authorization\n50% after field assessment\n25% at accepted final delivery', validity_period_days:30, next_steps_call_to_action:'Approve the proposed scope and authorize preparation of the engagement letter by October 14, 2026.',
  },
  'federal-proposal': {
    solicitation_number:'FAKE-APOLLO-2026-001', solicitation_title:'Facilities Condition Intelligence Support', issuing_agency:'United States Department of Example — Pilot Evaluation Office', offeror_name:'On Spot Solutions LLC', naics_code:'541611', set_aside:'Small Business',
    technical_approach_summary:'Use controlled evidence intake, field verification, traceable findings, and acceptance-tested reporting. Every claim maps to a supplied source or is labeled as an assumption.', management_approach_summary:'A program manager owns delivery, a field lead controls collection, and an independent reviewer verifies compliance before release.', past_performance_summary:'Northstar pilot | Multi-site field assessment and closeout documentation | Delivered traceable reports and an executive action register on schedule.',
  },
  'cash-flow-budget-package': {
    entity_name:'Northstar Fabrication LLC', forecast_period:'October 2026 through March 2027',
    base_case_lines:'Oct 2026 | 250000 | 185000 | 172000 | 13000 | 263000\nNov 2026 | 263000 | 192000 | 181000 | 11000 | 274000\nDec 2026 | 274000 | 215000 | 207000 | 8000 | 282000\nJan 2027 | 282000 | 178000 | 196000 | -18000 | 264000\nFeb 2027 | 264000 | 204000 | 190000 | 14000 | 278000\nMar 2027 | 278000 | 221000 | 205000 | 16000 | 294000',
    scenario_summary:'Best | 338000 | 250000 | 1285000 | 1197000\nBase | 294000 | 250000 | 1195000 | 1151000\nWorst | 205000 | 198000 | 1080000 | 1125000', key_assumptions:'Opening cash is $250,000\nCustomer receipts follow the approved aging schedule\nPayroll occurs biweekly\nNo unapproved capital purchases are included\nScenario values are management-provided planning estimates',
  },
  'pitch-deck': {
    company_name:'Northstar Fabrication LLC', tagline:'Verified operations intelligence at decision speed', problem:'Industrial operators lose time and margin when field evidence arrives fragmented, late, and without accountable ownership.', solution:'A controlled mission workflow converts source evidence into reviewable operational decisions while preserving provenance and approval state.', business_model:'Enterprise platform license plus usage-priced controlled deliverables and implementation support.', traction:'3 internal pilot missions completed\n11 controlled draft deliveries\n5 verified regeneration flights\n37 supported professional deliverable types', team:'Jordan Lee | Chief Executive Officer | Industrial operations\nMorgan Reed | Chief Product Officer | Enterprise workflow systems\nAvery Chen | Field Operations Lead | Quality and compliance', fundraising_ask:'Seeking $2.5 million to complete enterprise security, pilot deployment, and specialist expansion over 18 months.',
  },
  'exec-presentation': {
    organization_name:'Northstar Fabrication LLC', presentation_topic:'Pilot operating review and authorization decision', audience:'Executive leadership and capital committee', key_message:'Authorize the controlled field-intelligence pilot because it shortens decision latency while preserving evidence provenance and accountable review.',
    context_and_background:'Field observations currently reach leadership through fragmented email, spreadsheets, and manually assembled reports. The proposed pilot introduces one controlled intake, review, and delivery chain.', desired_action:'Approve a 90-day internal pilot, designate an executive sponsor, and authorize the listed implementation workstreams.', presenter_name:'Jordan Lee, Program Director', presentation_date:'2026-09-14', time_limit:'20 minutes plus 10 minutes for questions',
    financial_data:'Pilot implementation: $85,000\nContingency: $12,750\nTotal authorization requested: $97,750\nTarget administrative time reduction: 35%', competitive_context:'The current alternative is a mix of general-purpose AI tools and manual document production without durable specification, evidence, approval, or regeneration state.', sensitive_topics:'All performance figures are pilot targets, not guaranteed outcomes. No unsupported savings claim may be presented as verified.',
  },
  'final-qc-report': {
    project_name:'Northstar Facility Modernization', job_number:'NSF-2026-014', project_period:'September 10–14, 2026', report_date:'2026-09-14', inspector:'Alex Morgan, Quality Control Lead', reference_documents:'Approved drawing A-101 Rev 3\nManufacturer installation instruction MI-44\nProject specification section 26 05 00', completion_statement:'The inspected installation is complete with the exceptions recorded in this report.', acceptance_criteria:'Circuit identification | Labels match approved panel schedule | Pass\nFastener torque | Manufacturer value of 35 in-lb | Pass\nConduit support spacing | Maximum 10 ft interval | Pass', test_results:'QC-01 | Main electrical room | Label schedule match | Pass\nQC-02 | Main electrical room | 35 in-lb measured torque | Pass\nQC-03 | East corridor | 8 ft maximum support interval | Pass',
  },
  'capability-statement': {
    company_name:'On Spot Solutions LLC', core_competencies:'Field condition assessments\nEvidence-controlled operational reporting\nQuality-control and closeout documentation\nProgram implementation support', naics_codes:'541611 — Administrative Management and General Management Consulting Services\n541330 — Engineering Services', differentiators:'Field-to-desk controlled reporting\nSource-level provenance\nImmutable review and revision lineage\nDecision-ready executive communication', past_performance_highlights:'Northstar Fabrication | Facility modernization QC | Controlled final report and corrective-action register\nRiverfront Center | Site assessment | Evidence-grounded proposal and implementation roadmap',
  },
}

const requested = process.argv.slice(2)
const slugs = requested.length ? requested : Object.keys(FIXTURES)
const unknown = slugs.filter(slug => !FIXTURES[slug])
if (unknown.length) throw new Error(`Unknown pilot fixtures: ${unknown.join(', ')}`)
if (!process.env.ANTHROPIC_API_KEY) throw new Error('ANTHROPIC_API_KEY is required')

const brand = await loadBrand('on-spot-solutions')
const palette = await loadBrandPalette('on-spot-solutions')
if (!brand) throw new Error('On Spot Solutions pilot brand is unavailable')
const outputDir = path.join(tmpdir(), 'apollo-pilot-golden')
await mkdir(outputDir, { recursive:true })

const report: Array<Record<string, unknown>> = []
for (const slug of slugs) {
  const summary = findDeliverable(slug)
  const module = getModule(slug)
  const schema = getSchema(slug) as Record<string, unknown> | null
  if (!summary || !module || !schema) throw new Error(`Catalog resources unavailable for ${slug}`)
  const style = getStylesForIndustry(summary.industry_slug)[0]
  if (!style) throw new Error(`No style available for ${slug}`)
  const started = Date.now()
  const generated = await orchestrate({ slug, deliverableLabel:summary.label, industryLabel:summary.industry_label, module, schema, style, brand, fields:FIXTURES[slug], uploads:[] })
  const template: Template = { slug, label:summary.label, description:summary.description, category:summary.industry_slug, supports_images:true, has_signature_block:['sow','proposal','contract-package','engagement-letter','nda'].includes(slug), has_toc:shouldRenderToc(slug), layout:chooseLayoutForSlug(slug), fields:[], sections:module.sections.map(section => ({ id:section.key, title:section.label })), generation_notes:'' }
  const pdf = await buildPdf({ template, brand, inputs:FIXTURES[slug], contentHtml:generated.contentHtml, documentId:`PILOT-${slug.toUpperCase()}-20260914`, preparedDate:'September 14, 2026', palette })
  await writeFile(path.join(outputDir, `${slug}.pdf`), pdf)
  await writeFile(path.join(outputDir, `${slug}.html`), generated.contentHtml)
  report.push({ slug, model:process.env.APOLLO_MODEL_STRUCTURED_FILL || 'claude-sonnet-5', elapsed_ms:Date.now()-started, pdf_bytes:pdf.length, quality:generated.quality, warnings:generated.warnings })
  console.log(`${slug}: PASS (${pdf.length} bytes, score ${generated.quality.score})`)
}
await writeFile(path.join(outputDir, 'report.json'), JSON.stringify({ generated_at:new Date().toISOString(), output_dir:outputDir, results:report }, null, 2))
console.log(`Pilot golden matrix complete: ${outputDir}`)
