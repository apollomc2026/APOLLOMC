import { createHash, randomUUID } from 'node:crypto'
import { loadBrand, loadBrandPalette, applyPaletteOverride } from '@/lib/apollo/brands'
import { resolvePreset } from '@/lib/apollo/font-presets'
import { resolvePlacement } from '@/lib/apollo/logo-placement'
import { orchestrate, chooseLayoutForSlug, shouldRenderToc, type OrchestrateUpload } from '@/lib/apollo/orchestrate'
import { findDeliverable, findIndustry, getModule, getSchema, getStyleById } from '@/lib/apollo/packages-loader'
import { buildPdf } from '@/lib/apollo/pdf'
import type { Template } from '@/lib/apollo/templates'
import { uploadSubmissionOutput } from '@/lib/apollo/storage'
import type { ArtifactManifest, DocumentSource, DocumentWorkOrder } from './contracts'

const MAX_SOURCE_BYTES = 10 * 1024 * 1024

function safeCode(value: string, length: number): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, length)
}

function shouldHaveSignatureBlock(slug: string): boolean {
  return ['sow', 'proposal', 'contract-package', 'engagement-letter', 'nda'].includes(slug)
}

async function retrieveSource(source: DocumentSource): Promise<OrchestrateUpload> {
  const url = new URL(source.retrieval_url)
  if (url.protocol !== 'https:') throw new Error(`source ${source.source_id} must use HTTPS`)
  const allowed = (process.env.APOLLO_SOURCE_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean)
  if (allowed.length === 0 || !allowed.includes(url.origin)) throw new Error(`source ${source.source_id} origin is not allowed`)
  if (Date.parse(source.expires_at) <= Date.now()) throw new Error(`source ${source.source_id} URL expired`)
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: 'error' })
  if (!response.ok) throw new Error(`source ${source.source_id} returned ${response.status}`)
  const declared = Number(response.headers.get('content-length') ?? 0)
  if (declared > MAX_SOURCE_BYTES) throw new Error(`source ${source.source_id} exceeds size limit`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > MAX_SOURCE_BYTES) throw new Error(`source ${source.source_id} exceeds size limit`)
  const digest = createHash('sha256').update(bytes).digest('hex')
  if (digest !== source.content_sha256) throw new Error(`source ${source.source_id} failed integrity verification`)
  const inline = source.media_type.startsWith('image/') || source.media_type === 'application/pdf'
  const text = source.media_type.startsWith('text/') || source.media_type === 'application/json'
  if (!inline && !text) throw new Error(`source ${source.source_id} requires extraction before execution`)
  return {
    id: source.source_id,
    upload_kind: 'reference_doc',
    original_filename: source.name,
    content_type: source.media_type,
    size_bytes: bytes.length,
    caption: null,
    extracted_text: text ? bytes.toString('utf8').slice(0, 80000) : null,
    bytes: inline ? bytes : null,
  }
}

export async function generateStructuredDocument(order: DocumentWorkOrder) {
  const summary = findDeliverable(order.deliverable_type)
  if (!summary) throw new Error('unknown deliverable_type')
  const industry = findIndustry(summary.industry_slug)
  if (!industry || industry.status !== 'active') throw new Error('deliverable is not active')
  const moduleData = getModule(order.deliverable_type)
  const schema = getSchema(order.deliverable_type)
  const style = getStyleById(order.style_id)
  const brand = await loadBrand(order.brand_id)
  if (!moduleData || !schema || !style || !brand) throw new Error('document module, schema, style, or brand is unavailable')
  const missing = moduleData.required_fields.filter((field) => {
    const value = order.fields[field.key]
    return value === undefined || value === null || (typeof value === 'string' && value.trim() === '')
  }).map((field) => field.key)
  if (missing.length) {
    const error = new Error(`missing required fields: ${missing.join(', ')}`)
    ;(error as Error & { missingInputs?: string[] }).missingInputs = missing
    throw error
  }
  const uploads = await Promise.all(order.sources.map(retrieveSource))
  const generated = await orchestrate({
    slug: order.deliverable_type,
    deliverableLabel: summary.label,
    industryLabel: summary.industry_label,
    module: moduleData,
    schema: schema as Record<string, unknown>,
    style,
    brand,
    fields: order.fields,
    uploads,
  })
  return { output: generated.output, contentHtml: generated.contentHtml, warnings: generated.warnings }
}

export async function renderAndStorePdf(order: DocumentWorkOrder, contentHtml: string, output: Record<string, unknown>): Promise<ArtifactManifest> {
  const summary = findDeliverable(order.deliverable_type)
  const moduleData = getModule(order.deliverable_type)
  const brand = await loadBrand(order.brand_id)
  if (!summary || !moduleData || !brand) throw new Error('render inputs are unavailable')
  const template: Template = {
    slug: order.deliverable_type,
    label: summary.label,
    description: summary.description,
    category: summary.industry_slug,
    supports_images: true,
    has_signature_block: shouldHaveSignatureBlock(order.deliverable_type),
    has_toc: shouldRenderToc(order.deliverable_type),
    layout: chooseLayoutForSlug(order.deliverable_type),
    fields: [],
    sections: moduleData.sections.map((section) => ({ id: section.key, title: section.label })),
    generation_notes: '',
  }
  const now = new Date()
  const stamp = now.toISOString().slice(0, 10)
  const pdf = await buildPdf({
    template,
    brand,
    inputs: order.fields,
    contentHtml,
    documentId: `${safeCode(order.brand_id, 3)}-${safeCode(order.deliverable_type, 6)}-${stamp}-${order.work_order_id.slice(0, 6)}`,
    preparedDate: now.toISOString(),
    palette: applyPaletteOverride(await loadBrandPalette(order.brand_id), undefined),
    fontPreset: resolvePreset(undefined),
    logoPlacement: resolvePlacement(undefined),
  })
  const digest = createHash('sha256').update(pdf).digest('hex')
  const filename = `${order.deliverable_type}_${order.project_id}_${stamp}_${order.work_order_id.slice(0, 6)}.pdf`
  const stored = await uploadSubmissionOutput({
    submissionId: order.work_order_id,
    pdfBuffer: pdf,
    filename,
    submissionJson: { work_order: order, output, content_sha256: digest, lifecycle: 'draft' },
  })
  return {
    artifact_id: randomUUID(),
    project_id: order.project_id,
    conversation_id: order.conversation_id,
    task_id: order.task_id,
    title: summary.label,
    artifact_type: 'document',
    lifecycle: 'draft',
    storage_provider: 's3',
    storage_file_id: stored.s3Key,
    storage_parent_id: stored.s3Prefix,
    version: 1,
    content_sha256: digest,
    mime_type: 'application/pdf',
    source_engine_id: 'apollo-documents',
    source_run_id: order.work_order_id,
    created_at: now.toISOString(),
  }
}
