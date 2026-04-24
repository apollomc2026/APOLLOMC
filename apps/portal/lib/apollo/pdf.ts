import { chromium } from 'playwright'
import type { Template } from './templates'
import type { LoadedBrand } from './brands'

// Apollo v1 quiet-luxury design system.
// Canonical design language lives in memory/project_design_language_quiet_luxury.md.
// Anything we change here should be a considered subtraction, not a decorative addition.

export interface BuildPdfArgs {
  template: Template
  brand: LoadedBrand
  inputs: Record<string, unknown>
  contentHtml: string // Claude's output (body HTML)
  documentId: string // e.g. "APL-NDA-2026-04-24-001"
  preparedDate: string // "24 April 2026"
  preparedFor?: string // client / counterparty display name
}

interface SectionRef {
  romanNumber: string
  rawTitle: string
}

const ROMAN = [
  '',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
  'XIII',
  'XIV',
  'XV',
  'XVI',
  'XVII',
  'XVIII',
  'XIX',
  'XX',
]

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function stripTags(input: string): string {
  return input.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim()
}

// Claude sometimes emits numbered section titles ("1. Definitions",
// "I. Definitions", "A) Scope"). The pipeline owns the numbering system,
// so strip any leading numeric/roman/alphabetic prefix from the title
// before using it. Otherwise we get "SECTION I / 1. Definitions" which
// reads doubled.
function cleanSectionTitle(raw: string): string {
  return raw
    .replace(/^\s*(?:\d{1,3}|[IVX]{1,4}|[A-Za-z])[.)]\s*/, '')
    .trim()
}

// Strip Claude's leading <h1>. The cover page owns the document title;
// repeating it at the top of the body is the title-repetition tell that
// undercuts restraint.
function stripLeadingTitle(html: string): string {
  return html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>/i, '').trim()
}

// Walk <h2> elements, assign Roman-numeral section numbers, wrap each
// section as a dedicated block with its own opener. Returns the transformed
// body HTML and the ordered list of sections for the TOC.
function numberSections(body: string): { html: string; sections: SectionRef[] } {
  const sections: SectionRef[] = []
  let sectionIndex = 0
  const html = body.replace(/<h2\b[^>]*>([\s\S]*?)<\/h2>/gi, (_m, inner) => {
    sectionIndex += 1
    const rawTitle = cleanSectionTitle(stripTags(inner))
    const roman = ROMAN[sectionIndex] ?? String(sectionIndex)
    sections.push({ romanNumber: roman, rawTitle })
    return `
      <section class="section-opener">
        <p class="eyebrow">Section ${roman}</p>
        <h2>${escapeHtml(rawTitle)}</h2>
        <hr class="section-rule" />
      </section>
    `
  })
  return { html, sections }
}

// Pull any content (typically a recital / lede paragraph) that appears
// before the first <h2> out of the body, so the pipeline can render it
// as a dedicated "preamble" block rather than mid-body default prose.
// Returns { preamble, body } — preamble is '' if there's no leading
// prose before the first section heading.
function extractPreamble(body: string): { preamble: string; body: string } {
  const firstH2 = body.search(/<h2\b/i)
  if (firstH2 < 0) return { preamble: '', body }
  const preamble = body.slice(0, firstH2).trim()
  if (!preamble) return { preamble: '', body }
  return { preamble, body: body.slice(firstH2) }
}

function renderTocHtml(sections: SectionRef[]): string {
  if (sections.length === 0) return ''
  const rows = sections
    .map(
      (s) => `
      <li class="toc-row">
        <span class="toc-num">${escapeHtml(s.romanNumber)}</span>
        <span class="toc-title">${escapeHtml(s.rawTitle)}</span>
        <span class="toc-dots"></span>
      </li>`
    )
    .join('')
  return `
    <div class="toc-page">
      <p class="eyebrow toc-eyebrow">Contents</p>
      <ol class="toc">${rows}</ol>
    </div>
  `
}

interface SignatureParty {
  label: string
  nameField?: string
  defaultName?: string
}

const SIGNATURE_PARTIES: Record<string, SignatureParty[]> = {
  nda: [
    { label: 'Disclosing Party', nameField: 'disclosing_party' },
    { label: 'Receiving Party', nameField: 'receiving_party' },
  ],
  sow: [
    { label: 'Client', nameField: 'client_name' },
    { label: 'Provider' },
  ],
  'engagement-letter': [
    { label: 'Client', nameField: 'client_name' },
    { label: 'Provider' },
  ],
  'change-order': [
    { label: 'Client', nameField: 'client_name' },
    { label: 'Provider' },
  ],
  proposal: [
    { label: 'Client', nameField: 'prospect_organization' },
    { label: 'Provider' },
  ],
  'incident-report': [{ label: 'Reporter', nameField: 'reporter_name' }],
  fsr: [
    { label: 'Technician', nameField: 'technician_name' },
    { label: 'Customer', nameField: 'customer_signature_name' },
  ],
}

function readString(inputs: Record<string, unknown>, key: string | undefined): string {
  if (!key) return ''
  const v = inputs[key]
  if (v === undefined || v === null) return ''
  return String(v).trim()
}

function renderSignatureBlock(args: BuildPdfArgs): string {
  const has = args.template.has_signature_block === true
  if (!has) return ''
  const parties = SIGNATURE_PARTIES[args.template.slug] ?? [
    { label: 'Party' },
    { label: 'Party' },
  ]
  const cells = parties
    .map((p) => {
      const name = readString(args.inputs, p.nameField)
      const nameLine = name
        ? `<p class="sig-name">${escapeHtml(name)}</p>`
        : `<p class="sig-name sig-name-placeholder">&nbsp;</p>`
      return `
        <div class="sig-cell">
          <p class="eyebrow">${escapeHtml(p.label)}</p>
          ${nameLine}
          <div class="sig-line"></div>
          <p class="sig-caption">Signature</p>
          <div class="sig-line sig-line-short"></div>
          <p class="sig-caption">Date</p>
        </div>
      `
    })
    .join('')
  return `
    <section class="signatures-page">
      <p class="eyebrow sig-eyebrow">Execution</p>
      <h2 class="sig-heading">${parties.length === 1 ? 'Attestation' : 'Signatures'}</h2>
      <hr class="section-rule" />
      <div class="sig-grid sig-grid-${parties.length}">${cells}</div>
    </section>
  `
}

// Palette is per-brand. v1 only implements Apollo; Atlas + On Spot land once
// NDA+Apollo is locked. Every palette is three colors: ink, paper, accent.
// Grays are metadata only.
interface Palette {
  paper: string
  ink: string
  accent: string
  metadata: string
}

function paletteForBrand(brandSlug: string): Palette {
  // Every palette: three colors (paper, ink, one accent) + metadata grey.
  // Accents are derived from each brand's canonical palette in brand-assets/
  // but pulled in at hairline-weight only (never as surface fills) to
  // preserve quiet-luxury restraint.
  switch (brandSlug) {
    case 'atlas':
      // Atlas is navy-dominant in its web identity, but its brand.md specifies
      // white canvas for legal-context deliverables. The distinguishing mark
      // is the gold (the second-A color), used here only on rules + eyebrows.
      return {
        paper: '#FAFAF7',
        ink: '#09091A',
        accent: '#C9A84C',
        metadata: '#6B6B6B',
      }
    case 'on-spot-solutions':
      // On Spot's brand.md codifies white background "as the law" with Cone
      // Orange as accent. At hairline weight, the orange sits quietly and
      // signals the brand without dominating the page.
      return {
        paper: '#FAFAF7',
        ink: '#2B2B2B',
        accent: '#FF6B1A',
        metadata: '#6B6B6B',
      }
    case 'apollo':
    case 'other':
    default:
      return {
        paper: '#FAFAF7',
        ink: '#14151A',
        accent: '#0A1628',
        metadata: '#6B6B6B',
      }
  }
}

function brandWordmark(brandSlug: string): string {
  // Cover wordmark is typeset, NOT the PNG logo. Quiet luxury principle:
  // the brand shows up as a small, typeset mark — not a stamp.
  switch (brandSlug) {
    case 'apollo':
      return 'APOLLO'
    case 'atlas':
      return 'ATLAS'
    case 'on-spot-solutions':
      return 'ON SPOT SOLUTIONS'
    default:
      return ''
  }
}

// Shared typographic tokens + font imports used across every layout. Each
// layout appends its own layout-specific CSS block but inherits these
// baseline values — palette variables, font families, paper color.
function sharedHead(palette: Palette, docTitle: string): string {
  return `
<head>
<meta charset="utf-8" />
<title>${escapeHtml(docTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --paper: ${palette.paper};
  --ink: ${palette.ink};
  --accent: ${palette.accent};
  --metadata: ${palette.metadata};
  --hairline: rgba(20, 21, 26, 0.22);
}
html, body {
  background: var(--paper);
  color: var(--ink);
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10.5pt;
  line-height: 1.62;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}
strong { font-weight: 600; }
.eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 8pt;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--metadata);
  margin: 0 0 12pt 0;
}
hr.hairline {
  border: 0;
  border-top: 0.5pt solid var(--hairline);
  margin: 18pt 0;
}
</style>
`
}

// Dispatch to the right layout renderer. Default is the contract layout
// (cover + TOC + numbered sections + signatures).
function buildFullHtml(args: BuildPdfArgs): string {
  const layout = args.template.layout ?? 'contract'
  switch (layout) {
    case 'invoice':
      return buildInvoiceHtml(args)
    case 'one-pager':
      return buildOnePagerHtml(args)
    case 'minutes':
      return buildMinutesHtml(args)
    case 'letter':
    case 'contract':
    default:
      return buildContractHtml(args)
  }
}

function buildContractHtml(args: BuildPdfArgs): string {
  const palette = paletteForBrand(args.brand.slug)
  const bodySource = stripLeadingTitle(args.contentHtml)
  const { preamble, body: bodyAfterPreamble } = extractPreamble(bodySource)
  const { html: numberedBody, sections } = numberSections(bodyAfterPreamble)
  const tocHtml = args.template.has_toc === false ? '' : renderTocHtml(sections)
  const preambleHtml = preamble
    ? `<section class="preamble">${preamble}</section>`
    : ''
  const signaturesHtml = renderSignatureBlock(args)
  const wordmark = brandWordmark(args.brand.slug)
  const docTitle = args.template.label
  const docTitleUpper = docTitle.toUpperCase()
  const preparedFor = args.preparedFor ?? readString(args.inputs, 'receiving_party') ?? readString(args.inputs, 'client_name') ?? readString(args.inputs, 'prospect_organization') ?? ''

  // Parties on the cover — for NDAs, the two named parties; for others, the
  // client. We surface whichever input fields exist.
  const partyA = readString(args.inputs, 'disclosing_party') || readString(args.inputs, 'client_name') || readString(args.inputs, 'prospect_organization')
  const partyB = readString(args.inputs, 'receiving_party')

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(docTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<style>
:root {
  --paper: ${palette.paper};
  --ink: ${palette.ink};
  --accent: ${palette.accent};
  --metadata: ${palette.metadata};
  --hairline: rgba(20, 21, 26, 0.22);
}

/* Paged media. 8.5 × 11, generous margins. */
@page {
  size: 8.5in 11in;
  margin: 1.5in 1.25in 1.25in 1.25in;
}
@page :first {
  margin: 1in 1.25in 1in 1.25in;
}

html, body {
  background: var(--paper);
  color: var(--ink);
  margin: 0;
  padding: 0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 10.5pt;
  line-height: 1.6;
  font-weight: 400;
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}

h1, h2, h3, .display, .cover-title, .sig-heading {
  font-family: 'Cormorant Garamond', 'EB Garamond', Georgia, serif;
  font-weight: 500;
  color: var(--ink);
  letter-spacing: 0;
}

p {
  margin: 0 0 10pt 0;
}

strong { font-weight: 600; }
em, i {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 500;
}

/* Eyebrow labels — the signature small-caps metadata voice. */
.eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 8pt;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--metadata);
  margin: 0 0 12pt 0;
}

/* Fine hairline accents. Never thick borders. */
hr.hairline, .hairline {
  border: 0;
  border-top: 0.5pt solid var(--hairline);
  margin: 18pt 0;
  width: 100%;
}
.section-rule {
  border: 0;
  border-top: 0.5pt solid var(--accent);
  width: 1.5in;
  margin: 14pt 0 28pt 0;
}

/* ========================================================================
   COVER PAGE
   Restrained to the extreme. Wordmark small. Title center-weight.
   Generous vertical rhythm. No logo PNG — typeset wordmark only.
   ======================================================================== */
.cover {
  page-break-after: always;
  height: 9in;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.cover-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.cover-wordmark {
  font-family: 'Inter', sans-serif;
  font-size: 10pt;
  font-weight: 600;
  letter-spacing: 0.38em;
  color: var(--ink);
}
.cover-docid {
  font-family: 'Inter', sans-serif;
  font-size: 8pt;
  letter-spacing: 0.18em;
  color: var(--metadata);
  text-transform: uppercase;
  text-align: right;
}
.cover-center {
  margin-top: 2.1in;
  text-align: center;
}
.cover-kicker {
  font-family: 'Inter', sans-serif;
  font-size: 8.5pt;
  font-weight: 500;
  letter-spacing: 0.38em;
  color: var(--metadata);
  text-transform: uppercase;
  margin-bottom: 56pt;
}
.cover-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 40pt;
  line-height: 1.1;
  color: var(--ink);
  margin: 0;
}
.cover-parties {
  margin-top: 84pt;
  text-align: center;
}
.cover-parties .party {
  font-family: 'Inter', sans-serif;
  font-size: 10pt;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--ink);
  margin: 0;
}
.cover-parties .party-rule {
  width: 0.6in;
  margin: 14pt auto;
  border-top: 0.5pt solid var(--accent);
}
.cover-and {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 12pt;
  color: var(--metadata);
  margin: 4pt 0;
}
.cover-bottom {
  margin-top: auto;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  font-family: 'Inter', sans-serif;
  font-size: 8pt;
  letter-spacing: 0.18em;
  color: var(--metadata);
  text-transform: uppercase;
}

/* ========================================================================
   TOC PAGE
   ======================================================================== */
.toc-page {
  page-break-after: always;
  padding-top: 0.25in;
}
.toc-eyebrow {
  margin-bottom: 8pt;
}
.toc {
  list-style: none;
  padding: 0;
  margin: 0;
  counter-reset: toc;
}
.toc-row {
  display: flex;
  align-items: baseline;
  gap: 12pt;
  padding: 10pt 0;
  border-bottom: 0.25pt solid var(--hairline);
}
.toc-row:last-child { border-bottom: none; }
.toc-num {
  font-family: 'Inter', sans-serif;
  font-size: 9pt;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: var(--accent);
  min-width: 0.6in;
}
.toc-title {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14pt;
  font-weight: 500;
  color: var(--ink);
  flex-shrink: 0;
}
/* TOC dot leaders via a repeating radial gradient — CSS dotted borders
   render inconsistently in Chromium's PDF backend, but gradients are
   rock-solid. Small round dots at ~4pt spacing match classical typesetting. */
.toc-dots {
  flex: 1;
  min-width: 32pt;
  height: 6pt;
  background-image: radial-gradient(circle, rgba(20, 21, 26, 0.55) 0.6pt, transparent 0.7pt);
  background-size: 4pt 6pt;
  background-repeat: repeat-x;
  background-position: 0 5pt;
  margin: 0 8pt;
}

/* ========================================================================
   BODY — section openers + prose
   ======================================================================== */
.body-content {
  font-family: 'Inter', sans-serif;
  font-size: 10.5pt;
  line-height: 1.62;
  text-align: left;
  hyphens: none;
  color: var(--ink);
}
.body-content p { margin: 0 0 10pt 0; }
.body-content ol,
.body-content ul {
  margin: 10pt 0 14pt 0;
  padding-left: 20pt;
}
.body-content li { margin-bottom: 6pt; }
.body-content strong {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 500;
  font-size: 11pt;
  color: var(--ink);
}

.section-opener {
  break-inside: avoid;
  margin-top: 54pt;
  margin-bottom: 6pt;
}
.section-opener:first-of-type { margin-top: 18pt; }
.section-opener h2 {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-weight: 500;
  font-size: 22pt;
  line-height: 1.15;
  color: var(--ink);
  margin: 6pt 0 0 0;
}

/* Preamble — the recital paragraph(s) above the first numbered section.
   Rendered inside a narrower measure, in Cormorant italic, with generous
   vertical margin and a centered hairline below to separate it from the
   numbered body. Quiet-luxury legal-doc convention. */
.preamble {
  max-width: 4.9in;
  margin: 36pt auto 48pt auto;
  text-align: left;
}
.preamble p {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-size: 12.5pt;
  line-height: 1.55;
  color: var(--ink);
  margin: 0 0 10pt 0;
}
.preamble p:last-child { margin-bottom: 0; }
.preamble::after {
  content: '';
  display: block;
  width: 0.6in;
  margin: 32pt auto 0 auto;
  border-top: 0.5pt solid var(--accent);
}

/* ========================================================================
   SIGNATURES
   ======================================================================== */
.signatures-page {
  page-break-before: always;
  padding-top: 0.25in;
}
.sig-eyebrow { margin-bottom: 8pt; }
.sig-heading {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic;
  font-weight: 400;
  font-size: 28pt;
  margin: 0;
}
.sig-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48pt;
  margin-top: 36pt;
}
.sig-grid-1 {
  grid-template-columns: minmax(0, 3.6in);
  justify-content: center;
}
.sig-cell { display: flex; flex-direction: column; }
.sig-cell .eyebrow { margin-bottom: 10pt; }
.sig-name {
  font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14pt;
  font-weight: 500;
  color: var(--ink);
  margin: 0 0 42pt 0;
}
.sig-name-placeholder { color: var(--metadata); }
.sig-line {
  border-bottom: 0.5pt solid var(--ink);
  height: 1pt;
  margin-top: 0;
  margin-bottom: 6pt;
}
.sig-line-short { width: 40%; margin-top: 28pt; }
.sig-caption {
  font-family: 'Inter', sans-serif;
  font-size: 8pt;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--metadata);
  margin: 0 0 18pt 0;
}
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-top">
    <div class="cover-wordmark">${escapeHtml(wordmark)}</div>
    <div class="cover-docid">${escapeHtml(args.documentId)}</div>
  </div>
  <div class="cover-center">
    <p class="cover-kicker">${escapeHtml(docTitleUpper)}</p>
    <h1 class="cover-title">${escapeHtml(docTitle)}</h1>
    ${
      partyA || partyB
        ? `
    <div class="cover-parties">
      ${partyA ? `<p class="party">${escapeHtml(partyA)}</p>` : ''}
      ${partyA && partyB ? `<div class="party-rule"></div><p class="cover-and">and</p><div class="party-rule"></div>` : ''}
      ${partyB ? `<p class="party">${escapeHtml(partyB)}</p>` : ''}
    </div>
        `
        : ''
    }
  </div>
  <div class="cover-bottom">
    <div>Prepared ${escapeHtml(args.preparedDate)}</div>
    ${preparedFor ? `<div>For ${escapeHtml(preparedFor)}</div>` : '<div></div>'}
  </div>
</div>

<!-- TABLE OF CONTENTS -->
${tocHtml}

<!-- BODY -->
<main class="body-content">
${preambleHtml}
${numberedBody}
</main>

<!-- SIGNATURES -->
${signaturesHtml}

</body>
</html>`
}

// ============================================================================
// INVOICE LAYOUT
// Single-page structured document. No cover, no TOC, no signatures.
// Minimal masthead → bill-to block → line items table → totals → payment
// instructions → notes. Numbers-first hierarchy.
// ============================================================================
function buildInvoiceHtml(args: BuildPdfArgs): string {
  const palette = paletteForBrand(args.brand.slug)
  const wordmark = brandWordmark(args.brand.slug)
  const docTitle = args.template.label
  const invoiceNumber = readString(args.inputs, 'invoice_number') || args.documentId
  const invoiceDate = readString(args.inputs, 'invoice_date') || args.preparedDate
  const dueDate = readString(args.inputs, 'due_date')
  const billToName = readString(args.inputs, 'bill_to_name')
  const billToAddress = readString(args.inputs, 'bill_to_address')

  // Pass Claude's body through unchanged except: strip leading h1 (we own
  // the title), strip Claude's duplicated header metadata (it often
  // re-emits invoice # and dates which we render in our own header).
  const body = stripLeadingTitle(args.contentHtml)

  return `<!doctype html>
<html lang="en">${sharedHead(palette, docTitle)}
<style>
@page { size: 8.5in 11in; margin: 0.9in 0.9in 0.9in 0.9in; }
.invoice { display: flex; flex-direction: column; gap: 36pt; }
.invoice-masthead {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding-bottom: 16pt; border-bottom: 0.75pt solid var(--accent);
}
.invoice-wordmark {
  font-family: 'Inter', sans-serif; font-size: 10pt; font-weight: 600;
  letter-spacing: 0.38em; color: var(--ink);
}
.invoice-title-block { text-align: right; }
.invoice-title {
  font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic;
  font-weight: 400; font-size: 34pt; line-height: 1; color: var(--ink);
  margin: 0 0 8pt 0;
}
.invoice-meta { display: grid; grid-template-columns: auto auto; column-gap: 18pt; justify-content: end; }
.invoice-meta .label { font-family: 'Inter', sans-serif; font-size: 8pt;
  font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--metadata); text-align: right; padding-right: 0; }
.invoice-meta .value { font-family: 'Inter', sans-serif; font-size: 10pt;
  color: var(--ink); text-align: right; }
.invoice-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 48pt; }
.invoice-party-label { font-family: 'Inter', sans-serif; font-size: 8pt;
  font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--metadata); margin: 0 0 8pt 0; }
.invoice-party-name { font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 14pt; font-weight: 500; margin: 0 0 4pt 0; }
.invoice-party-address { font-family: 'Inter', sans-serif; font-size: 10pt;
  color: var(--ink); white-space: pre-line; margin: 0; }
.invoice-body {
  font-family: 'Inter', sans-serif; font-size: 10pt; line-height: 1.6;
}
.invoice-body table { width: 100%; border-collapse: collapse; margin: 16pt 0; }
.invoice-body thead th {
  font-family: 'Inter', sans-serif; font-size: 8pt; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--metadata);
  text-align: left; padding: 8pt 0; border-bottom: 0.5pt solid var(--accent);
}
.invoice-body thead th:last-child,
.invoice-body tbody td:last-child { text-align: right; }
.invoice-body thead th.num, .invoice-body tbody td.num { text-align: right; }
.invoice-body tbody td {
  font-family: 'Inter', sans-serif; font-size: 10pt; color: var(--ink);
  padding: 8pt 0; border-bottom: 0.25pt solid var(--hairline);
  vertical-align: top;
}
.invoice-body h2 {
  font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500;
  font-size: 16pt; color: var(--ink); margin: 28pt 0 10pt 0;
}
.invoice-body h3 {
  font-family: 'Inter', sans-serif; font-size: 9pt; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--metadata);
  margin: 22pt 0 6pt 0;
}
.invoice-body p { margin: 0 0 8pt 0; }
.invoice-body ul { margin: 8pt 0; padding-left: 18pt; }
/* Make Claude's totals render aligned right, gracefully */
.invoice-body .totals, .invoice-body strong { font-variant-numeric: tabular-nums; }
</style>
<body>
<div class="invoice">
  <div class="invoice-masthead">
    <div>
      <div class="invoice-wordmark">${escapeHtml(wordmark)}</div>
    </div>
    <div class="invoice-title-block">
      <h1 class="invoice-title">Invoice</h1>
      <div class="invoice-meta">
        <div class="label">Invoice No.</div><div class="value">${escapeHtml(invoiceNumber)}</div>
        <div class="label">Invoice Date</div><div class="value">${escapeHtml(invoiceDate)}</div>
        ${dueDate ? `<div class="label">Due</div><div class="value">${escapeHtml(dueDate)}</div>` : ''}
      </div>
    </div>
  </div>
  ${
    billToName || billToAddress
      ? `<div class="invoice-parties">
    <div>
      <p class="invoice-party-label">Bill To</p>
      <p class="invoice-party-name">${escapeHtml(billToName)}</p>
      <p class="invoice-party-address">${escapeHtml(billToAddress)}</p>
    </div>
    <div>
      <p class="invoice-party-label">From</p>
      <p class="invoice-party-name">${escapeHtml(wordmark)}</p>
    </div>
  </div>`
      : ''
  }
  <div class="invoice-body">
    ${body}
  </div>
</div>
</body>
</html>`
}

// ============================================================================
// ONE-PAGER LAYOUT
// Single-page marketing document. Quiet luxury on one page means generous
// negative space and a typographic-forward hero. No cover, no TOC, no
// signatures. One h1 (handled by us), Claude's body provides the substance.
// ============================================================================
function buildOnePagerHtml(args: BuildPdfArgs): string {
  const palette = paletteForBrand(args.brand.slug)
  const wordmark = brandWordmark(args.brand.slug)
  const docTitle = args.template.label
  const subjectTitle = readString(args.inputs, 'subject_title') || docTitle
  const body = stripLeadingTitle(args.contentHtml)

  return `<!doctype html>
<html lang="en">${sharedHead(palette, docTitle)}
<style>
@page { size: 8.5in 11in; margin: 1.1in 1.2in 1in 1.2in; }
.onepager { display: flex; flex-direction: column; height: 8.5in; }
.op-masthead {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 12pt; border-bottom: 0.5pt solid var(--hairline);
}
.op-wordmark { font-family: 'Inter', sans-serif; font-size: 9pt;
  font-weight: 600; letter-spacing: 0.38em; color: var(--ink); }
.op-docid { font-family: 'Inter', sans-serif; font-size: 7.5pt;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--metadata); }
.op-hero { margin-top: 36pt; }
.op-kicker { font-family: 'Inter', sans-serif; font-size: 8.5pt;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
  color: var(--metadata); margin: 0 0 14pt 0; }
.op-title { font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic; font-weight: 400; font-size: 42pt; line-height: 1.05;
  color: var(--ink); margin: 0 0 20pt 0; max-width: 5.8in; }
.op-body { font-family: 'Inter', sans-serif; font-size: 10.5pt;
  line-height: 1.6; margin-top: 20pt; }
.op-body h2 {
  font-family: 'Inter', sans-serif; font-size: 8.5pt; font-weight: 500;
  letter-spacing: 0.24em; text-transform: uppercase; color: var(--accent);
  margin: 22pt 0 8pt 0; border-top: 0; padding-top: 0;
}
.op-body h2:first-child { margin-top: 0; }
.op-body p { margin: 0 0 10pt 0; max-width: 5.8in; }
.op-body ul { margin: 8pt 0 14pt 0; padding-left: 0; list-style: none; }
.op-body li {
  position: relative; padding-left: 18pt; margin-bottom: 8pt;
  max-width: 5.8in;
}
.op-body li::before {
  content: ''; position: absolute; left: 0; top: 9pt;
  width: 8pt; height: 0; border-top: 0.75pt solid var(--accent);
}
.op-footer { margin-top: auto; padding-top: 20pt;
  border-top: 0.5pt solid var(--hairline);
  display: flex; justify-content: space-between;
  font-family: 'Inter', sans-serif; font-size: 8.5pt;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--metadata); }
</style>
<body>
<div class="onepager">
  <div class="op-masthead">
    <span class="op-wordmark">${escapeHtml(wordmark)}</span>
    <span class="op-docid">${escapeHtml(args.documentId)}</span>
  </div>
  <div class="op-hero">
    <p class="op-kicker">${escapeHtml(docTitle.toUpperCase())}</p>
    <h1 class="op-title">${escapeHtml(subjectTitle)}</h1>
  </div>
  <div class="op-body">${body}</div>
  <div class="op-footer">
    <span>${escapeHtml(args.preparedDate)}</span>
    <span>${escapeHtml(wordmark)}</span>
  </div>
</div>
</body>
</html>`
}

// ============================================================================
// MEETING MINUTES LAYOUT
// Operations document. Structured metadata header (meeting title + date +
// time + location + attendance) instead of a cover page; then sections
// flow as a contract's body would. No TOC, no signatures.
// ============================================================================
function buildMinutesHtml(args: BuildPdfArgs): string {
  const palette = paletteForBrand(args.brand.slug)
  const wordmark = brandWordmark(args.brand.slug)
  const docTitle = args.template.label
  const meetingTitle = readString(args.inputs, 'meeting_title') || docTitle
  const meetingDate = readString(args.inputs, 'meeting_date') || args.preparedDate
  const meetingTime = readString(args.inputs, 'meeting_time')
  const location = readString(args.inputs, 'location') || readString(args.inputs, 'platform')
  const attendees = readString(args.inputs, 'attendees')
  const absent = readString(args.inputs, 'absent')

  // For minutes, strip the h1 and extract a plain preamble (if any);
  // otherwise just pass through. We keep section numbering for the agenda
  // items, which matches the "by agenda item" discussion convention.
  const bodySource = stripLeadingTitle(args.contentHtml)
  const { preamble, body: bodyAfterPreamble } = extractPreamble(bodySource)
  const { html: numberedBody } = numberSections(bodyAfterPreamble)
  const preambleHtml = preamble
    ? `<section class="mm-preamble">${preamble}</section>`
    : ''

  return `<!doctype html>
<html lang="en">${sharedHead(palette, docTitle)}
<style>
@page { size: 8.5in 11in; margin: 1.1in 1.2in 1in 1.2in; }
.mm-masthead {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 10pt; border-bottom: 0.5pt solid var(--hairline);
  margin-bottom: 28pt;
}
.mm-wordmark { font-family: 'Inter', sans-serif; font-size: 9pt;
  font-weight: 600; letter-spacing: 0.38em; color: var(--ink); }
.mm-docid { font-family: 'Inter', sans-serif; font-size: 7.5pt;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--metadata); }
.mm-header { margin-bottom: 36pt; }
.mm-kicker { font-family: 'Inter', sans-serif; font-size: 8.5pt;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
  color: var(--metadata); margin: 0 0 10pt 0; }
.mm-title { font-family: 'Cormorant Garamond', Georgia, serif;
  font-style: italic; font-weight: 400; font-size: 30pt; line-height: 1.1;
  color: var(--ink); margin: 0 0 20pt 0; max-width: 6in; }
.mm-facts { display: grid; grid-template-columns: auto 1fr; column-gap: 22pt; row-gap: 6pt; }
.mm-facts .label { font-family: 'Inter', sans-serif; font-size: 8pt;
  font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--metadata); padding-top: 1pt; }
.mm-facts .value { font-family: 'Inter', sans-serif; font-size: 10pt;
  color: var(--ink); }
.mm-facts .value-serif { font-family: 'Cormorant Garamond', Georgia, serif;
  font-size: 12pt; font-weight: 500; color: var(--ink); }
.mm-preamble {
  margin: 20pt 0 32pt 0; padding: 16pt 0;
  border-top: 0.5pt solid var(--hairline);
  border-bottom: 0.5pt solid var(--hairline);
  font-family: 'Cormorant Garamond', Georgia, serif; font-style: italic;
  font-size: 12pt; line-height: 1.55; color: var(--ink);
}
.mm-preamble p { margin: 0 0 8pt 0; } .mm-preamble p:last-child { margin-bottom: 0; }
.mm-body { font-family: 'Inter', sans-serif; font-size: 10.5pt; line-height: 1.62; }
.mm-body .section-opener { margin-top: 34pt; margin-bottom: 6pt; break-inside: avoid; }
.mm-body .section-opener:first-child { margin-top: 0; }
.mm-body .section-opener .eyebrow { margin-bottom: 6pt; }
.mm-body .section-opener h2 {
  font-family: 'Cormorant Garamond', Georgia, serif; font-weight: 500;
  font-size: 18pt; color: var(--ink); margin: 4pt 0 0 0;
}
.mm-body .section-rule {
  border: 0; border-top: 0.5pt solid var(--accent);
  width: 1.2in; margin: 10pt 0 18pt 0;
}
.mm-body p { margin: 0 0 10pt 0; }
.mm-body ul, .mm-body ol { margin: 8pt 0 14pt 0; padding-left: 20pt; }
.mm-body li { margin-bottom: 6pt; }
.mm-body table { width: 100%; border-collapse: collapse; margin: 14pt 0; }
.mm-body thead th {
  font-family: 'Inter', sans-serif; font-size: 8pt; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--metadata);
  text-align: left; padding: 8pt 8pt 8pt 0;
  border-bottom: 0.5pt solid var(--accent);
}
.mm-body tbody td {
  font-family: 'Inter', sans-serif; font-size: 10pt; color: var(--ink);
  padding: 8pt 8pt 8pt 0; border-bottom: 0.25pt solid var(--hairline);
  vertical-align: top;
}
</style>
<body>
<div class="mm-masthead">
  <span class="mm-wordmark">${escapeHtml(wordmark)}</span>
  <span class="mm-docid">${escapeHtml(args.documentId)}</span>
</div>
<div class="mm-header">
  <p class="mm-kicker">${escapeHtml(docTitle.toUpperCase())}</p>
  <h1 class="mm-title">${escapeHtml(meetingTitle)}</h1>
  <div class="mm-facts">
    <div class="label">Date</div><div class="value value-serif">${escapeHtml(meetingDate)}</div>
    ${meetingTime ? `<div class="label">Time</div><div class="value">${escapeHtml(meetingTime)}</div>` : ''}
    ${location ? `<div class="label">Location</div><div class="value">${escapeHtml(location)}</div>` : ''}
    ${attendees ? `<div class="label">Present</div><div class="value">${escapeHtml(attendees).replace(/\n/g, ', ')}</div>` : ''}
    ${absent ? `<div class="label">Absent</div><div class="value">${escapeHtml(absent).replace(/\n/g, ', ')}</div>` : ''}
  </div>
</div>
${preambleHtml}
<div class="mm-body">${numberedBody}</div>
</body>
</html>`
}

export async function buildPdf(args: BuildPdfArgs): Promise<Buffer> {
  const html = buildFullHtml(args)
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle' })
    const headerFooterColor = paletteForBrand(args.brand.slug).metadata
    const footerTemplate = `
      <div style="width:100%;font-family:'Inter','Segoe UI',sans-serif;font-size:7pt;letter-spacing:0.18em;text-transform:uppercase;color:${headerFooterColor};padding:0 1.25in;display:flex;justify-content:space-between;">
        <span>${escapeHtml(brandWordmark(args.brand.slug))} · ${escapeHtml(args.template.label.toUpperCase())}</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `
    const pdf = await page.pdf({
      format: 'Letter',
      printBackground: true,
      margin: {
        top: '1.5in',
        bottom: '1in',
        left: '1.25in',
        right: '1.25in',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate,
      preferCSSPageSize: false,
    })
    return Buffer.from(pdf)
  } finally {
    await browser.close()
  }
}

// Exposed for tests / the render script so they can also dump the prepared
// HTML alongside the PDF for inspection.
export { buildFullHtml }
