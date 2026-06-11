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
  contentHtml: result.contentHtml, documentId: `WS1-${slug}-001`,
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
