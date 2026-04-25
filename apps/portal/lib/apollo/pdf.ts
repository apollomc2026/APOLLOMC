import type { Browser } from 'playwright-core'
import type { Template } from './templates'
import type { LoadedBrand, BrandPalette } from './brands'
import { DEFAULT_BRAND_PALETTE } from './brands'
import type { FontPreset } from './font-presets'
import { resolvePreset } from './font-presets'
import type { LogoPlacementOption } from './logo-placement'
import { resolvePlacement, placementFlags } from './logo-placement'

// Environment-aware Chromium launcher.
//
// LOCAL / DEV (Windows, macOS, Linux dev boxes): use the `playwright` package,
// which bundles its own Chromium binary and works out of the box.
//
// SERVERLESS (Vercel / AWS Lambda): the `playwright` package's bundled
// Chromium is incompatible with Lambda's Amazon Linux 2 sandbox (missing
// shared libs, wrong architecture). `@sparticuz/chromium` ships a serverless-
// compatible Chromium binary plus the required args for headless execution.
// Paired with `playwright-core` (the same API surface, no bundled browser),
// it's the standard way to run Playwright on Vercel.
async function launchChromium(): Promise<Browser> {
  const isServerless =
    !!process.env.VERCEL || !!process.env.AWS_LAMBDA_FUNCTION_NAME
  if (isServerless) {
    const sparticuz = (await import('@sparticuz/chromium')).default
    const { chromium } = await import('playwright-core')
    return chromium.launch({
      args: sparticuz.args,
      executablePath: await sparticuz.executablePath(),
      headless: true,
    })
  }
  const { chromium } = await import('playwright')
  return chromium.launch({ headless: true })
}

// Apollo quiet-luxury PDF design system.
// Canonical design language lives in memory/project_design_language_quiet_luxury.md.
// Anything we change here should be a considered subtraction, not a decorative addition.

export interface BuildPdfArgs {
  template: Template
  brand: LoadedBrand
  inputs: Record<string, unknown>
  contentHtml: string // Claude's output (body HTML)
  documentId: string
  preparedDate: string
  preparedFor?: string
  // Visual controls — each optional with sensible defaults so existing
  // callers don't break while the new system rolls out.
  palette?: BrandPalette
  fontPreset?: FontPreset
  logoPlacement?: LogoPlacementOption
  // Optional disclaimer text repeated in every page footer. Used by the
  // financial-statement layout (e.g., Tax Estimate templates that require
  // mandatory disclaimer language on every page).
  disclaimer?: string
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

// Defensive strip of EVERY <h1> in the body, not just a leading one.
// Claude sometimes emits a cover-like wordmark as an <h1> in the middle
// of the body, or a duplicate title later in the doc. Any <h1> that
// reaches the PDF creates a visible duplicate of the cover title — the
// cover page is the only place the title belongs.
function stripAllH1(html: string): string {
  return html.replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, '')
}

// Strip decorative content that appears before the first <h2>. Claude
// sometimes opens with a spaced-letter banner ("N O N - D I S C L O S U R E"),
// a document ID row, or brand-name filler — visual noise we don't want.
// Heuristic: if the pre-first-<h2> prose is shorter than ~20 words, treat
// it as decorative and remove. If it's longer, keep it — that's a real
// recital/preamble that extractPreamble() can style separately.
function stripPreH2Banner(html: string): string {
  const firstH2Index = html.search(/<h2\b/i)
  if (firstH2Index <= 0) return html
  const preamble = html.slice(0, firstH2Index)
  const textOnly = preamble.replace(/<[^>]+>/g, '').trim()
  const wordCount = textOnly.split(/\s+/).filter(Boolean).length
  if (wordCount >= 20) return html
  return html.slice(firstH2Index)
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
    // New gold-standard NDA uses disclosing_party_name / receiving_party_name.
    // Older legacy field names are inspected as a fallback by readString's
    // callers below — handled via the cover partyA/partyB resolution chain.
    { label: 'Disclosing Party', nameField: 'disclosing_party_name' },
    { label: 'Receiving Party', nameField: 'receiving_party_name' },
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

// Palette + preset are passed in per-call via BuildPdfArgs. The submit
// route (or the local render harness) loads the brand's canonical palette
// via loadBrandPalette(brandSlug), applies any per-submission override,
// and hands the result to buildPdf. This replaces the old hardcoded
// paletteForBrand switch statement.
function resolvePaletteForBuild(args: BuildPdfArgs): BrandPalette {
  return args.palette ?? DEFAULT_BRAND_PALETTE
}

// Build a data: URI for the brand's logo, or return null if the brand has
// no logo on disk. Used by watermarks, header marks, and sig-marks — the
// cover itself uses a typeset wordmark, not the PNG.
function resolveLogoDataUri(brand: LoadedBrand): string | null {
  if (!brand.logo_bytes || !brand.logo_mime) return null
  return `data:${brand.logo_mime};base64,${brand.logo_bytes.toString('base64')}`
}

// CSS + markup for a faded full-page watermark on body pages. Rendered as
// a fixed-position block behind content at 6-8% opacity. Scoped by
// @media print and a .watermark class so it only appears where we want.
function renderWatermarkHtml(logoDataUri: string | null): string {
  if (!logoDataUri) return ''
  return `
    <div class="apollo-watermark" aria-hidden="true">
      <img src="${logoDataUri}" alt="" />
    </div>
  `
}

function watermarkCss(): string {
  return `
    /* A single fixed-position element repeats on every paged-media page.
       Setting it small enough + positioning it in the page margin keeps
       it visible as brand stationery without overlapping the signature
       block on the signatures page. */
    .apollo-watermark {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: auto;
      height: 38%;
      display: flex;
      align-items: center;
      justify-content: center;
      pointer-events: none;
      z-index: -1;
    }
    .apollo-watermark img {
      width: 32%;
      max-width: 3.2in;
      opacity: 0.08;
      filter: grayscale(1);
    }
    /* Signature page gets an extra fainter pass — we can't reliably gate
       a fixed-position element to specific pages in Chromium's paged-media
       layer, but the higher-specificity rule takes precedence on the
       signatures page when the wrapper sits inside that section. */
    .signatures-page .apollo-watermark img,
    .signatures-page ~ .apollo-watermark img {
      opacity: 0.04;
    }
  `
}

// Small logo mark rendered above the signature heading. Centered, ~0.8in
// tall, faint. Complements the typeset wordmark already on the cover.
function renderSigMarkHtml(logoDataUri: string | null): string {
  if (!logoDataUri) return ''
  return `
    <div class="apollo-sig-mark" aria-hidden="true">
      <img src="${logoDataUri}" alt="" />
    </div>
  `
}

function sigMarkCss(): string {
  return `
    .apollo-sig-mark {
      display: flex;
      justify-content: center;
      margin: 36pt 0 12pt 0;
    }
    .apollo-sig-mark img {
      height: 0.7in;
      opacity: 0.75;
    }
  `
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

// Shared typographic + palette tokens emitted as CSS variables. Every
// layout renderer inherits these — swapping the font preset or palette
// propagates through the entire document without per-layout edits.
function sharedHead(palette: BrandPalette, preset: FontPreset, docTitle: string): string {
  return `
<head>
<meta charset="utf-8" />
<title>${escapeHtml(docTitle)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="${preset.googleFontsUrl}" rel="stylesheet">
<style>
:root {
  --paper: ${palette.paper};
  --ink: ${palette.ink};
  --accent: ${palette.accent};
  --metadata: ${palette.metadata};
  --hairline: ${palette.hairline};

  --font-display: ${preset.displayFont};
  --font-body: ${preset.bodyFont};
  --font-mono: ${preset.monoFont};

  --weight-display-italic: ${preset.weights.displayItalic};
  --weight-display-bold: ${preset.weights.displayBold};
  --weight-body-regular: ${preset.weights.bodyRegular};
  --weight-body-medium: ${preset.weights.bodyMedium};
  --weight-body-bold: ${preset.weights.bodyBold};
  --weight-mono-regular: ${preset.weights.monoRegular};
}
html, body {
  background: var(--paper);
  color: var(--ink);
  margin: 0;
  padding: 0;
  font-family: var(--font-body);
  font-size: 10.5pt;
  line-height: 1.62;
  font-weight: var(--weight-body-regular);
  -webkit-font-smoothing: antialiased;
  text-rendering: geometricPrecision;
}
strong { font-weight: var(--weight-body-bold); }
.eyebrow {
  font-family: var(--font-body);
  font-size: 8pt;
  font-weight: var(--weight-body-medium);
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
    case 'financial-statement':
      return buildFinancialStatementHtml(args)
    case 'letter':
    case 'contract':
    default:
      return buildContractHtml(args)
  }
}

function buildContractHtml(args: BuildPdfArgs): string {
  const palette = resolvePaletteForBuild(args)
  const preset = resolvePreset(args.fontPreset?.key)
  const placement = args.logoPlacement ?? resolvePlacement(null)
  const flags = placementFlags(placement, 'contract')
  const logoDataUri = resolveLogoDataUri(args.brand)
  const watermarkHtml = flags.hasWatermark ? renderWatermarkHtml(logoDataUri) : ''
  const sigMarkHtml = flags.hasSigMark ? renderSigMarkHtml(logoDataUri) : ''
  const bodySource = stripPreH2Banner(stripAllH1(stripLeadingTitle(args.contentHtml)))
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
  const preparedFor = args.preparedFor
    ?? readString(args.inputs, 'receiving_party_name')
    ?? readString(args.inputs, 'receiving_party')
    ?? readString(args.inputs, 'client_name')
    ?? readString(args.inputs, 'prospect_organization')
    ?? ''

  // Parties on the cover — for NDAs, the two named parties; for others, the
  // client. We surface whichever input fields exist (both new gold-standard
  // and legacy field names).
  const partyA =
    readString(args.inputs, 'disclosing_party_name') ||
    readString(args.inputs, 'disclosing_party') ||
    readString(args.inputs, 'client_name') ||
    readString(args.inputs, 'prospect_organization')
  const partyB =
    readString(args.inputs, 'receiving_party_name') ||
    readString(args.inputs, 'receiving_party')

  return `<!doctype html>
<html lang="en">${sharedHead(palette, preset, docTitle)}
<style>
/* Paged media. 8.5 × 11, generous margins. */
@page {
  size: 8.5in 11in;
  margin: 1.5in 1.25in 1.25in 1.25in;
}
@page :first {
  margin: 1in 1.25in 1in 1.25in;
}

h1, h2, h3, .display, .cover-title, .sig-heading {
  font-family: var(--font-display);
  font-weight: 500;
  color: var(--ink);
  letter-spacing: 0;
}

p {
  margin: 0 0 10pt 0;
}

strong { font-weight: 600; }
em, i {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 500;
}

/* Eyebrow labels — the signature small-caps metadata voice. */
.eyebrow {
  font-family: var(--font-body);
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
  font-family: var(--font-body);
  font-size: 10pt;
  font-weight: 600;
  letter-spacing: 0.38em;
  color: var(--ink);
}
.cover-docid {
  font-family: var(--font-body);
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
  font-family: var(--font-body);
  font-size: 8.5pt;
  font-weight: 500;
  letter-spacing: 0.38em;
  color: var(--metadata);
  text-transform: uppercase;
  margin-bottom: 56pt;
}
.cover-title {
  font-family: var(--font-display);
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
  font-family: var(--font-body);
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
  font-family: var(--font-display);
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
  font-family: var(--font-body);
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
  font-family: var(--font-body);
  font-size: 9pt;
  font-weight: 500;
  letter-spacing: 0.18em;
  color: var(--accent);
  min-width: 0.6in;
}
.toc-title {
  font-family: var(--font-display);
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
  font-family: var(--font-body);
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
  font-family: var(--font-display);
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
  font-family: var(--font-display);
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
  /* Body font (not display). The display font breaks under the Technical
     preset which uses a monospace for display — italic monospace reads as
     "computer error code," not "legal recital." Body font stays legible
     in italic across all five presets. */
  font-family: var(--font-body);
  font-style: italic;
  font-weight: var(--weight-body-regular);
  font-size: 12pt;
  line-height: 1.65;
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
  font-family: var(--font-display);
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
  font-family: var(--font-display);
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
  font-family: var(--font-body);
  font-size: 8pt;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--metadata);
  margin: 0 0 18pt 0;
}
${watermarkCss()}
${sigMarkCss()}
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
${sigMarkHtml}
${signaturesHtml}

${watermarkHtml}

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
  const palette = resolvePaletteForBuild(args)
  const preset = resolvePreset(args.fontPreset?.key)
  const placement = args.logoPlacement ?? resolvePlacement(null)
  const flags = placementFlags(placement, 'invoice')
  const logoDataUri = resolveLogoDataUri(args.brand)
  const watermarkHtml = flags.hasWatermark ? renderWatermarkHtml(logoDataUri) : ''
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
  const body = stripAllH1(stripLeadingTitle(args.contentHtml))

  return `<!doctype html>
<html lang="en">${sharedHead(palette, preset, docTitle)}
<style>
@page { size: 8.5in 11in; margin: 0.9in 0.9in 0.9in 0.9in; }
.invoice { display: flex; flex-direction: column; gap: 36pt; }
.invoice-masthead {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding-bottom: 16pt; border-bottom: 0.75pt solid var(--accent);
}
.invoice-wordmark {
  font-family: var(--font-body); font-size: 10pt; font-weight: 600;
  letter-spacing: 0.38em; color: var(--ink);
}
.invoice-title-block { text-align: right; }
.invoice-title {
  font-family: var(--font-display); font-style: italic;
  font-weight: 400; font-size: 34pt; line-height: 1; color: var(--ink);
  margin: 0 0 8pt 0;
}
.invoice-meta { display: grid; grid-template-columns: auto auto; column-gap: 18pt; justify-content: end; }
.invoice-meta .label { font-family: var(--font-body); font-size: 8pt;
  font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--metadata); text-align: right; padding-right: 0; }
.invoice-meta .value { font-family: var(--font-body); font-size: 10pt;
  color: var(--ink); text-align: right; }
.invoice-parties { display: grid; grid-template-columns: 1fr 1fr; gap: 48pt; }
.invoice-party-label { font-family: var(--font-body); font-size: 8pt;
  font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--metadata); margin: 0 0 8pt 0; }
.invoice-party-name { font-family: var(--font-display);
  font-size: 14pt; font-weight: 500; margin: 0 0 4pt 0; }
.invoice-party-address { font-family: var(--font-body); font-size: 10pt;
  color: var(--ink); white-space: pre-line; margin: 0; }
.invoice-body {
  font-family: var(--font-body); font-size: 10pt; line-height: 1.6;
}
.invoice-body table { width: 100%; border-collapse: collapse; margin: 16pt 0; }
.invoice-body thead th {
  font-family: var(--font-body); font-size: 8pt; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--metadata);
  text-align: left; padding: 8pt 0; border-bottom: 0.5pt solid var(--accent);
}
.invoice-body thead th:last-child,
.invoice-body tbody td:last-child { text-align: right; }
.invoice-body thead th.num, .invoice-body tbody td.num { text-align: right; }
.invoice-body tbody td {
  font-family: var(--font-body); font-size: 10pt; color: var(--ink);
  padding: 8pt 0; border-bottom: 0.25pt solid var(--hairline);
  vertical-align: top;
}
.invoice-body h2 {
  font-family: var(--font-display); font-weight: 500;
  font-size: 16pt; color: var(--ink); margin: 28pt 0 10pt 0;
}
.invoice-body h3 {
  font-family: var(--font-body); font-size: 9pt; font-weight: 500;
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
${watermarkHtml}
<style>${watermarkCss()}</style>
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
  const palette = resolvePaletteForBuild(args)
  const preset = resolvePreset(args.fontPreset?.key)
  const placement = args.logoPlacement ?? resolvePlacement(null)
  const flags = placementFlags(placement, 'one-pager')
  const logoDataUri = resolveLogoDataUri(args.brand)
  const watermarkHtml = flags.hasWatermark ? renderWatermarkHtml(logoDataUri) : ''
  const wordmark = brandWordmark(args.brand.slug)
  const docTitle = args.template.label
  const subjectTitle = readString(args.inputs, 'subject_title') || docTitle
  const body = stripAllH1(stripLeadingTitle(args.contentHtml))

  return `<!doctype html>
<html lang="en">${sharedHead(palette, preset, docTitle)}
<style>
@page { size: 8.5in 11in; margin: 1.1in 1.2in 1in 1.2in; }
.onepager { display: flex; flex-direction: column; height: 8.5in; }
.op-masthead {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 12pt; border-bottom: 0.5pt solid var(--hairline);
}
.op-wordmark { font-family: var(--font-body); font-size: 9pt;
  font-weight: 600; letter-spacing: 0.38em; color: var(--ink); }
.op-docid { font-family: var(--font-body); font-size: 7.5pt;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--metadata); }
.op-hero { margin-top: 36pt; }
.op-kicker { font-family: var(--font-body); font-size: 8.5pt;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
  color: var(--metadata); margin: 0 0 14pt 0; }
.op-title { font-family: var(--font-display);
  font-style: italic; font-weight: 400; font-size: 42pt; line-height: 1.05;
  color: var(--ink); margin: 0 0 20pt 0; max-width: 5.8in; }
.op-body { font-family: var(--font-body); font-size: 10.5pt;
  line-height: 1.6; margin-top: 20pt; }
.op-body h2 {
  font-family: var(--font-body); font-size: 8.5pt; font-weight: 500;
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
  font-family: var(--font-body); font-size: 8.5pt;
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
${watermarkHtml}
<style>${watermarkCss()}</style>
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
  const palette = resolvePaletteForBuild(args)
  const preset = resolvePreset(args.fontPreset?.key)
  const placement = args.logoPlacement ?? resolvePlacement(null)
  const flags = placementFlags(placement, 'minutes')
  const logoDataUri = resolveLogoDataUri(args.brand)
  const watermarkHtml = flags.hasWatermark ? renderWatermarkHtml(logoDataUri) : ''
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
  const bodySource = stripAllH1(stripLeadingTitle(args.contentHtml))
  const { preamble, body: bodyAfterPreamble } = extractPreamble(bodySource)
  const { html: numberedBody } = numberSections(bodyAfterPreamble)
  const preambleHtml = preamble
    ? `<section class="mm-preamble">${preamble}</section>`
    : ''

  return `<!doctype html>
<html lang="en">${sharedHead(palette, preset, docTitle)}
<style>
@page { size: 8.5in 11in; margin: 1.1in 1.2in 1in 1.2in; }
.mm-masthead {
  display: flex; justify-content: space-between; align-items: center;
  padding-bottom: 10pt; border-bottom: 0.5pt solid var(--hairline);
  margin-bottom: 28pt;
}
.mm-wordmark { font-family: var(--font-body); font-size: 9pt;
  font-weight: 600; letter-spacing: 0.38em; color: var(--ink); }
.mm-docid { font-family: var(--font-body); font-size: 7.5pt;
  letter-spacing: 0.18em; text-transform: uppercase; color: var(--metadata); }
.mm-header { margin-bottom: 36pt; }
.mm-kicker { font-family: var(--font-body); font-size: 8.5pt;
  font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase;
  color: var(--metadata); margin: 0 0 10pt 0; }
.mm-title { font-family: var(--font-display);
  font-style: italic; font-weight: 400; font-size: 30pt; line-height: 1.1;
  color: var(--ink); margin: 0 0 20pt 0; max-width: 6in; }
.mm-facts { display: grid; grid-template-columns: auto 1fr; column-gap: 22pt; row-gap: 6pt; }
.mm-facts .label { font-family: var(--font-body); font-size: 8pt;
  font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
  color: var(--metadata); padding-top: 1pt; }
.mm-facts .value { font-family: var(--font-body); font-size: 10pt;
  color: var(--ink); }
.mm-facts .value-serif { font-family: var(--font-display);
  font-size: 12pt; font-weight: 500; color: var(--ink); }
.mm-preamble {
  margin: 20pt 0 32pt 0; padding: 16pt 0;
  border-top: 0.5pt solid var(--hairline);
  border-bottom: 0.5pt solid var(--hairline);
  font-family: var(--font-display); font-style: italic;
  font-size: 12pt; line-height: 1.55; color: var(--ink);
}
.mm-preamble p { margin: 0 0 8pt 0; } .mm-preamble p:last-child { margin-bottom: 0; }
.mm-body { font-family: var(--font-body); font-size: 10.5pt; line-height: 1.62; }
.mm-body .section-opener { margin-top: 34pt; margin-bottom: 6pt; break-inside: avoid; }
.mm-body .section-opener:first-child { margin-top: 0; }
.mm-body .section-opener .eyebrow { margin-bottom: 6pt; }
.mm-body .section-opener h2 {
  font-family: var(--font-display); font-weight: 500;
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
  font-family: var(--font-body); font-size: 8pt; font-weight: 500;
  letter-spacing: 0.22em; text-transform: uppercase; color: var(--metadata);
  text-align: left; padding: 8pt 8pt 8pt 0;
  border-bottom: 0.5pt solid var(--accent);
}
.mm-body tbody td {
  font-family: var(--font-body); font-size: 10pt; color: var(--ink);
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
${watermarkHtml}
<style>${watermarkCss()}</style>
</body>
</html>`
}

// ============================================================================
// FINANCIAL-STATEMENT LAYOUT
// Report-style financial documents (Budget vs Actual, Expense Report,
// Personal Monthly Summary, Cash Flow Forecast, Tax Estimate).
// No cover page, no TOC. First page begins with a structured masthead
// showing document title + period + entity + prepared metadata. Body is
// table-heavy with monospace numerics, right-aligned amounts, totals row
// styling. Optional disclaimer is repeated in the running footer (used by
// Tax Estimate).
// ============================================================================
function buildFinancialStatementHtml(args: BuildPdfArgs): string {
  const palette = resolvePaletteForBuild(args)
  const preset = resolvePreset(args.fontPreset?.key)
  const placement = args.logoPlacement ?? resolvePlacement(null)
  const flags = placementFlags(placement, 'financial-statement')
  const logoDataUri = resolveLogoDataUri(args.brand)
  const watermarkHtml = flags.hasWatermark ? renderWatermarkHtml(logoDataUri) : ''
  const wordmark = brandWordmark(args.brand.slug)
  const docTitle = args.template.label

  // Pull masthead metadata from common input keys. Each financial template
  // surfaces its own period label / entity name, but we read a small set of
  // conventional keys that all of the financial templates use.
  const entityName =
    readString(args.inputs, 'entity_name') ||
    readString(args.inputs, 'taxpayer_name') ||
    readString(args.inputs, 'submitter_name') ||
    readString(args.inputs, 'person_name') ||
    args.preparedFor ||
    ''
  const periodLabel =
    readString(args.inputs, 'period_label') ||
    readString(args.inputs, 'month_label') ||
    readString(args.inputs, 'tax_year') ||
    ''
  const periodStart = readString(args.inputs, 'period_start') || readString(args.inputs, 'forecast_start_date')
  const periodEnd = readString(args.inputs, 'period_end')
  const preparedBy = readString(args.inputs, 'prepared_by') || ''
  const scenarioLabel = readString(args.inputs, 'scenario_label')

  const body = stripAllH1(stripLeadingTitle(args.contentHtml))

  return `<!doctype html>
<html lang="en">${sharedHead(palette, preset, docTitle)}
<style>
@page { size: 8.5in 11in; margin: 1.0in 0.9in 1.0in 0.9in; }
.fin-masthead {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 18pt;
  padding-bottom: 14pt;
  margin-bottom: 28pt;
  border-bottom: 0.75pt solid var(--accent);
}
.fin-wordmark {
  font-family: var(--font-body);
  font-size: 9pt;
  font-weight: 600;
  letter-spacing: 0.38em;
  color: var(--ink);
  margin: 0 0 6pt 0;
}
.fin-title {
  font-family: var(--font-display);
  font-style: italic;
  font-weight: 400;
  font-size: 26pt;
  line-height: 1.1;
  color: var(--ink);
  margin: 0 0 6pt 0;
}
.fin-period {
  font-family: var(--font-body);
  font-size: 11pt;
  font-weight: 500;
  color: var(--ink);
  margin: 0;
}
.fin-prepared {
  text-align: right;
  font-family: var(--font-body);
  font-size: 8pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--metadata);
}
.fin-prepared div + div { margin-top: 4pt; }
.fin-body { font-family: var(--font-body); font-size: 10pt; line-height: 1.6; color: var(--ink); }
.fin-body h2 {
  font-family: var(--font-display);
  font-weight: 500;
  font-size: 16pt;
  color: var(--ink);
  margin: 26pt 0 10pt 0;
}
.fin-body h2:first-child { margin-top: 0; }
.fin-body h3 {
  font-family: var(--font-body);
  font-size: 9pt;
  font-weight: 500;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--metadata);
  margin: 18pt 0 6pt 0;
}
.fin-body p { margin: 0 0 10pt 0; }
.fin-body ul, .fin-body ol { margin: 6pt 0 12pt 0; padding-left: 20pt; }
.fin-body li { margin-bottom: 4pt; }

/* Tables — monospace numerics, right-aligned amounts, subtle striping. */
.fin-body table,
.fin-body table.fin-table {
  width: 100%;
  border-collapse: collapse;
  margin: 12pt 0;
  font-variant-numeric: tabular-nums;
}
.fin-body table thead {
  display: table-header-group;
}
.fin-body table thead th {
  font-family: var(--font-body);
  font-size: 8pt;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--metadata);
  text-align: left;
  padding: 8pt 8pt 8pt 0;
  border-bottom: 0.5pt solid var(--accent);
  background: transparent;
}
.fin-body table tbody td {
  font-family: var(--font-body);
  font-size: 10pt;
  color: var(--ink);
  padding: 6pt 8pt 6pt 0;
  border-bottom: 0.25pt solid var(--hairline);
  vertical-align: top;
}
.fin-body table tbody tr:nth-child(even) td { background: rgba(0, 0, 0, 0.018); }
/* Numeric columns — right-aligned, tabular figures, monospace fall-back. */
.fin-body th.numeric,
.fin-body td.numeric,
.fin-body th:nth-last-child(-n+1),
.fin-body td:nth-last-child(-n+1) {
  text-align: right;
  font-family: var(--font-mono);
  white-space: nowrap;
}
.fin-body table tbody tr.subtotal-row td {
  border-top: 0.5pt solid var(--hairline);
  border-bottom: 0;
  font-style: italic;
  font-weight: 500;
  background: transparent;
}
.fin-body table tbody tr.total-row td {
  border-top: 1.5pt solid var(--ink);
  border-bottom: 0;
  font-weight: 700;
  font-size: 11pt;
  background: transparent;
}

/* Disclaimer — both the prominent first-section variant and the
   small-italic running footer variant. */
.fin-disclaimer-prominent {
  border: 0.5pt solid var(--ink);
  padding: 14pt 16pt;
  margin: 0 0 20pt 0;
  font-family: var(--font-body);
  font-size: 10pt;
  line-height: 1.5;
  color: var(--ink);
  background: rgba(0, 0, 0, 0.025);
}
.fin-disclaimer-prominent strong,
.fin-disclaimer-prominent b { font-weight: 700; }
${watermarkCss()}
</style>
<body>
<div class="fin-masthead">
  <div>
    <p class="fin-wordmark">${escapeHtml(wordmark)}</p>
    <h1 class="fin-title">${escapeHtml(docTitle)}</h1>
    ${
      periodLabel
        ? `<p class="fin-period">${escapeHtml(periodLabel)}</p>`
        : periodStart || periodEnd
          ? `<p class="fin-period">${escapeHtml([periodStart, periodEnd].filter(Boolean).join(' – '))}</p>`
          : ''
    }
    ${entityName ? `<p class="fin-period">${escapeHtml(entityName)}</p>` : ''}
    ${scenarioLabel ? `<p class="fin-period">Scenario: ${escapeHtml(scenarioLabel)}</p>` : ''}
  </div>
  <div class="fin-prepared">
    <div>Prepared ${escapeHtml(args.preparedDate)}</div>
    ${preparedBy ? `<div>By ${escapeHtml(preparedBy)}</div>` : ''}
    <div>${escapeHtml(args.documentId)}</div>
  </div>
</div>

<div class="fin-body">${body}</div>

${watermarkHtml}
</body>
</html>`
}

// Canonical disclaimer text per-template. Tax Estimate is liability-exposed
// and must show its disclaimer on every page footer; other templates leave
// the disclaimer blank. Callers can override via args.disclaimer.
const TEMPLATE_DISCLAIMERS: Record<string, string> = {
  'tax-estimate':
    'This document is an estimate prepared for planning purposes only. It is not tax advice, is not a substitute for professional tax preparation or legal advice, and does not create a tax-preparer relationship. Consult a licensed CPA or tax attorney before making any tax-related decisions, filing any return, or relying on these estimates. Tax laws change frequently and vary by jurisdiction.',
}

function resolveDisclaimer(args: BuildPdfArgs): string | undefined {
  if (args.disclaimer && args.disclaimer.trim().length > 0) return args.disclaimer
  return TEMPLATE_DISCLAIMERS[args.template.slug]
}

export async function buildPdf(args: BuildPdfArgs): Promise<Buffer> {
  // Resolve disclaimer once and thread it through both the rendered HTML
  // and the Playwright footer template.
  const resolvedArgs: BuildPdfArgs = {
    ...args,
    disclaimer: resolveDisclaimer(args),
  }
  args = resolvedArgs
  const html = buildFullHtml(args)
  const preset = resolvePreset(args.fontPreset?.key)
  const placement = args.logoPlacement ?? resolvePlacement(null)
  const layoutKey = (args.template.layout ?? 'contract') as
    | 'contract'
    | 'letter'
    | 'invoice'
    | 'one-pager'
    | 'minutes'
    | 'financial-statement'
  const flags = placementFlags(placement, layoutKey)
  const logoDataUri = resolveLogoDataUri(args.brand)
  const browser = await launchChromium()
  try {
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle' })
    const headerFooterColor = resolvePaletteForBuild(args).metadata
    // Playwright's header/footer templates run in an isolated context that
    // doesn't see our main-document CSS vars, so we inject the preset's
    // body font stack as a literal string here.
    const footerFontStack = preset.bodyFont.replace(/"/g, "'")
    // Disclaimer (e.g., Tax Estimate) — when set, it sits above the
    // page-number line on every page in small italic. Trim length so
    // long disclaimers don't overflow the footer band.
    const disclaimerHtml = args.disclaimer
      ? `<div style="font-style:italic;text-transform:none;letter-spacing:0;font-size:6.5pt;line-height:1.35;padding:0 1.25in 4pt 1.25in;color:${headerFooterColor};">${escapeHtml(args.disclaimer)}</div>`
      : ''
    const footerTemplate = `
      ${disclaimerHtml}
      <div style="width:100%;font-family:${footerFontStack};font-size:7pt;letter-spacing:0.18em;text-transform:uppercase;color:${headerFooterColor};padding:0 1.25in;display:flex;justify-content:space-between;">
        <span>${escapeHtml(brandWordmark(args.brand.slug))} · ${escapeHtml(args.template.label.toUpperCase())}</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `
    // Header template for the per-body-page logo mark. Empty when the
    // placement doesn't request a header mark; otherwise a small,
    // right-aligned logo at 60% opacity.
    const headerTemplate =
      flags.hasHeaderMark && logoDataUri
        ? `<div style="width:100%;padding:0 1.25in;display:flex;justify-content:flex-end;"><img src="${logoDataUri}" style="height:0.38in;opacity:0.6;" /></div>`
        : '<div></div>'
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
      headerTemplate,
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
