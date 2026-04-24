// Session B render harness. Renders brand+template pairs through the
// Apollo PDF pipeline. With no args, renders the full default matrix
// defined below. With args, filters: either a brand slug, a template slug,
// or both.
//
// Examples:
//   npx tsx --env-file=apps/portal/.env.local scripts/render-pdf-v2.mts
//   npx tsx --env-file=apps/portal/.env.local scripts/render-pdf-v2.mts apollo
//   npx tsx --env-file=apps/portal/.env.local scripts/render-pdf-v2.mts --template=sow
//   npx tsx --env-file=apps/portal/.env.local scripts/render-pdf-v2.mts --brand=apollo --template=proposal

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

// Realistic sample inputs per template. Kept in one place so the render
// matrix can mix-and-match templates + brands cleanly.
const SAMPLE_INPUTS: Record<string, Record<string, unknown>> = {
  nda: {
    disclosing_party: 'On Spot Solutions LLC',
    receiving_party: 'Acme Widgets Inc',
    effective_date: '2026-04-24',
    term_years: 3,
    purpose_of_disclosure:
      "Technical evaluation of On Spot's Apollo platform for potential integration with Acme's document workflows",
    governing_state: 'Massachusetts',
  },
  sow: {
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
  'engagement-letter': {
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
  'change-order': {
    original_sow_reference: 'SOW-2026-0042 dated 1 May 2026',
    client_name: 'Summit Property Management',
    change_date: '2026-06-15',
    reason_for_change:
      'Summit has acquired two additional properties during the engagement period and requested inclusion of those sites under the existing deployment.',
    scope_changes:
      'Add hardware deployment at 2 additional Summit-acquired sites\nExtend technician training to new maintenance staff at acquired sites\nExtend 60-day support window to cover new deployments',
    schedule_impact:
      'Add 4 weeks to the original timeline. Revised end date: 28 September 2026.',
    fee_impact:
      'Additional fee of $18,000. Revised total engagement fee: $105,500.',
    effective_date: '2026-06-15',
  },
  proposal: {
    prospect_name: 'David Reed',
    prospect_organization: 'Reed Partners Capital',
    proposal_date: '2026-04-24',
    problem_statement:
      'Reed Partners is evaluating modernization of its portfolio-review documentation workflow, which currently produces inconsistent investor-facing materials across deals and consumes significant senior-partner time in final-pass editing.',
    proposed_approach:
      'A three-phase engagement: (1) current-state workflow audit across recent transactions; (2) design of a structured intake + generation system anchored to Reed Partners brand standards; (3) phased rollout with partner-level validation gates.',
    deliverables:
      'Current-state audit memorandum\nTemplate system design specification\nPartner-validated pilot deliverables (3 deal memos)\nRollout plan and training materials',
    team_qualifications:
      'Jon Sargent, Managing Partner — 15+ years field-services operations, founder of the Apollo deliverables platform. Supporting senior consultant team to be named at engagement start.',
    timeline: '12 weeks from engagement letter execution',
    investment:
      'Fixed fee $185,000, invoiced 40% on signing, 30% at phase 2 completion, 30% on final delivery.',
    validity_period_days: 30,
  },
  fsr: {
    site_name: 'Encore Boston Harbor — North Garage',
    site_address: '1 Broadway, Everett, MA 02149',
    visit_date: '2026-04-24',
    technician_name: 'Marcus Reyes',
    equipment_involved: 'SKIDATA Barrier.Gate M — Lane 3 Entry',
    issue_reported:
      'Barrier intermittently failing to raise on valid ticket scan. Operator reports ~15% failure rate over prior 48 hours.',
    work_performed:
      'Arrived 09:15. Observed fault code E14 on primary controller. Reset controller per manufacturer procedure; fault cleared. Verified operation through 3 consecutive cycle tests. Amperage draw within normal range (4.2A). Departed 10:40.',
    parts_used: 'None — no parts replaced',
    time_on_site_hours: 1.5,
    follow_up_required: 'None',
    customer_signature_name: 'Rick Delaney',
  },
  'incident-report': {
    incident_date: '2026-04-20',
    incident_time: '14:27',
    location: 'Conference Room B, 2nd floor, Summit Place',
    reporter_name: 'Jordan Kim, Facilities Manager',
    persons_involved:
      'Operations team (6 people) attending a meeting at time of incident',
    incident_description:
      'At 14:27, overhead fire sprinkler in Conference Room B discharged without preceding fire or smoke. Approximately 18 gallons of water released before building engineer shut off riser at 14:35.',
    immediate_actions_taken:
      'Evacuated occupants from room at 14:29. Contacted building engineer at 14:30. Shut off riser at 14:35. Deployed water vacuums by 14:50. Conference room deemed unusable; meeting relocated.',
    witnesses:
      'All 6 meeting attendees plus 2 adjacent-office staff who responded to alarm',
    injuries_or_damage:
      'No injuries. Conference room: carpet saturated, 4 chairs water-damaged, 1 laptop water-damaged (pending assessment), ceiling tiles replaced.',
    root_cause_hypothesis:
      'Preliminary: thermal sensor malfunction. Awaiting inspection by building fire-system vendor.',
    recommended_actions:
      'Fire-system vendor inspection of all thermal sensors on 2nd floor\nReplace affected ceiling tiles and carpet\nDocument loss for insurance claim',
  },
}

// Default render matrix. Focused on Apollo brand since the system's
// already been validated across all three on NDA. Scaling to 3 brands
// for every template = 30 PDFs per render cycle, which is overkill
// until the per-template treatment is locked.
const defaultMatrix: Job[] = [
  // Long-form contracts — should fit the existing pipeline cleanly
  mkJob('nda', 'apollo', 'APL-NDA-2026-04-24'),
  mkJob('sow', 'apollo', 'APL-SOW-2026-04-24'),
  mkJob('engagement-letter', 'apollo', 'APL-EL-2026-04-24'),
  mkJob('change-order', 'apollo', 'APL-CO-2026-06-15'),
  mkJob('proposal', 'apollo', 'APL-PRO-2026-04-24'),
  // Field docs — images + single/dual-party attestation
  mkJob('fsr', 'apollo', 'APL-FSR-2026-04-24'),
  mkJob('incident-report', 'apollo', 'APL-IR-2026-04-20'),
]

function mkJob(
  templateSlug: string,
  brandSlug: string,
  idStem: string,
  preparedDate = '24 April 2026'
): Job {
  const inputs = SAMPLE_INPUTS[templateSlug]
  if (!inputs) throw new Error(`no sample inputs for template ${templateSlug}`)
  return {
    templateSlug,
    brandSlug,
    outSlug: `${templateSlug}-${brandSlug}-v2`,
    documentId: `${idStem}-001`,
    preparedDate,
    inputs,
  }
}

// Parse CLI filter
function arg(key: string): string | undefined {
  for (const a of process.argv.slice(2)) {
    if (a.startsWith(`--${key}=`)) return a.slice(key.length + 3)
  }
  return undefined
}
const brandFilter = arg('brand') ?? (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : undefined)
const templateFilter = arg('template')
const jobs = defaultMatrix.filter((j) => {
  if (brandFilter && j.brandSlug !== brandFilter) return false
  if (templateFilter && j.templateSlug !== templateFilter) return false
  return true
})
if (jobs.length === 0) {
  console.error('no jobs matched filter')
  process.exit(1)
}

await fs.mkdir(DESIGN_LAB, { recursive: true })

// Windows locks open PDFs. If a file is locked, print a warning and keep
// going so we can still render the other templates in the batch.
async function writeOrWarn(filePath: string, data: Buffer | string): Promise<void> {
  try {
    await fs.writeFile(filePath, data)
  } catch (err) {
    const e = err as NodeJS.ErrnoException
    if (e.code === 'EBUSY' || e.code === 'EPERM') {
      console.log(`  SKIPPED (locked): ${path.basename(filePath)} — close any open viewer and re-run`)
      return
    }
    throw err
  }
}

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
    job.inputs.receiving_party ??
      job.inputs.client_name ??
      job.inputs.prospect_organization ??
      job.inputs.site_name ??
      job.inputs.location ??
      ''
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

  await writeOrWarn(path.join(DESIGN_LAB, `${job.outSlug}.pdf`), pdfBuffer)
  await writeOrWarn(
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
  await writeOrWarn(
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
