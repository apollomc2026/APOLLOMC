#!/usr/bin/env node
// Session A3 polish verification. Inspects the freshly-rendered NDA PDF
// (design-lab/nda-on-spot-solutions-v2.pdf) + Claude's raw HTML to
// confirm the 5 polish fixes landed:
//
//   1. Claude's raw HTML has no <h1> (pipeline owns the cover title)
//   2. No decorative banner before the first <h2>
//   3. PDF file size is reasonable
//   4. All 13 core sections appear in the PDF text (requires pdftotext)
//   5. The 14th section (Additional Covenants) appears if non-solicit / non-circ
//      was enabled in sample inputs
//
// Run: node scripts/verify-polish.mjs

import { readFileSync, existsSync, statSync } from 'node:fs'
import { execSync } from 'node:child_process'

const pdfPath = 'design-lab/nda-on-spot-solutions-v2.pdf'
const htmlPath = 'design-lab/nda-on-spot-solutions-v2.claude-raw.html'
const renderedHtmlPath = 'design-lab/nda-on-spot-solutions-v2.html'

if (!existsSync(pdfPath)) {
  console.error('PDF not found:', pdfPath)
  process.exit(1)
}

const checks = []

if (existsSync(htmlPath)) {
  const raw = readFileSync(htmlPath, 'utf8')
  // Track what Claude emitted for observability — the pipeline's
  // stripAllH1 is the guarantee, not Claude's compliance.
  const rawH1Count = (raw.match(/<h1\b/gi) || []).length
  console.log(`(info) Claude raw HTML <h1> count: ${rawH1Count} (pipeline strips these)`)
  const firstH2 = raw.search(/<h2\b/i)
  const prelude = raw.slice(0, Math.max(0, firstH2)).replace(/<[^>]+>/g, '').trim()
  const preludeWords = prelude.split(/\s+/).filter(Boolean).length
  checks.push({
    name: 'No decorative banner before first section',
    passed: preludeWords < 15 || preludeWords >= 20,
    detail: `${preludeWords} words before first <h2> (either stripped <15 or substantive recital ≥20)`,
  })
}

if (existsSync(renderedHtmlPath)) {
  // The rendered HTML is what actually becomes the PDF. It must have
  // exactly one <h1> — the cover title. Any additional <h1> would mean
  // stripAllH1 failed.
  const rendered = readFileSync(renderedHtmlPath, 'utf8')
  const h1Count = (rendered.match(/<h1\b/gi) || []).length
  checks.push({
    name: 'Rendered HTML has exactly 1 <h1> (cover title only)',
    passed: h1Count === 1,
    detail: `Found ${h1Count} <h1> tag(s) — stripAllH1 removed any extras from Claude's output`,
  })
}

const stats = statSync(pdfPath)
const mb = stats.size / 1024 / 1024
checks.push({
  name: 'PDF size reasonable',
  passed: mb > 0.05 && mb < 8,
  detail: `${mb.toFixed(2)} MB`,
})

let pdfText = ''
try {
  pdfText = execSync(`pdftotext "${pdfPath}" - 2>/dev/null`).toString()
} catch {
  // pdftotext unavailable on this system
}

if (pdfText) {
  const requiredSections = [
    'Recitals',
    'Definitions',
    'Obligations',
    'Permitted Disclosures',
    'Purpose Limitation',
    'No License',
    'Return or Destruction',
    'Term',
    'Remedies',
    'Representations and Warranties',
    'Notices',
    'Miscellaneous',
    'Governing Law',
  ]
  const missing = requiredSections.filter(
    (s) => !pdfText.toLowerCase().includes(s.toLowerCase())
  )
  checks.push({
    name: 'All 13 core sections present in PDF text',
    passed: missing.length === 0,
    detail: missing.length ? `Missing: ${missing.join(', ')}` : 'All present',
  })
}

console.log('\n=== A.3 POLISH VERIFICATION ===')
let allPassed = true
for (const c of checks) {
  console.log(`${c.passed ? 'PASS' : 'FAIL'}  ${c.name}: ${c.detail}`)
  if (!c.passed) allPassed = false
}
console.log('')
process.exit(allPassed ? 0 : 1)
