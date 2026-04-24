// Session A regression harness. Generates 3 test DOCX files directly through
// the Apollo pipeline (no auth, no S3 upload, no Supabase) so we can inspect
// them with unzip + grep and confirm the Phase 3 fixes held.
//
// Run: npx tsx --env-file=apps/portal/.env.local scripts/quality-regression-test.mts

import path from 'node:path'
import fs from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const REPO_ROOT = path.resolve(__dirname, '..')
const PORTAL_ROOT = path.join(REPO_ROOT, 'apps', 'portal')
const OUTPUT_DIR = path.join(__dirname, 'regression-outputs')

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set — aborting')
  process.exit(1)
}

// brands.ts uses process.cwd() to find brand-assets (.., .., brand-assets).
// templates.ts uses process.cwd() to find templates. Both expect to be called
// from apps/portal, so change there.
process.chdir(PORTAL_ROOT)

const importTs = (relFromPortal: string) =>
  import(pathToFileURL(path.join(PORTAL_ROOT, relFromPortal)).href)

const { loadTemplate } = await importTs('lib/apollo/templates.ts')
const { loadBrand } = await importTs('lib/apollo/brands.ts')
const { generateDocumentHtml } = await importTs('lib/apollo/generate.ts')
const { buildDocx } = await importTs('lib/apollo/docx.ts')

interface Case {
  slug: string
  templateSlug: string
  brandSlug: string
  inputs: Record<string, unknown>
}

const cases: Case[] = [
  {
    slug: 'nda_on-spot-solutions',
    templateSlug: 'nda',
    brandSlug: 'on-spot-solutions',
    inputs: {
      disclosing_party: 'On Spot Solutions LLC',
      receiving_party: 'Acme Widgets Inc',
      effective_date: '2026-04-24',
      term_years: 3,
      purpose_of_disclosure:
        "Technical evaluation of On Spot's Apollo platform for potential integration with Acme's document workflows",
      governing_state: 'Massachusetts',
    },
  },
  {
    slug: 'sow_atlas',
    templateSlug: 'sow',
    brandSlug: 'atlas',
    inputs: {
      client_name: 'Summit Property Management',
      project_title: 'Atlas Access Control Deployment',
      start_date: '2026-05-01',
      end_date: '2026-08-31',
      project_summary:
        'Deploy Atlas field intelligence platform across 12 Summit properties. Includes hardware installation, technician training, and 60-day support period.',
      deliverables:
        'Hardware deployment at 12 sites\nTechnician training program for Summit maintenance staff\n60-day post-deployment support\nFinal deployment report',
      fee_structure: 'Fixed fee $87,500',
      payment_terms: 'Net 30',
    },
  },
  {
    slug: 'engagement-letter_apollo',
    templateSlug: 'engagement-letter',
    brandSlug: 'apollo',
    inputs: {
      client_name: 'Reed Partners Capital',
      engagement_type: 'Advisory',
      start_date: '2026-05-15',
      scope_summary:
        'Strategic advisory on digital transformation initiatives, with focus on document workflow automation and vendor evaluation',
      fee_arrangement:
        'Monthly retainer of $12,000, billed in advance on the 1st of each month',
      point_of_contact_client: 'Sarah Chen, COO',
      point_of_contact_provider: 'Jon Sargent, Managing Partner',
    },
  },
]

await fs.mkdir(OUTPUT_DIR, { recursive: true })

for (const c of cases) {
  console.log(`\n=== generating ${c.slug} ===`)
  const template = await loadTemplate(c.templateSlug)
  if (!template) throw new Error(`template ${c.templateSlug} not found`)
  const brand = await loadBrand(c.brandSlug)
  if (!brand) throw new Error(`brand ${c.brandSlug} not found`)

  const t0 = Date.now()
  const contentHtml = await generateDocumentHtml({
    template,
    brand,
    inputs: c.inputs,
    images: [],
  })
  console.log(`  html generated (${contentHtml.length} chars, ${Date.now() - t0}ms)`)

  const docxBuffer = await buildDocx({
    contentHtml,
    title: template.label,
    brandLabel: brand.label,
    brandLogo:
      brand.logo_bytes && brand.logo_mime
        ? { bytes: brand.logo_bytes, mime: brand.logo_mime }
        : null,
    images: [],
    templateLabel: template.label,
    templateSlug: template.slug,
    hasSignatureBlock: template.has_signature_block === true,
    inputs: c.inputs,
  })
  const outPath = path.join(OUTPUT_DIR, `${c.slug}.docx`)
  await fs.writeFile(outPath, docxBuffer)
  const htmlPath = path.join(OUTPUT_DIR, `${c.slug}.generated.html`)
  await fs.writeFile(htmlPath, contentHtml)
  console.log(`  wrote ${outPath} (${docxBuffer.length} bytes)`)
}

console.log('\nregression outputs written to:', OUTPUT_DIR)
