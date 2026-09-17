import { createHash, randomUUID } from 'node:crypto'
import { loadBrand, loadBrandPalette, applyPaletteOverride, DEFAULT_BRAND_PALETTE, type LoadedBrand, type BrandPalette } from '@/lib/apollo/brands'
import { resolvePreset } from '@/lib/apollo/font-presets'
import { resolvePlacement } from '@/lib/apollo/logo-placement'
import { orchestrate, chooseLayoutForSlug, shouldRenderToc, type OrchestrateUpload } from '@/lib/apollo/orchestrate'
import { findDeliverable, findIndustry, getModule, getSchema, getStyleById } from '@/lib/apollo/packages-loader'
import { buildPdf } from '@/lib/apollo/pdf'
import type { Template } from '@/lib/apollo/templates'
import { uploadSubmissionOutput } from '@/lib/apollo/storage'
import type { ArtifactManifest, DocumentSource, DocumentWorkOrder } from './contracts'
import { uploadDriveDraft } from './google-drive'
import { BUCKET, getFromS3 } from '@/lib/s3/client'
import { createServiceClient } from '@/lib/supabase/server'
import { MAX_EVIDENCE_BYTES } from '@/lib/mission-control/evidence'
import { cleanExecutionFields, isUsableExternalReference } from '@/lib/mission-control/field-quality'
import { verifyRenderedPdf } from './pdf-integrity'


async function loadExecutionBrand(order: DocumentWorkOrder): Promise<{ brand:LoadedBrand|null; palette:BrandPalette }> {
  if (!order.brand_id.startsWith('kit:')) return { brand:await loadBrand(order.brand_id), palette:await loadBrandPalette(order.brand_id) }
  const id = order.brand_id.slice(4)
  const db = await createServiceClient()
  const result = await db.from('apollo_brand_kits').select('id,name,primary_color,secondary_color,accent_color,heading_font,body_font,voice,source_storage_key,source_mime_type').eq('id',id).eq('user_id',order.requested_by).single()
  if (result.error || !result.data) return { brand:null, palette:DEFAULT_BRAND_PALETTE }
  const kit = result.data
  // Uploaded brand colors are identity accents, not reading colors. A bright
  // primary (On Spot green, safety yellow, etc.) must never become body ink.
  // Keep the neutral, high-contrast document ink and reserve the uploaded
  // palette for controlled rules, markers, and logo furniture.
  const palette = {
    ...DEFAULT_BRAND_PALETTE,
    accent:kit.accent_color || kit.primary_color || DEFAULT_BRAND_PALETTE.accent,
    metadata:kit.secondary_color || DEFAULT_BRAND_PALETTE.metadata,
  }
  const logoMime = kit.source_mime_type?.startsWith('image/') ? kit.source_mime_type : null
  const logoBytes = logoMime && kit.source_storage_key ? await getFromS3(kit.source_storage_key) : null
  const brand:LoadedBrand = { slug:order.brand_id, label:kit.name, logo_file:logoBytes ? kit.source_storage_key : null, logo_path:null, logo_bytes:logoBytes, logo_mime:logoMime, brand_md:[`# ${kit.name}`,kit.voice&&`Voice: ${kit.voice}`,kit.heading_font&&`Heading typeface: ${kit.heading_font}`,kit.body_font&&`Body typeface: ${kit.body_font}`,`Primary: ${palette.ink}`,`Accent: ${palette.accent}`].filter(Boolean).join('\n') }
  return { brand, palette }
}

function safeCode(value: string, length: number): string {
  return value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, length)
}

function filenamePart(value: unknown, fallback: string): string {
  const normalized = String(value ?? '').trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '')
  return normalized.slice(0, 48) || fallback
}

const IDENTITY_FIELDS={
  subject:['site_name','project_name','customer_name','prospect_organization','entity_name','contract_title'],
  date:['visit_date','report_date','quote_date','proposal_date','as_of_date','effective_date'],
  reference:['work_order_number','job_number','quote_number','rfp_reference','contract_number','policy_number'],
} as const

function firstIdentityField(order:DocumentWorkOrder,keys:readonly string[]):string|null{
  for(const key of keys){
    const value=String(order.fields[key]??'').trim()
    if(value)return value
  }
  return null
}

function deliverableLabelFallback(slug:string){
  if(slug==='fsr')return 'FSR'
  return slug.split('-').filter(Boolean).map(part=>part.charAt(0).toUpperCase()+part.slice(1)).join(' ')||'Deliverable'
}

export function buildDocumentIdentity(args: { order:DocumentWorkOrder; brandLabel:string; deliverableLabel?:string; generatedAt:Date; artifactVersion:number }) {
  const stamp = args.generatedAt.toISOString().slice(0, 10)
  const brandCode = safeCode(args.brandLabel, 3) || 'APL'
  const typeCode = safeCode(args.order.deliverable_type, 6) || 'DOC'
  const deliverableLabel=args.deliverableLabel?.trim()||deliverableLabelFallback(args.order.deliverable_type)
  const subject=firstIdentityField(args.order,IDENTITY_FIELDS.subject)
  const date=firstIdentityField(args.order,IDENTITY_FIELDS.date)||stamp
  const candidateReference=firstIdentityField(args.order,IDENTITY_FIELDS.reference)
  const customerReference=candidateReference&&isUsableExternalReference(candidateReference)?candidateReference:null
  const isFsr=args.order.deliverable_type==='fsr'
  const internalPrefix=isFsr?'SR':'DOC'
  const internalReference=`${brandCode}-${typeCode}-${stamp.replace(/-/g,'')}-${internalPrefix}-${safeCode(args.order.work_order_id,6)}`
  const referenceSegment=customerReference
    ? `${isFsr?'WO':'REF'}-${filenamePart(customerReference,'SOURCE')}`
    : `${internalPrefix}-${safeCode(args.order.work_order_id,6)}`
  const filename=[
    filenamePart(args.brandLabel,brandCode),
    filenamePart(deliverableLabel,args.order.deliverable_type),
    filenamePart(subject,isFsr?'Site':'Mission'),
    filenamePart(date,stamp),
    referenceSegment,
    `V${args.artifactVersion}`,
  ].join('_')+'.pdf'
  return { documentId:customerReference||internalReference,customerReference,filename }
}

function shouldHaveSignatureBlock(slug: string): boolean {
  return ['sow', 'proposal', 'contract-package', 'engagement-letter', 'nda', 'change-order'].includes(slug)
}

async function retrieveSource(source: DocumentSource): Promise<OrchestrateUpload> {
  const url = new URL(source.retrieval_url)
  if (url.protocol !== 'https:') throw new Error(`source ${source.source_id} must use HTTPS`)
  const region = process.env.AWS_REGION || 'us-east-1'
  const allowed = [...(process.env.APOLLO_SOURCE_ORIGINS ?? '').split(',').map((value) => value.trim()).filter(Boolean), `https://${BUCKET}.s3.${region}.amazonaws.com`, `https://${BUCKET}.s3.amazonaws.com`]
  if (allowed.length === 0 || !allowed.includes(url.origin)) throw new Error(`source ${source.source_id} origin is not allowed`)
  if (Date.parse(source.expires_at) <= Date.now()) throw new Error(`source ${source.source_id} URL expired`)
  const response = await fetch(url, { signal: AbortSignal.timeout(30_000), redirect: 'error' })
  if (!response.ok) throw new Error(`source ${source.source_id} returned ${response.status}`)
  const declared = Number(response.headers.get('content-length') ?? 0)
  if (declared > MAX_EVIDENCE_BYTES) throw new Error(`source ${source.source_id} exceeds size limit`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > MAX_EVIDENCE_BYTES) throw new Error(`source ${source.source_id} exceeds size limit`)
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
  const { brand } = await loadExecutionBrand(order)
  if (!moduleData || !schema || !style || !brand) throw new Error('document module, schema, style, or brand is unavailable')
  const cleanedFields = cleanExecutionFields(order.fields)
  const internallyControlledFsrFields=new Set(order.deliverable_type==='fsr'?['work_order_number','equipment_asset_id']:[])
  const missing = moduleData.required_fields.filter((field) => {
    if(internallyControlledFsrFields.has(field.key))return false
    const value = cleanedFields[field.key]
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
    fields: cleanedFields,
    uploads,
  })
  return { output: generated.output, contentHtml: generated.contentHtml, warnings: generated.warnings, quality: generated.quality }
}

export async function renderAndStorePdf(order: DocumentWorkOrder, contentHtml: string, output: Record<string, unknown>): Promise<ArtifactManifest> {
  const summary = findDeliverable(order.deliverable_type)
  const moduleData = getModule(order.deliverable_type)
  const { brand, palette } = await loadExecutionBrand(order)
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
  const requestedVersion = Number(order.fields.artifact_version ?? 1)
  const artifactVersion = Number.isSafeInteger(requestedVersion) && requestedVersion > 0 ? requestedVersion : 1
  const cleanedFields = cleanExecutionFields(order.fields)
  const identity = buildDocumentIdentity({ order:{ ...order, fields:cleanedFields }, brandLabel:brand.label, deliverableLabel:summary.label, generatedAt:now, artifactVersion })
  const pdf = await buildPdf({
    template,
    brand,
    inputs: { ...cleanedFields, apollo_service_record_id:identity.documentId, customer_work_order_number:identity.customerReference ?? '' },
    contentHtml,
    documentId: identity.documentId,
    preparedDate: now.toISOString(),
    palette: applyPaletteOverride(palette, undefined),
    fontPreset: resolvePreset(undefined),
    logoPlacement: resolvePlacement(undefined),
  })
  // Parse the exact bytes that will be stored and delivered. HTML workmanship
  // cannot prove that Chromium emitted a complete, readable PDF artifact.
  const integrity=await verifyRenderedPdf(pdf)
  const digest = createHash('sha256').update(pdf).digest('hex')
  const filename = identity.filename
  await uploadSubmissionOutput({
    submissionId: order.work_order_id,
    pdfBuffer: pdf,
    filename,
    submissionJson: { work_order: order, output, content_sha256: digest, lifecycle: 'draft' },
  })
  const drive = await uploadDriveDraft({
    userId: order.requested_by,
    folderId: order.drive_destination.folder_id,
    workOrderId: order.work_order_id,
    filename,
    contentSha256: digest,
    pdf,
  })
  return {
    artifact_id: randomUUID(),
    project_id: order.project_id,
    conversation_id: order.conversation_id,
    task_id: order.task_id,
    title: summary.label,
    filename,
    document_id:identity.documentId,
    deliverable_type:order.deliverable_type,
    brand_id:order.brand_id,
    style_id:order.style_id,
    specification_id:order.trace?.specification_id,
    specification_hash:order.trace?.specification_hash,
    artifact_type: 'document',
    lifecycle: 'draft',
    storage_provider: 'google-drive',
    storage_file_id: drive.fileId,
    storage_parent_id: drive.parentId,
    web_view_url: drive.webViewLink,
    version: artifactVersion,
    content_sha256: digest,
    mime_type: 'application/pdf',
    source_engine_id: 'apollo-documents',
    source_run_id: order.work_order_id,
    integrity:{...integrity,verified_at:now.toISOString()},
    created_at: now.toISOString(),
  }
}
