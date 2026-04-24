#!/usr/bin/env node
// Automated inspection of generated regression DOCX files. Mirrors the
// Phase 6.2 checks from the session doc. Reads pre-extracted DOCX dirs
// (extract via PowerShell Expand-Archive into scripts/tmp-extract/<slug>/).

import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const EXTRACT_DIR = path.join(__dirname, 'tmp-extract')

const SIG_REQUIRED = new Set([
  'nda_on-spot-solutions',
  'sow_atlas',
  'engagement-letter_apollo',
])

const slugs = (await fs.readdir(EXTRACT_DIR)).filter(async (s) => {
  const st = await fs.stat(path.join(EXTRACT_DIR, s))
  return st.isDirectory()
})

let allPassed = true
const summary = []

for (const slug of slugs.sort()) {
  const root = path.join(EXTRACT_DIR, slug)
  const docXmlPath = path.join(root, 'word', 'document.xml')
  let docXml = ''
  try {
    docXml = await fs.readFile(docXmlPath, 'utf8')
  } catch {
    console.log(`SKIP ${slug} (no word/document.xml)`)
    continue
  }
  const wordDir = path.join(root, 'word')
  const wordFiles = await fs.readdir(wordDir)
  const footerFiles = wordFiles.filter((f) => /^footer\d*\.xml$/.test(f))
  let footerXml = ''
  for (const f of footerFiles) {
    footerXml += await fs.readFile(path.join(wordDir, f), 'utf8')
    footerXml += '\n'
  }

  console.log(`\n=== inspecting ${slug} ===`)
  const checks = []

  // 1. No empty image dimensions
  const emptyExtent = (docXml.match(/<wp:extent\s*\/>/g) || []).length
  checks.push([
    emptyExtent === 0,
    emptyExtent === 0 ? 'no empty image dims' : `${emptyExtent} empty image dims`,
  ])

  // 2. Logo width in EMU — should be ≤ 1.5 inches (1,371,600 EMU)
  const firstExtent = docXml.match(/<wp:extent\s+cx="(\d+)"/)
  const logoEmu = firstExtent ? parseInt(firstExtent[1], 10) : 0
  const logoInches = (logoEmu / 914400).toFixed(2)
  checks.push([
    logoEmu === 0 || logoEmu <= 1_500_000,
    logoEmu === 0
      ? 'no image present'
      : `logo width ${logoInches} in (≤1.5)`,
  ])

  // 3. H1 count — should be 1
  const h1Count = (docXml.match(/w:pStyle\s+w:val="Heading1"/g) || []).length
  checks.push([h1Count === 1, `H1 count: ${h1Count}`])

  // 4. No emoji or known decorative chars
  const emojiMatch = docXml.match(/[\u{1F300}-\u{1FAFF}]|⚡|🚀|✨|📄|📝/gu) || []
  checks.push([
    emojiMatch.length === 0,
    emojiMatch.length === 0 ? 'no emoji' : `EMOJI FOUND: ${emojiMatch.join(',')}`,
  ])

  // 5. Signature lines (for templates that should have them)
  if (SIG_REQUIRED.has(slug)) {
    const hasSigLines = /_{20,}/.test(docXml)
    checks.push([hasSigLines, hasSigLines ? 'signature lines present' : 'NO SIGNATURE LINES'])
  }

  // 6. No 3+ whitespace runs inside preserve-space runs
  const wsRuns = (docXml.match(/xml:space="preserve">[ \t]{3,}</g) || []).length
  checks.push([wsRuns === 0, `whitespace runs: ${wsRuns} (should be 0)`])

  // 7. Real page number field — should appear in footer as PAGE field.
  // html-to-docx sometimes emits the field with a synthetic namespace
  // prefix (ns1:, ns2:, etc.) instead of the canonical w:, so match any
  // namespace prefix on the instr attribute.
  const hasPageField =
    /<(?:\w+:)?fldSimple[^>]*\s(?:\w+:)?instr\s*=\s*"[^"]*\bPAGE\b/i.test(footerXml) ||
    /<(?:\w+:)?instrText[^>]*>\s*PAGE\b/i.test(footerXml)
  const hasLiteralP1 = /\bp\.\s*1\b/.test(footerXml)
  checks.push([
    hasPageField && !hasLiteralP1,
    hasPageField
      ? hasLiteralP1
        ? 'PAGE field present BUT literal "p. 1" also present'
        : 'PAGE field present'
      : 'NO PAGE field in footer',
  ])

  const passed = checks.every((c) => c[0])
  for (const [ok, msg] of checks) {
    console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${msg}`)
  }
  if (!passed) allPassed = false
  summary.push({ slug, passed })
}

console.log('\n=== SUMMARY ===')
for (const s of summary) {
  console.log(`  ${s.passed ? 'PASS' : 'FAIL'}  ${s.slug}`)
}
process.exit(allPassed ? 0 : 1)
