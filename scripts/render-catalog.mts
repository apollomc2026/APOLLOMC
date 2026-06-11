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
const fields: Record<string, unknown> = {}
for (const f of moduleData.required_fields) fields[f.key] = seed(f)

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
