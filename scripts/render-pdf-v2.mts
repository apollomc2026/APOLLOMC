// Session B v1 render harness. Generates the first Apollo PDF for Jon's
// review: NDA + Apollo brand. Commits the PDF to design-lab/.
//
// Run: npx tsx --env-file=apps/portal/.env.local scripts/render-pdf-v1.mts

import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')
const PORTAL_ROOT = path.join(REPO_ROOT, 'apps', 'portal')
const DESIGN_LAB = path.join(REPO_ROOT, 'design-lab')

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set — aborting')
  process.exit(1)
}

process.chdir(PORTAL_ROOT)

const importTs = (rel: string) =>
  import(pathToFileURL(path.join(PORTAL_ROOT, rel)).href)

const { loadTemplate } = await importTs('lib/apollo/templates.ts')
const { loadBrand } = await importTs('lib/apollo/brands.ts')
const { generateDocumentHtml } = await importTs('lib/apollo/generate.ts')
const { buildPdf, buildFullHtml } = await importTs('lib/apollo/pdf.ts')

const templateSlug = 'nda'
const brandSlug = 'apollo'

const inputs: Record<string, unknown> = {
  disclosing_party: 'On Spot Solutions LLC',
  receiving_party: 'Acme Widgets Inc',
  effective_date: '2026-04-24',
  term_years: 3,
  purpose_of_disclosure:
    "Technical evaluation of On Spot's Apollo platform for potential integration with Acme's document workflows",
  governing_state: 'Massachusetts',
}

await fs.mkdir(DESIGN_LAB, { recursive: true })

const template = await loadTemplate(templateSlug)
if (!template) throw new Error(`template ${templateSlug} not found`)
const brand = await loadBrand(brandSlug)
if (!brand) throw new Error(`brand ${brandSlug} not found`)

console.log(`=== generating ${templateSlug} + ${brandSlug} ===`)
const t0 = Date.now()
const contentHtml = await generateDocumentHtml({
  template,
  brand,
  inputs,
  images: [],
})
console.log(`  Claude HTML: ${contentHtml.length} chars, ${Date.now() - t0}ms`)

const documentId = `APL-NDA-2026-04-24-001`
const preparedDate = '24 April 2026'
const preparedFor = String(inputs.receiving_party)

const t1 = Date.now()
const pdfBuffer = await buildPdf({
  template,
  brand,
  inputs,
  contentHtml,
  documentId,
  preparedDate,
  preparedFor,
})
console.log(`  PDF rendered: ${pdfBuffer.length} bytes, ${Date.now() - t1}ms`)

const pdfOutPath = path.join(DESIGN_LAB, 'nda-apollo-v2.pdf')
await fs.writeFile(pdfOutPath, pdfBuffer)
console.log(`  wrote ${pdfOutPath}`)

// Also dump the prepared HTML for reference
const fullHtml = buildFullHtml({
  template,
  brand,
  inputs,
  contentHtml,
  documentId,
  preparedDate,
  preparedFor,
})
const htmlOutPath = path.join(DESIGN_LAB, 'nda-apollo-v2.html')
await fs.writeFile(htmlOutPath, fullHtml)
console.log(`  wrote ${htmlOutPath}`)

// And dump Claude's raw HTML so we can see what the model emitted
const rawOutPath = path.join(DESIGN_LAB, 'nda-apollo-v2.claude-raw.html')
await fs.writeFile(rawOutPath, contentHtml)
console.log(`  wrote ${rawOutPath}`)

// Also render per-page PNG previews so we can review without opening a PDF
// viewer. We use pdfjs-dist (if available) falling back to rendering the
// HTML content at viewport-width.
const { chromium } = await import('playwright')
const browser = await chromium.launch()
try {
  const page = await browser.newPage({
    viewport: { width: 816, height: 1056 }, // 8.5 × 11 at 96 DPI
  })
  await page.setContent(fullHtml, { waitUntil: 'networkidle' })
  await page.emulateMedia({ media: 'print' })
  const previewPath = path.join(DESIGN_LAB, 'nda-apollo-v2-preview.png')
  await page.screenshot({ path: previewPath, fullPage: true })
  console.log(`  wrote ${previewPath}`)
} finally {
  await browser.close()
}

console.log('\nDone.')
