// Catalog-path render harness (orchestrate -> buildPdf). The MVP harness
// (render-pdf-v2.mts) exercises generate.ts; this one exercises the unified
// catalog path where the WS1 dedup bug lived (renderContentHtml).
//
//   npx tsx --tsconfig apps/portal/tsconfig.json --env-file=apps/portal/.env.local \
//     scripts/render-catalog.mts <slug> <outname>
//
// Writes <outname>.pdf + .full.html + .content.html to _smoke/ and prints a
// dedup analysis: module sections vs rendered section-openers vs TOC rows.

import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const PORTAL_ROOT = path.join(REPO_ROOT, 'apps', 'portal')
const SMOKE = path.join(REPO_ROOT, '_smoke')
if (!process.env.ANTHROPIC_API_KEY) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1) }
process.chdir(PORTAL_ROOT)
const imp = (rel: string) => import(pathToFileURL(path.join(PORTAL_ROOT, rel)).href)

const slug = process.argv[2] || 'business-plan'
const outName = process.argv[3] || `catalog-${slug}`

const loader = await imp('lib/apollo/packages-loader.ts')
const { orchestrate, chooseLayoutForSlug, shouldRenderToc } = await imp('lib/apollo/orchestrate.ts')
const { loadBrand, loadBrandPalette, applyPaletteOverride } = await imp('lib/apollo/brands.ts')
const { resolvePreset } = await imp('lib/apollo/font-presets.ts')
const { resolvePlacement } = await imp('lib/apollo/logo-placement.ts')
const { buildPdf, buildFullHtml } = await imp('lib/apollo/pdf.ts')

const summary = loader.findDeliverable(slug)
if (!summary) { console.error(`unknown deliverable ${slug}`); process.exit(1) }
const moduleData = loader.getModule(slug)
const schema = loader.getSchema(slug)
const styles = loader.getStylesForIndustry(summary.industry_slug)
const style = (styles && styles[0]) || loader.listAllStyles()[0]
const brand = await loadBrand('apollo')

// Generic seed values per required field so orchestrate has real inputs.
function seed(field: any): unknown {
  if (Array.isArray(field.options) && field.options.length) {
    const o = field.options[0]
    return o.value ?? o.key ?? o.id ?? String(o)
  }
  if (field.type === 'number') return 42
  const label = field.label || field.key
  return `Sample ${label} for the WS1 dedup gate render (Nashua Elm demonstration value).`
}
// Realistic reference-derived seeds for field-service modules so the gate
// render is faithful and comparable to the OnSpot reference PDFs.
const SEEDS: Record<string, Record<string, unknown>> = {
  'daily-construction-report': {
    project_name: 'Nashua Elm/High Street Parking Garages — Inductive Loop Installation',
    job_number: 'WT Job #3154 / 3155',
    site_location: '19 Elm Street + 15 High Street, Nashua, NH',
    report_date: '2026-05-13',
    prepared_by: 'Jonathan Sargent — Principal, On Spot Solutions LLC; OSHA-30; MA Low-Voltage Licensed (Class C)',
    day_summary: 'Day 3 of 3 — Project Completion / all 19 loops installed & QC verified PASS',
    weather_conditions:
      'Conditions: Fair AM, drizzle from ~10:30 AM | High Temp: within seasonal range | Precipitation: light drizzle late AM | Wind: calm. Impact on work: favorable through morning; light drizzle commenced ~10:30 AM; rain response protocol executed — expedited final sealant on the High Street Exit Safety Loop, then deployed a drop cloth on cones to protect the cure.',
    crew_roster:
      'Jonathan Sargent | Principal / Competent Person / Saw Operator / QC Inspector | 6.5 | OSHA-30, MA LV\nTomas Galeano | Technician | 6.5 | OJT',
    work_performed:
      '6:00–7:00 AM | Pre-shift Tool Box Talk conducted; staged equipment verified; weather and rain-response protocol reviewed.\n7:00–10:30 AM | Plaza 4 markout per Thornton Tomasetti S27/S28, wet-saw cut, lay-in, and BD Loop Sealant on all 4 loops; concurrent QC testing on Plaza 2 and Plaza 3 (8 cured loops) — all PASS.\n10:30 AM | Light drizzle commenced; rain response protocol executed; drop cloth deployed on cones over the High Street Exit Safety Loop.\n11:00 AM–12:00 PM | Plaza 4 QC on 4 newly sealed loops — all PASS; final demobilization; broom-clean final site walk both garages.\n12:00 PM | Project completion — 19/19 loops installed, sealed, QC PASS; crew departed.',
    work_status:
      'Plaza 1 — Elm Garage, Garden St S | 7 | QC PASS — Complete | Verified Day 2; open to traffic\nPlaza 2 — High St Garage, Factory St | 4 | QC PASS — Complete | Verified Day 3 AM\nPlaza 3 — Elm Garage, Garden St N | 4 | QC PASS — Complete | Verified Day 3 AM\nPlaza 4 — High St Garage, High St | 4 | QC PASS — Complete | Verified Day 3 late AM; Exit Safety Loop drop-cloth covered',
    equipment_on_site:
      'Hilti DSH 900-X 16" gas saw\nHilti DSH-FSC floor saw cart\nHilti DSH-P water pump\nHilti SPX diamond blade\nChampion 4500W generator\nShop vacuum, digital ohmmeter, megohmmeter\nDrop cloth and traffic cones\nFull crew PPE',
    materials_consumed:
      'BD Loop Sealant: 5 bottles (Plaza 4)\n14 AWG THHN: ~350 ft (Plaza 4, 3 turns/loop)\nCaution tape, marking paint\nFuel: gasoline (saw 50:1; generator straight gas)',
    subcontractor_activity:
      'Michael Pollizi (Flowbird Project Manager) on site\nCameron McGrady (Whiting-Turner Site Superintendent) on site\nCade Snow (Whiting-Turner) on site\nJeff (T&T Electric) on site',
    issues_delays:
      'Weather: light drizzle ~10:30 AM; rain response protocol executed; sealant integrity preserved; no schedule impact — completed 12:00 PM on schedule.\nNo incidents, near-misses, or recordables across the 3-day project.',
    safety_observations:
      'Day 3 Tool Box Talk completed pre-shift at 6:00 AM\nRain response protocol executed cleanly\nOSHA-compliant team-lift technique for demobilization\nWet-cut water pump verified continuously (Table 1)\nAll PPE worn and verified throughout',
    follow_up:
      'Courtesy follow-up inspection scheduled Thursday morning, May 14, 2026 — visual verification of the High Street Exit Safety Loop sealant integrity following the drizzle event.',
  },
  'financial-statements-package': {
    entity_name: 'Northline Logistics LLC',
    fiscal_year_end: 'December 31, 2025',
    prior_year_end: 'December 31, 2024',
    basis_of_accounting: 'us-gaap',
    opinion_type: 'unqualified',
    practitioner_firm: 'Harding & Mealey CPAs, P.C. — Worcester, Massachusetts',
    report_date: 'March 14, 2026',
    ownership_notice_body:
      "The financial statements, figures, professional judgments, and the report opinion presented herein are supplied and owned by the licensed practitioner. Apollo typesets the practitioner-provided data into a finished financial statements package; it does not audit, opine on, compute, or independently verify any figure. The statements are presented on the basis of accounting indicated in the report details above.",
    opinion_letter_body:
      "To the Members of Northline Logistics LLC\n\nOpinion\nWe have audited the accompanying financial statements of Northline Logistics LLC, which comprise the balance sheets as of December 31, 2025 and 2024, and the related statements of operations, changes in members' equity, and cash flows for the years then ended, and the related notes to the financial statements. In our opinion, the accompanying financial statements present fairly, in all material respects, the financial position of Northline Logistics LLC as of December 31, 2025 and 2024, and the results of its operations and its cash flows for the years then ended in accordance with accounting principles generally accepted in the United States of America.\n\nBasis for Opinion\nWe conducted our audits in accordance with auditing standards generally accepted in the United States of America (GAAS). Our responsibilities under those standards are further described in the Auditor's Responsibilities for the Audit of the Financial Statements section of our report. We are required to be independent of Northline Logistics LLC and to meet our other ethical responsibilities in accordance with the relevant ethical requirements relating to our audits. We believe that the audit evidence we have obtained is sufficient and appropriate to provide a basis for our audit opinion.\n\nResponsibilities of Management for the Financial Statements\nManagement is responsible for the preparation and fair presentation of these financial statements in accordance with accounting principles generally accepted in the United States of America, and for the design, implementation, and maintenance of internal control relevant to the preparation and fair presentation of financial statements that are free from material misstatement, whether due to fraud or error. In preparing the financial statements, management is required to evaluate whether there are conditions or events, considered in the aggregate, that raise substantial doubt about the Company's ability to continue as a going concern for one year after the date the financial statements are available to be issued.\n\nAuditor's Responsibilities for the Audit of the Financial Statements\nOur objectives are to obtain reasonable assurance about whether the financial statements as a whole are free from material misstatement, whether due to fraud or error, and to issue an auditor's report that includes our opinion. Reasonable assurance is a high level of assurance but is not absolute assurance and therefore is not a guarantee that an audit conducted in accordance with GAAS will always detect a material misstatement when it exists. The risk of not detecting a material misstatement resulting from fraud is higher than for one resulting from error, as fraud may involve collusion, forgery, intentional omissions, misrepresentations, or the override of internal control. Misstatements are considered material if there is a substantial likelihood that, individually or in the aggregate, they would influence the judgment made by a reasonable user based on the financial statements. In performing an audit in accordance with GAAS, we exercise professional judgment and maintain professional skepticism throughout the audit. We also evaluate the appropriateness of accounting policies used and the reasonableness of significant accounting estimates made by management, as well as the overall presentation of the financial statements, and we conclude whether, in our judgment, there are conditions or events that raise substantial doubt about the Company's ability to continue as a going concern for a reasonable period of time. We are required to communicate with those charged with governance regarding, among other matters, the planned scope and timing of the audit and significant audit findings.\n\nHarding & Mealey CPAs, P.C.\nWorcester, Massachusetts\nMarch 14, 2026",
    balance_sheet_lines:
      'Cash and cash equivalents | 312,400 | 302,900\nAccounts receivable, net | 458,200 | 427,000\nPrepaid expenses | 41,300 | 36,300\n**Total current assets** | **811,900** | **766,200**\nProperty and equipment, net | 624,500 | 610,000\nIntangible assets, net | 88,000 | 88,000\n**Total assets** | **1,524,400** | **1,464,200**\nAccounts payable | 196,700 | 188,400\nAccrued liabilities | 73,400 | 70,000\nCurrent portion of long-term debt | 90,000 | 90,000\n**Total current liabilities** | **360,100** | **348,400**\nLong-term debt, net of current portion | 410,000 | 500,000\n**Total liabilities** | **770,100** | **848,400**\nMembers’ capital | 500,000 | 500,000\nRetained earnings | 254,300 | 115,800\n**Total members’ equity** | **754,300** | **615,800**\n**Total liabilities and members’ equity** | **1,524,400** | **1,464,200**',
    income_statement_lines:
      'Revenue | 4,210,000 | 3,940,000\nCost of services | (2,684,000) | (2,540,000)\n**Gross profit** | **1,526,000** | **1,400,000**\nSalaries and benefits | (742,000) | (705,000)\nGeneral and administrative | (286,000) | (272,000)\nDepreciation and amortization | (96,000) | (91,000)\n**Total operating expenses** | **(1,124,000)** | **(1,068,000)**\n**Operating income** | **402,000** | **332,000**\nInterest expense | (38,500) | (44,000)\n**Net income** | **363,500** | **288,000**',
    cash_flow_lines:
      'Net income | 363,500 | 288,000\nDepreciation and amortization | 96,000 | 91,000\nIncrease in accounts receivable | (31,200) | (28,600)\nIncrease in prepaid expenses | (5,000) | (3,000)\nIncrease in accounts payable | 8,300 | 9,000\nIncrease in accrued liabilities | 3,400 | 2,000\n**Net cash from operating activities** | **435,000** | **358,400**\nPurchases of property and equipment | (110,500) | (120,000)\n**Net cash used in investing activities** | **(110,500)** | **(120,000)**\nRepayment of long-term debt | (90,000) | (90,000)\nMember distributions | (225,000) | (142,000)\n**Net cash used in financing activities** | **(315,000)** | **(232,000)**\n**Net change in cash** | **9,500** | **6,400**\nCash, beginning of year | 302,900 | 296,500\n**Cash, end of year** | **312,400** | **302,900**',
    statement_of_equity_lines:
      'Beginning members’ equity | 615,800\nNet income | 363,500\nMember distributions | (225,000)\n**Ending members’ equity** | **754,300**',
    notes_disclosures:
      'Note 1 — Nature of operations and summary of significant accounting policies. Northline Logistics LLC provides regional third-party logistics and freight-brokerage services. The financial statements are prepared on the accrual basis in accordance with U.S. GAAP. Revenue is recognized as services are performed. Property and equipment are stated at cost and depreciated on a straight-line basis over estimated useful lives of three to ten years.\nNote 2 — Long-term debt. Long-term debt consists of a term loan secured by equipment, bearing interest at 6.25%, with monthly principal payments and final maturity in 2030. Current maturities of $90,000 are classified as current liabilities.\nNote 3 — Members’ equity. The Company is a Massachusetts limited liability company; members’ capital and distributions are governed by the operating agreement. Distributions of $225,000 were made during 2025.\nNote 4 — Intangible assets. Intangible assets, net, of $88,000 at December 31, 2025 and 2024 consist of an acquired perpetual operating authority and related rights. The Company has determined these assets to have indefinite useful lives; accordingly, they are not amortized but are tested for impairment at least annually and whenever events or changes in circumstances indicate that the carrying amount may not be recoverable. No impairment was recognized during the years ended December 31, 2025 or 2024.\nNote 5 — Subsequent events. Management has evaluated subsequent events through March 14, 2026, the date the financial statements were available to be issued.',
  },
  'board-report': {
    organization_name: 'Northline Logistics LLC',
    reporting_period: 'Q4 2025 and Full Year 2025',
    report_type: 'Quarterly Board Report',
    board_meeting_date: '2026-01-28',
    prepared_by: 'Office of the CFO',
    classification: 'Board Confidential',
    financial_highlights:
      'Full-year 2025 revenue of $4.21 million, up 6.9% vs. prior year. Net income of $363,500 (8.6% net margin) exceeded budget by $48,000. Cash position of $312,400 at December 31, 2025, up from $302,900. Total assets $1.52 million; debt-to-equity 0.54x, down from 0.87x at year-end 2024.',
    strategic_initiatives:
      'Northeastern corridor expansion: Phase 1 contracts signed with three new shipper accounts totaling ~$620,000 annualized revenue; onboarding Q1 2026. Fleet modernization: three Class 8 replacements committed, delivery Q2 2026, estimated CapEx $310,000. Technology: TMS upgrade (McLeod Software) scheduled for Q2 2026 implementation, $85,000 budget.',
    key_risks:
      'Fuel cost volatility (diesel +14% vs. budget in Q4). Driver retention: turnover 22% vs. 18% target. Two key customer contracts up for renewal in H1 2026 (combined ~$1.1M revenue). Macro: regional manufacturing slowdown reducing spot rate opportunities.',
    operational_metrics:
      'Active drivers: 31 (vs. 33 target). Fleet utilization: 84%. On-time delivery rate: 96.2%. Customer count: 47 active accounts. Top-10 customer concentration: 62% of revenue.',
    compliance_updates:
      'FMCSA compliance: no open violations; last roadside inspection (Q3 2025) — satisfactory. No open EEOC or OSHA matters. Annual insurance renewals completed November 2025 — no material coverage gaps.',
    board_actions_needed:
      'Approval: FY 2026 capital expenditure budget of $1.2 million. Approval: Q4 2025 member distribution of $112,500. Ratification: director indemnification agreements (three new independent directors). Discussion/direction: Northeast expansion Phase 2 commitment (Q2 2026 decision point).',
    forward_guidance:
      '2026 revenue guidance: $4.55–4.75 million (base case). Key assumptions: 3% rate increase effective March 1, northeast expansion ramp, TMS-enabled efficiency gains of ~2% on operating costs. Principal risks to guidance: driver shortage, fuel, customer concentration renewals.',
  },
  'cash-flow-budget-package': {
    entity_name: 'Northline Logistics LLC',
    forecast_period: 'Rolling 12 months — January through December 2026',
    prepared_by: 'Harding & Mealey CPAs, P.C. — advisory services',
    ownership_notice_body:
      "This document presents a forward-looking cash-flow projection built from assumptions and figures supplied and owned by the practitioner and the entity's management. Apollo typesets the provided data and language into this document; it has not audited, opined on, recomputed, or independently verified any figure. Actual results will differ from the projected amounts, and no assurance is expressed or implied that the forecast will be achieved.",
    base_case_lines:
      'Jan 2026 | 312,400 | 358,000 | (341,000) | 17,000 | 329,400\nFeb 2026 | 329,400 | 372,000 | (360,000) | 12,000 | 341,400\nMar 2026 | 341,400 | 401,000 | (372,000) | 29,000 | 370,400\nApr 2026 | 370,400 | 365,000 | (358,000) | 7,000 | 377,400\nMay 2026 | 377,400 | 388,000 | (366,000) | 22,000 | 399,400\nJun 2026 | 399,400 | 412,000 | (389,000) | 23,000 | 422,400\nJul 2026 | 422,400 | 358,000 | (371,000) | (13,000) | 409,400\nAug 2026 | 409,400 | 369,000 | (375,000) | (6,000) | 403,400\nSep 2026 | 403,400 | 395,000 | (372,000) | 23,000 | 426,400\nOct 2026 | 426,400 | 410,000 | (388,000) | 22,000 | 448,400\nNov 2026 | 448,400 | 398,000 | (381,000) | 17,000 | 465,400\nDec 2026 | 465,400 | 421,000 | (424,000) | (3,000) | 462,400\n**Total / Year** | **312,400** | **4,647,000** | **(4,497,000)** | **150,000** | **462,400**',
    scenario_summary:
      'Base | 462,400 | 329,400 | 4,647,000 | (4,497,000)\nBest | 548,900 | 341,400 | 4,890,000 | (4,365,000)\nWorst | 286,100 | 261,800 | 4,210,000 | (4,558,000)',
    working_capital_lines:
      'Days sales outstanding (DSO) | 44\nDays payable outstanding (DPO) | 38\nDays inventory outstanding (DIO) | 0\nCash conversion cycle | 6 days\nMinimum operating cash target | 250,000\nLine of credit available (undrawn) | 500,000',
    key_assumptions:
      'Base case assumes revenue growth of approximately 3% quarter-over-quarter; best case 6%; worst case flat.\nCollections modeled at a 44-day average (DSO); no change in customer credit terms.\nPayroll paid bi-weekly; major vendor terms net-30.\nOne scheduled equipment purchase of approximately $60,000 in Q3 (base case).\nNo new debt or equity financing assumed; the existing $500,000 line of credit remains undrawn.\nFigures and assumptions provided by management; actual results will differ.',
  },
}
const fields: Record<string, unknown> = {}
for (const f of moduleData.required_fields) fields[f.key] = seed(f)
for (const f of moduleData.optional_fields || []) if (SEEDS[slug]?.[f.key] !== undefined) fields[f.key] = SEEDS[slug][f.key]
if (SEEDS[slug]) Object.assign(fields, SEEDS[slug])

console.log(`Rendering catalog deliverable: ${slug} (${moduleData.sections.length} module sections), style=${style.id}`)
const t0 = Date.now()
const result = await orchestrate({
  slug,
  deliverableLabel: summary.label,
  industryLabel: summary.industry_label,
  module: moduleData,
  schema,
  style,
  brand,
  fields,
  uploads: [],
})
console.log(`orchestrate ok in ${Date.now() - t0}ms; warnings=${JSON.stringify(result.warnings)}`)

const syntheticTemplate = {
  slug, label: summary.label, description: summary.description,
  category: summary.industry_slug, supports_images: true,
  has_signature_block: false, has_toc: shouldRenderToc(slug),
  layout: chooseLayoutForSlug(slug), fields: [],
  sections: moduleData.sections.map((s: any) => ({ id: s.key, title: s.label })),
  generation_notes: '',
}
const palette = applyPaletteOverride(await loadBrandPalette('apollo'), undefined)
const buildArgs = {
  template: syntheticTemplate, brand, inputs: fields,
  contentHtml: result.contentHtml,
  // Clean document reference — initials of the slug words, year, sequence.
  // (No internal sprint codes leaking into CPA-facing output.)
  documentId: `${slug.split('-').map((w) => w[0]).join('').toUpperCase()}-2026-001`,
  preparedDate: '11 June 2026', palette,
  fontPreset: resolvePreset(undefined), logoPlacement: resolvePlacement(undefined),
}
const pdf = await buildPdf(buildArgs)
const fullHtml = buildFullHtml(buildArgs)

await fs.mkdir(SMOKE, { recursive: true })
await fs.writeFile(path.join(SMOKE, `${outName}.pdf`), pdf)
await fs.writeFile(path.join(SMOKE, `${outName}.full.html`), fullHtml)
await fs.writeFile(path.join(SMOKE, `${outName}.content.html`), result.contentHtml)

// Dedup analysis
const moduleSections = moduleData.sections.length
const contentH2 = (result.contentHtml.match(/<h2\b/gi) || []).length
const openers = (fullHtml.match(/class="section-opener"/g) || []).length
const tocRows = (fullHtml.match(/class="toc-row"/g) || []).length
console.log('--- WS1 DEDUP ANALYSIS ---')
console.log(`module_sections      = ${moduleSections}`)
console.log(`content_html_<h2>    = ${contentH2}`)
console.log(`rendered_openers     = ${openers}`)
console.log(`toc_rows             = ${tocRows}`)
console.log(`pdf_bytes            = ${pdf.length}`)
console.log(openers === moduleSections && tocRows === openers
  ? `PASS: each section once, TOC matches body (${openers}=${moduleSections})`
  : `FAIL: openers=${openers} tocRows=${tocRows} expected=${moduleSections}`)
