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
  invoice: {
    invoice_number:'ONS-2026-0914-01', statement_type:'invoice', invoice_date:'2026-09-14', due_date:'2026-10-14', payment_terms_label:'Net 30', currency:'USD', bill_to_name:'Northstar Fabrication LLC', bill_to_address:'100 Industrial Way\nWorcester, MA 01608', supplier_tax_id:'04-1234567',
    line_items:'Field condition assessment | 1 | 8500.00 | taxable\nControlled QC report package | 1 | 4250.00 | taxable\nExecutive decision briefing | 2 | 1250.00 | non-taxable', tax_rate_percent:6.25, late_payment_interest_percent_monthly:1.5, payment_methods:'ACH to account ending 4421\nCompany check payable to On Spot Solutions LLC', billing_contact_name:'Avery Morgan', billing_contact_email:'billing@on-spot.solutions', customer_po_number:'NSF-PO-1047', contract_reference:'Northstar Modernization Services Agreement dated 2026-08-01', remit_to_name:'On Spot Solutions LLC', remit_to_address:'Boston, Massachusetts', tax_jurisdiction:'Massachusetts',
  },
  'change-order': {
    change_order_number:'CO-003', original_contract_title:'Northstar Facility Modernization Agreement', original_contract_date:'2026-06-01', original_contract_sum_dollars:425000, prior_change_orders_total_dollars:18500, original_completion_date:'2026-11-30', prior_change_orders_days_total:5, client_name:'Northstar Fabrication LLC', change_date:'2026-09-14', cause_of_change:'unforeseen-condition',
    cause_description:'During controlled demolition, the field team documented concealed deteriorated feeder conduit not shown in the issued drawings. Replacement is required before the approved equipment can be energized safely.', scope_changes:'Additions | Remove and replace 180 linear feet of deteriorated feeder conduit; provide new supports and conductors; perform insulation-resistance testing\nRemovals | None\nModifications | Resequence the east electrical-room turnover after corrective work', cost_breakdown:'Electrical labor | 96 hours | 145.00 | 13920.00\nConduit and fittings | 1 lot | 7850.00 | 7850.00\nConductors | 1 lot | 6200.00 | 6200.00\nTesting subcontractor | 1 lot | 2400.00 | 2400.00\nEquipment | 1 lot | 1150.00 | 1150.00\nOverhead and profit | 1 lot | 4728.00 | 4728.00', cost_impact_dollars:36248, schedule_impact_days:7, effective_date:'2026-09-15',
  },
  sow: {
    project_name:'Northstar Facility Intelligence Pilot', client_name:'Northstar Fabrication LLC', provider_name:'On Spot Solutions LLC', project_description:'A controlled 90-day pilot that captures field evidence, engineers decision-ready deliverables, and preserves approval and revision lineage.', scope_of_work:'Configure controlled mission intake\nEstablish evidence and brand custody\nExecute six representative field and executive missions\nMeasure administrative cycle time\nDeliver pilot closeout and scale recommendation', project_timeline:'September 21 through December 20, 2026', total_budget:'Fixed fee of $97,750',
    key_milestones:'Kickoff | September 21, 2026\nControlled intake operational | October 5, 2026\nMidpoint review | November 5, 2026\nFinal readout | December 20, 2026', acceptance_criteria:'Mission intake | Required evidence and approval state retained | Demonstrated in live test\nControlled delivery | PDF stored in designated Drive folder | Artifact manifest verified\nRevision lineage | Prior version remains immutable | Reflight record verified', team_structure:'Jordan Lee | Executive sponsor\nAvery Morgan | Client program manager\nMorgan Reed | Provider program manager', out_of_scope:'Production payment activation\nEnterprise-wide rollout\nMigration of unrelated products or data', assumptions:'Client supplies authorized users and source records\nDrive access remains active\nPilot metrics are targets until measured', payment_schedule:'25% at kickoff\n50% at midpoint acceptance\n25% at final readout', client_pm_name:'Avery Morgan', provider_pm_name:'Morgan Reed', governing_state:'Massachusetts',
  },
  'daily-construction-report': {
    project_name:'Northstar East Plant Electrical Upgrade', job_number:'NSF-ELEC-2026-014', site_location:'100 Industrial Way, Worcester, MA', report_date:'2026-09-14', prepared_by:'Alex Morgan, Quality Control Lead', day_summary:'Feeder conduit replacement advanced on plan; east electrical room remained de-energized under approved lockout.',
    weather_conditions:'Clear | 68–77 F | No precipitation | Wind 6–10 mph | No impact to interior work', crew_roster:'Jordan Lee | Foreperson | 10 | OSHA 30\nMorgan Reed | Electrician | 10 | MA Journeyman 55231\nAvery Chen | Electrician | 9.5 | MA Journeyman 55902\nSam Ortiz | Apprentice | 9.5 | OSHA 10', work_performed:'07:00 | Pre-task plan and lockout verification completed\n07:25 | Removed 60 linear feet of deteriorated feeder conduit\n09:10 | Installed new supports at maximum 8-foot spacing\n11:15 | Installed 60 linear feet of new 2-inch rigid metal conduit\n14:20 | Pulled conductors and labeled both ends\n15:40 | Performed continuity test; all conductors passed\n16:15 | Area cleaned and secured; lockout retained', work_status:'East electrical room feeder A | 60 LF | Complete | Continuity test passed\nEast corridor feeder B | 0 LF | Not started | Scheduled 2026-09-15\nEquipment energization | 0% | On hold | Awaiting insulation-resistance test', equipment_on_site:'Conduit threader | Greenlee 535 | Operational\nMaterial lift | JLG 1930ES | Operational\nDigital multimeter | Fluke 87V | Calibration current', materials_consumed:'2-inch rigid metal conduit | 60 LF\n2-inch couplings | 12 EA\nConduit supports | 9 EA\nCopper conductors | 240 LF', issues_delays:'No schedule delay. Concealed wall access required one additional support location; resolved within planned work window.', safety_observations:'Lockout/tagout verified at start and close\nNo recordable incidents or near misses\nHousekeeping accepted at final walk', follow_up:'Perform insulation-resistance test before energization\nBegin east corridor feeder B replacement on 2026-09-15',
  },
  'meeting-minutes': {
    meeting_type:'project', meeting_title:'Northstar Pilot Authorization Meeting', meeting_date:'2026-09-14', meeting_time_start:'14:00', meeting_time_end:'15:10', meeting_location:'Northstar Executive Conference Room and Microsoft Teams', quorum_present:'yes', agenda_items:'Pilot objective and decision criteria\nScope and 90-day implementation plan\nBudget authorization\nGovernance and next actions',
    discussion_summary:'Pilot objective and decision criteria | Committee confirmed evidence provenance, cycle-time reduction, and accountable review as decision criteria.\nScope and 90-day implementation plan | Three-phase plan accepted subject to sponsor designation.\nBudget authorization | Committee reviewed $97,750 total authorization including $12,750 contingency.\nGovernance and next actions | Weekly program review and final capital-committee readout required.', action_items:'ACT-01 | Jordan Lee | Name executive sponsor | 2026-09-18 | Open\nACT-02 | Avery Morgan | Confirm pilot user roster | 2026-09-18 | Open\nACT-03 | Morgan Reed | Issue kickoff package | 2026-09-21 | Open', meeting_adjourned_at:'15:10', secretary_name:'Taylor Brooks', attendees_in_person:'Jordan Lee — Committee Chair\nAvery Morgan — Operations Director\nTaylor Brooks — Corporate Secretary', attendees_remote:'Morgan Reed — Program Director', motions_and_votes:'M-01 | Authorize the 90-day pilot and $97,750 expenditure | Moved by Avery Morgan | Seconded by Jordan Lee | 3 in favor, 0 opposed, 0 abstained | Adopted', next_meeting_date:'2026-10-05',
  },
  'tax-estimate': {
    taxpayer_name:'Jordan Lee — planning scenario', tax_year:2026, filing_status:'single', state_residence:'Massachusetts', deduction_method:'standard', prepared_by:'On Spot Solutions LLC — internal planning', prepared_date:'2026-09-14', gross_income_w2:185000, gross_income_1099_self_employment:42000, gross_income_investment:8500, gross_income_other:0, withholdings_ytd:39200, estimated_payments_ytd:12500, prior_year_tax_liability:47250, tax_credits:'Energy efficiency planning credit | 2500 | Eligibility not verified; exclude from payable estimate until confirmed',
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
  const template: Template = { slug, label:summary.label, description:summary.description, category:summary.industry_slug, supports_images:true, has_signature_block:['sow','proposal','contract-package','engagement-letter','nda','change-order'].includes(slug), has_toc:shouldRenderToc(slug), layout:chooseLayoutForSlug(slug), fields:[], sections:module.sections.map(section => ({ id:section.key, title:section.label })), generation_notes:'' }
  const pdf = await buildPdf({ template, brand, inputs:FIXTURES[slug], contentHtml:generated.contentHtml, documentId:`PILOT-${slug.toUpperCase()}-20260914`, preparedDate:'September 14, 2026', palette })
  await writeFile(path.join(outputDir, `${slug}.pdf`), pdf)
  await writeFile(path.join(outputDir, `${slug}.html`), generated.contentHtml)
  report.push({ slug, model:process.env.APOLLO_MODEL_STRUCTURED_FILL || 'claude-sonnet-5', elapsed_ms:Date.now()-started, pdf_bytes:pdf.length, quality:generated.quality, warnings:generated.warnings })
  console.log(`${slug}: PASS (${pdf.length} bytes, score ${generated.quality.score})`)
}
await writeFile(path.join(outputDir, 'report.json'), JSON.stringify({ generated_at:new Date().toISOString(), output_dir:outputDir, results:report }, null, 2))
console.log(`Pilot golden matrix complete: ${outputDir}`)
