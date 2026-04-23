// html-to-docx has no published type definitions.
// @ts-expect-error — no types published for html-to-docx
import htmlToDocxModule from 'html-to-docx'

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
}

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

function buildHeaderBlock(args: BuildDocxArgs): string {
  const logoBlock = args.brandLogo
    ? `<img src="${dataUri(args.brandLogo.bytes, args.brandLogo.mime)}" alt="${escapeHtml(args.brandLabel)} logo" style="max-height:56px;max-width:220px;" />`
    : ''
  const brandLine = args.brandLabel === 'Other' ? '' : `<p style="margin:0;font-size:10pt;color:#555;">${escapeHtml(args.brandLabel)}</p>`
  return `
    <div style="border-bottom:1px solid #DDD;padding-bottom:10px;margin-bottom:18px;">
      ${logoBlock}
      ${brandLine}
      <h1 style="margin:8px 0 0 0;font-size:20pt;color:#2B2B2B;">${escapeHtml(args.title)}</h1>
      <p style="margin:2px 0 0 0;font-size:9pt;color:#888;">${escapeHtml(args.templateLabel)}</p>
    </div>
  `
}

function buildAttachmentsBlock(images: BuildDocxArgs['images']): string {
  if (images.length === 0) return ''
  const figures = images
    .map(
      (img, i) => `
        <div style="margin:12px 0;">
          <p style="font-weight:600;margin:0 0 4px 0;">Figure ${i + 1}</p>
          <img src="${dataUri(img.bytes, img.mime)}" alt="${escapeHtml(img.filename)}" style="max-width:100%;max-height:400px;" />
          <p style="font-size:9pt;color:#666;margin:2px 0 0 0;">${escapeHtml(img.filename)}</p>
        </div>
      `
    )
    .join('\n')
  return `
    <div style="margin-top:24px;padding-top:12px;border-top:1px solid #DDD;">
      <h2 style="font-size:14pt;color:#2B2B2B;">Attachments</h2>
      ${figures}
    </div>
  `
}

export async function buildDocx(args: BuildDocxArgs): Promise<Buffer> {
  const header = buildHeaderBlock(args)
  const attachments = buildAttachmentsBlock(args.images)

  const fullHtml = `
    <html><head><meta charset="utf-8"></head><body>
      ${header}
      <div>${args.contentHtml}</div>
      ${attachments}
    </body></html>
  `

  const result = await htmlToDocx(fullHtml, null, {
    table: { row: { cantSplit: true } },
    font: 'Calibri',
  })

  if (Buffer.isBuffer(result)) return result
  if (result instanceof ArrayBuffer) return Buffer.from(result)
  // Blob fallback (older Node runtimes where html-to-docx returned Blob)
  if (typeof (result as Blob).arrayBuffer === 'function') {
    const ab = await (result as Blob).arrayBuffer()
    return Buffer.from(ab)
  }
  throw new Error('html-to-docx returned an unexpected type')
}
