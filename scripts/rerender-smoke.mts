// Re-render a smoke PDF from its existing .content.html without calling the LLM.
// Useful when pdf.ts rendering logic changes and you want to see the updated output
// on previously-generated content, without the cost or variability of a new model call.
//
//   npx tsx --tsconfig apps/portal/tsconfig.json \
//     scripts/rerender-smoke.mts <slug> <smoke-name>
//
// Reads _smoke/<smoke-name>.content.html, writes _smoke/<smoke-name>.pdf + .full.html.
// The .content.html is NOT updated — it remains the original model output.

import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO_ROOT = path.resolve(__dirname, '..')
const PORTAL_ROOT = path.join(REPO_ROOT, 'apps', 'portal')
const SMOKE = path.join(REPO_ROOT, '_smoke')
process.chdir(PORTAL_ROOT)
const imp = (rel: string) => import(pathToFileURL(path.join(PORTAL_ROOT, rel)).href)

const slug = process.argv[2]
const smokeName = process.argv[3]
if (!slug || !smokeName) {
  console.error('Usage: rerender-smoke.mts <slug> <smoke-name>')
  console.error('  e.g. rerender-smoke.mts financial-statements-package ws5_statements')
  process.exit(1)
}

const loader = await imp('lib/apollo/packages-loader.ts')
const { chooseLayoutForSlug, shouldRenderToc } = await imp('lib/apollo/orchestrate.ts')
const { loadBrand, loadBrandPalette, applyPaletteOverride } = await imp('lib/apollo/brands.ts')
const { resolvePreset } = await imp('lib/apollo/font-presets.ts')
const { resolvePlacement } = await imp('lib/apollo/logo-placement.ts')
const { buildPdf, buildFullHtml } = await imp('lib/apollo/pdf.ts')

// Inputs used when the original smokes were rendered (from render-catalog.mts SEEDS).
// These drive the masthead, footer entity+period, and legend attribution.
const INPUTS: Record<string, Record<string, unknown>> = {
  'financial-statements-package': {
    entity_name: 'Northline Logistics LLC',
    fiscal_year_end: 'December 31, 2025',
    prior_year_end: 'December 31, 2024',
    basis_of_accounting: 'us-gaap',
    opinion_type: 'unqualified',
    practitioner_firm: 'Harding & Mealey CPAs, P.C. — Worcester, Massachusetts',
    report_date: 'March 14, 2026',
  },
  'cash-flow-budget-package': {
    entity_name: 'Northline Logistics LLC',
    forecast_period: 'Rolling 12 months — January through December 2026',
    prepared_by: 'Harding & Mealey CPAs, P.C. — advisory services',
  },
}

const contentHtml = await fs.readFile(path.join(SMOKE, `${smokeName}.content.html`), 'utf-8')
const summary = loader.findDeliverable(slug)
if (!summary) { console.error(`unknown deliverable ${slug}`); process.exit(1) }
const moduleData = loader.getModule(slug)

const syntheticTemplate = {
  slug, label: summary.label, description: summary.description,
  category: summary.industry_slug, supports_images: true,
  has_signature_block: false, has_toc: shouldRenderToc(slug),
  layout: chooseLayoutForSlug(slug), fields: [],
  sections: moduleData.sections.map((s: any) => ({ id: s.key, title: s.label })),
  generation_notes: '',
}
const brand = await loadBrand('apollo')
const palette = applyPaletteOverride(await loadBrandPalette('apollo'), undefined)
const buildArgs = {
  template: syntheticTemplate, brand,
  inputs: INPUTS[slug] || {},
  contentHtml,
  documentId: `${slug.split('-').map((w: string) => w[0]).join('').toUpperCase()}-2026-001`,
  preparedDate: '11 June 2026', palette,
  fontPreset: resolvePreset(undefined), logoPlacement: resolvePlacement(undefined),
}

console.log(`Re-rendering ${smokeName} (slug=${slug}) from existing content HTML…`)
const t0 = Date.now()
const pdf = await buildPdf(buildArgs)
const fullHtml = buildFullHtml(buildArgs)
console.log(`Done in ${Date.now() - t0}ms — pdf_bytes=${pdf.length}`)

await fs.mkdir(SMOKE, { recursive: true })
await fs.writeFile(path.join(SMOKE, `${smokeName}.pdf`), pdf)
await fs.writeFile(path.join(SMOKE, `${smokeName}.full.html`), fullHtml)
console.log(`Wrote _smoke/${smokeName}.pdf and .full.html`)
