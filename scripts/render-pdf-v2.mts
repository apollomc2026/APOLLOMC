// Session B v2 render harness. Runs the PDF pipeline for one or more
// brand+template pairs. With no args, renders the full 3-brand NDA matrix
// (Apollo, Atlas, On Spot). With a single brand arg, renders that brand
// only.
//
// Run: npx tsx --env-file=apps/portal/.env.local scripts/render-pdf-v2.mts
//      npx tsx --env-file=apps/portal/.env.local scripts/render-pdf-v2.mts apollo

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

interface Job {
  templateSlug: string
  brandSlug: string
  outSlug: string
  documentId: string
  preparedDate: string
  inputs: Record<string, unknown>
}

const commonNdaInputs: Record<string, unknown> = {
  disclosing_party: 'On Spot Solutions LLC',
  receiving_party: 'Acme Widgets Inc',
  effective_date: '2026-04-24',
  term_years: 3,
  purpose_of_disclosure:
    "Technical evaluation of On Spot's Apollo platform for potential integration with Acme's document workflows",
  governing_state: 'Massachusetts',
}

const allJobs: Job[] = [
  {
    templateSlug: 'nda',
    brandSlug: 'apollo',
    outSlug: 'nda-apollo-v2',
    documentId: 'APL-NDA-2026-04-24-001',
    preparedDate: '24 April 2026',
    inputs: commonNdaInputs,
  },
  {
    templateSlug: 'nda',
    brandSlug: 'atlas',
    outSlug: 'nda-atlas-v2',
    documentId: 'ATL-NDA-2026-04-24-001',
    preparedDate: '24 April 2026',
    inputs: commonNdaInputs,
  },
  {
    templateSlug: 'nda',
    brandSlug: 'on-spot-solutions',
    outSlug: 'nda-on-spot-solutions-v2',
    documentId: 'OSS-NDA-2026-04-24-001',
    preparedDate: '24 April 2026',
    inputs: commonNdaInputs,
  },
]

const filter = process.argv[2]
const jobs = filter ? allJobs.filter((j) => j.brandSlug === filter) : allJobs
if (jobs.length === 0) {
  console.error(`no jobs matched filter=${filter}`)
  process.exit(1)
}

await fs.mkdir(DESIGN_LAB, { recursive: true })

for (const job of jobs) {
  console.log(`\n=== ${job.outSlug} ===`)
  const template = await loadTemplate(job.templateSlug)
  if (!template) throw new Error(`template ${job.templateSlug} not found`)
  const brand = await loadBrand(job.brandSlug)
  if (!brand) throw new Error(`brand ${job.brandSlug} not found`)

  const t0 = Date.now()
  const contentHtml = await generateDocumentHtml({
    template,
    brand,
    inputs: job.inputs,
    images: [],
  })
  console.log(`  Claude HTML: ${contentHtml.length} chars, ${Date.now() - t0}ms`)

  const preparedFor = String(
    job.inputs.receiving_party ?? job.inputs.client_name ?? ''
  )
  const t1 = Date.now()
  const pdfBuffer = await buildPdf({
    template,
    brand,
    inputs: job.inputs,
    contentHtml,
    documentId: job.documentId,
    preparedDate: job.preparedDate,
    preparedFor,
  })
  console.log(`  PDF: ${pdfBuffer.length} bytes, ${Date.now() - t1}ms`)

  await fs.writeFile(path.join(DESIGN_LAB, `${job.outSlug}.pdf`), pdfBuffer)
  await fs.writeFile(
    path.join(DESIGN_LAB, `${job.outSlug}.html`),
    buildFullHtml({
      template,
      brand,
      inputs: job.inputs,
      contentHtml,
      documentId: job.documentId,
      preparedDate: job.preparedDate,
      preparedFor,
    })
  )
  await fs.writeFile(
    path.join(DESIGN_LAB, `${job.outSlug}.claude-raw.html`),
    contentHtml
  )
}

// Preview PNGs for every job
const { chromium } = await import('playwright')
const browser = await chromium.launch()
try {
  for (const job of jobs) {
    const page = await browser.newPage({
      viewport: { width: 816, height: 1056 },
    })
    const htmlPath = path.join(DESIGN_LAB, `${job.outSlug}.html`)
    const html = await fs.readFile(htmlPath, 'utf8')
    await page.setContent(html, { waitUntil: 'networkidle' })
    await page.emulateMedia({ media: 'print' })
    await page.screenshot({
      path: path.join(DESIGN_LAB, `${job.outSlug}-preview.png`),
      fullPage: true,
    })
    await page.close()
  }
} finally {
  await browser.close()
}

console.log('\nDone.')
