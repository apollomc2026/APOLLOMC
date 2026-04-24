// html-to-docx has no published type definitions.
// @ts-expect-error — no types published for html-to-docx
import htmlToDocxModule from 'html-to-docx'
import sharp from 'sharp'

type HtmlToDocxFn = (
  html: string,
  header?: string | null,
  options?: Record<string, unknown>,
  footer?: string | null
) => Promise<Buffer | Blob | ArrayBuffer>

const htmlToDocx = htmlToDocxModule as unknown as HtmlToDocxFn

export interface BuildDocxArgs {
  contentHtml: string
  title: string
  brandLabel: string
  brandLogo: { bytes: Buffer; mime: string } | null
  images: { bytes: Buffer; mime: string; filename: string }[]
  templateLabel: string
  templateSlug: string
  hasSignatureBlock: boolean
  inputs: Record<string, unknown>
}

// Logo: pre-scale the PNG so its intrinsic pixel dimensions are already capped.
// html-to-docx derives DOCX <wp:extent cx=.. cy=..> (EMU) from HTML width/
// height attrs, but it will also default-scale to page width if those attrs
// get ignored. Pre-scaling the binary + emitting explicit width/height +
// inline style = three independent caps. All must hold for the logo to
// exceed 1.5in, which it won't.
// html-to-docx maps HTML px → EMU via px × 9525 (96 DPI). 144px = 1.5 in
// exactly; we use 130 to leave a small margin under the cap.
const LOGO_TARGET_PX = 130
const MAX_ATTACHMENT_WIDTH_PX = 550

function dataUri(bytes: Buffer, mime: string): string {
  return `data:${mime};base64,${bytes.toString('base64')}`
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

async function resolveImageDims(
  bytes: Buffer,
  maxWidthPx: number
): Promise<{ width: number; height: number }> {
  try {
    const meta = await sharp(bytes).metadata()
    const nativeW = meta.width ?? 0
    const nativeH = meta.height ?? 0
    if (nativeW <= 0 || nativeH <= 0) {
      return { width: maxWidthPx, height: maxWidthPx }
    }
    if (nativeW <= maxWidthPx) {
      return { width: nativeW, height: nativeH }
    }
    const scale = maxWidthPx / nativeW
    return {
      width: maxWidthPx,
      height: Math.max(1, Math.round(nativeH * scale)),
    }
  } catch {
    return { width: maxWidthPx, height: maxWidthPx }
  }
}

async function buildHeaderBlock(args: BuildDocxArgs): Promise<string> {
  let logoBlock = ''
  if (args.brandLogo) {
    const scaledBytes = await sharp(args.brandLogo.bytes)
      .resize(LOGO_TARGET_PX, null, { fit: 'inside', withoutEnlargement: true })
      .png()
      .toBuffer()
    const dims = await resolveImageDims(scaledBytes, LOGO_TARGET_PX)
    logoBlock = `<img src="${dataUri(scaledBytes, 'image/png')}" alt="${escapeHtml(args.brandLabel)} logo" width="${dims.width}" height="${dims.height}" />`
  }
  const brandLine =
    args.brandLabel === 'Other'
      ? ''
      : `<p style="margin:0;font-size:10pt;color:#555555;">${escapeHtml(args.brandLabel)}</p>`
  return `
    <div style="border-bottom:1px solid #DDDDDD;padding-bottom:10px;margin-bottom:18px;">
      ${logoBlock}
      ${brandLine}
    </div>
  `
}

async function buildAttachmentsBlock(images: BuildDocxArgs['images']): Promise<string> {
  if (images.length === 0) return ''
  const figures = await Promise.all(
    images.map(async (img, i) => {
      const dims = await resolveImageDims(img.bytes, MAX_ATTACHMENT_WIDTH_PX)
      return `
        <div style="margin:12px 0;">
          <p style="font-weight:600;margin:0 0 4px 0;">Figure ${i + 1}</p>
          <img src="${dataUri(img.bytes, img.mime)}" alt="${escapeHtml(img.filename)}" width="${dims.width}" height="${dims.height}" />
          <p style="font-size:9pt;color:#666666;margin:2px 0 0 0;">${escapeHtml(img.filename)}</p>
        </div>
      `
    })
  )
  return `
    <div style="margin-top:24px;padding-top:12px;border-top:1px solid #DDDDDD;">
      <h2 style="font-size:14pt;color:#2B2B2B;">Attachments</h2>
      ${figures.join('\n')}
    </div>
  `
}

// Per-template party configuration for the signature block. The DOCX builder
// owns the signature block — Claude never emits one. Each party maps to a
// role label (shown in small caps above the typed name) and an optional
// user-input field whose value becomes the typed name.
type SignatureParty = { label: string; nameField?: string }
const SIGNATURE_PARTIES: Record<string, SignatureParty[]> = {
  nda: [
    { label: 'DISCLOSING PARTY', nameField: 'disclosing_party' },
    { label: 'RECEIVING PARTY', nameField: 'receiving_party' },
  ],
  sow: [
    { label: 'CLIENT', nameField: 'client_name' },
    { label: 'PROVIDER' },
  ],
  'engagement-letter': [
    { label: 'CLIENT', nameField: 'client_name' },
    { label: 'PROVIDER' },
  ],
  'change-order': [
    { label: 'CLIENT', nameField: 'client_name' },
    { label: 'PROVIDER' },
  ],
  proposal: [
    { label: 'CLIENT', nameField: 'prospect_organization' },
    { label: 'PROVIDER' },
  ],
  'incident-report': [
    { label: 'REPORTER', nameField: 'reporter_name' },
  ],
  fsr: [
    { label: 'TECHNICIAN', nameField: 'technician_name' },
    { label: 'CUSTOMER', nameField: 'customer_signature_name' },
  ],
}

function readInputString(inputs: Record<string, unknown>, key: string): string {
  const v = inputs[key]
  if (v === undefined || v === null) return ''
  if (typeof v === 'string') return v.trim()
  return String(v)
}

function signatureCell(party: SignatureParty, inputs: Record<string, unknown>): string {
  // html-to-docx has a bug serializing table cells that carry inline styles —
  // some CSS→WordprocessingML attribute mappings produce invalid XML names
  // like "@w". Keep styles OFF the <td>/<tr>/<table> tags. Text-level styling
  // on <p> inside cells is fine.
  const typedName = party.nameField ? readInputString(inputs, party.nameField) : ''
  const nameLine = typedName
    ? `<p style="font-weight:700;font-size:11pt;color:#1A1A1A;margin:0 0 4pt 0;">${escapeHtml(typedName)}</p>`
    : `<p style="font-size:11pt;color:#555555;margin:0 0 4pt 0;">(Name)</p>`
  // Use underscores as the signature line — Word renders them as a visible
  // writing line and they survive html-to-docx without any CSS.
  const line = '________________________________________'
  return `
    <td>
      <p style="font-weight:700;font-size:9pt;color:#555555;margin:0 0 4pt 0;">${escapeHtml(party.label)}</p>
      ${nameLine}
      <p style="margin:24pt 0 0 0;">${line}</p>
      <p style="font-size:9pt;color:#555555;margin:0;">Signature</p>
      <p style="margin:18pt 0 0 0;">${line}</p>
      <p style="font-size:9pt;color:#555555;margin:0;">Date</p>
    </td>
  `
}

function buildSignatureBlock(args: BuildDocxArgs): string {
  if (!args.hasSignatureBlock) return ''
  const parties = SIGNATURE_PARTIES[args.templateSlug] ?? [
    { label: 'PARTY A' },
    { label: 'PARTY B' },
  ]
  const cells = parties.map((p) => signatureCell(p, args.inputs)).join('\n')
  // Pad single-party config with an empty cell so the table is always 2 cells wide.
  const padCell = parties.length === 1 ? `<td>&nbsp;</td>` : ''
  return `
    <div style="margin-top:28pt;">
      <h2 style="font-size:12pt;color:#0A1628;margin:0 0 10pt 0;">Signatures</h2>
      <table>
        <tr>
          ${cells}
          ${padCell}
        </tr>
      </table>
    </div>
  `
}

// html-to-docx@1.8.0 has a serializer bug where mapping certain CSS properties
// (letter-spacing, text-transform, font-family with a stack, etc.) from an
// inline style attribute into WordprocessingML produces an invalid XML Name
// such as "@w" and throws mid-serialization. Rather than whitelist safe CSS
// properties one at a time, strip every inline style attribute from Claude's
// output before handing it to html-to-docx. We keep the structural tags
// (h1/h2/p/ul/table) and rely on DOCX's default typography — the brand logo,
// title, and signature block live in pipeline-owned blocks we construct
// ourselves and are unaffected.
//
// Also strip <style>/<script> blocks defensively and drop attributes whose
// names start with "@".
function sanitizeForDocx(html: string): string {
  let out = html
  out = out.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  out = out.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '')
  out = out.replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*')/gi, '')
  out = out.replace(/<[^>]*>/g, (tag) => tag.replace(/@/g, ''))
  return out
}

// Normalize whitespace in Claude's output to avoid "     ATL A S       "
// style runs of non-breaking space that Claude sometimes emits when trying
// to lay out decorative titles. We preserve structural whitespace between
// block elements but collapse runs inside paragraphs and trim leading/
// trailing whitespace at block boundaries.
// Block-level tags whose interior whitespace is structural indentation from
// our template literals rather than meaningful content. Collapse it.
const BLOCK_TAGS =
  '(?:html|head|body|div|p|h[1-6]|ul|ol|li|table|thead|tbody|tfoot|tr|td|th|section|article|header|footer)'

function normalizeWhitespace(html: string): string {
  let out = html
    // Normalize non-breaking spaces that weren't intended as layout
    .replace(/&nbsp;/g, ' ')
  // Collapse whitespace between block-level tags (template-literal indentation)
  out = out.replace(new RegExp(`>\\s+<(/?${BLOCK_TAGS})`, 'gi'), '><$1')
  // Trim leading/trailing whitespace inside block elements
  out = out
    .replace(/(<p[^>]*>)\s+/gi, '$1')
    .replace(/\s+(<\/p>)/gi, '$1')
    .replace(/(<h([1-6])[^>]*>)\s+/gi, '$1')
    .replace(/\s+(<\/h[1-6]>)/gi, '$1')
    .replace(/(<li[^>]*>)\s+/gi, '$1')
    .replace(/\s+(<\/li>)/gi, '$1')
    .replace(/(<td[^>]*>)\s+/gi, '$1')
    .replace(/\s+(<\/td>)/gi, '$1')
  // Collapse runs of multiple spaces INSIDE text content
  out = out.replace(/ {2,}/g, ' ')
  // Collapse runs of empty paragraphs
  out = out.replace(/(<p[^>]*>\s*<\/p>\s*){2,}/gi, '<p></p>')
  return out.trim()
}

export async function buildDocx(args: BuildDocxArgs): Promise<Buffer> {
  const [header, attachments] = await Promise.all([
    buildHeaderBlock(args),
    buildAttachmentsBlock(args.images),
  ])
  const signatureBlock = buildSignatureBlock(args)
  const sanitizedContent = normalizeWhitespace(sanitizeForDocx(args.contentHtml))

  // Pipeline-owned blocks are built from template literals; their indentation
  // whitespace leaks into Word as visible preserve-space runs. Run the full
  // assembled body through the same whitespace normalizer to strip those.
  const fullHtml = normalizeWhitespace(
    `<html><head><meta charset="utf-8"></head><body>${header}<div>${sanitizedContent}</div>${signatureBlock}${attachments}</body></html>`
  )

  // Real page number field via html-to-docx's built-in footer. When both
  // `footer: true` and `pageNumber: true` are set the library emits a
  // Word PAGE field rather than a literal string, and Word resolves it
  // to the current page when the document is opened.
  const options: Record<string, unknown> = {
    table: { row: { cantSplit: true } },
    font: 'Calibri',
    footer: true,
    pageNumber: true,
  }

  let result: Buffer | Blob | ArrayBuffer
  try {
    result = await htmlToDocx(fullHtml, null, options)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const atWIndex = args.contentHtml.indexOf('@w')
    const atWContext =
      atWIndex >= 0
        ? `raw_at_w_context="${args.contentHtml.slice(Math.max(0, atWIndex - 80), atWIndex + 80).replace(/\s+/g, ' ')}"`
        : 'raw_at_w_context=(none_found_in_raw_html)'
    const sanContext = sanitizedContent.indexOf('@w') >= 0
      ? `san_at_w=present`
      : 'san_at_w=absent'
    const fullAtWIndex = fullHtml.indexOf('@w')
    const fullAtWContext =
      fullAtWIndex >= 0
        ? `full_at_w_context="${fullHtml.slice(Math.max(0, fullAtWIndex - 120), fullAtWIndex + 120).replace(/\s+/g, ' ')}"`
        : 'full_at_w_context=(none_found_in_full_html)'
    const contentHead = sanitizedContent.slice(0, 500).replace(/\s+/g, ' ')
    throw new Error(
      `html-to-docx failed: ${msg} :: ${atWContext} :: ${sanContext} :: ${fullAtWContext} :: content_head="${contentHead}"`
    )
  }

  if (Buffer.isBuffer(result)) return result
  if (result instanceof ArrayBuffer) return Buffer.from(result)
  if (typeof (result as Blob).arrayBuffer === 'function') {
    const ab = await (result as Blob).arrayBuffer()
    return Buffer.from(ab)
  }
  throw new Error('html-to-docx returned an unexpected type')
}
