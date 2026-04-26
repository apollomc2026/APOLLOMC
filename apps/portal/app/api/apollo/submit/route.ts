import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { loadTemplate, validateInputs, type Template } from '@/lib/apollo/templates'
import {
  loadBrand,
  isAllowedBrandSlug,
  loadBrandPalette,
  applyPaletteOverride,
  type BrandPalette,
} from '@/lib/apollo/brands'
import { generateDocumentHtml, type ImageInput } from '@/lib/apollo/generate'
import { buildPdf } from '@/lib/apollo/pdf'
import { resolvePreset, isValidPresetKey } from '@/lib/apollo/font-presets'
import { resolvePlacement, isValidPlacementKey } from '@/lib/apollo/logo-placement'
import { uploadSubmissionOutput } from '@/lib/apollo/storage'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser, type AuthedUser } from '@/lib/apollo/auth'
import {
  findDeliverable,
  findIndustry,
  getModule,
  getSchema,
  getStyleById,
  getStylesForIndustry,
} from '@/lib/apollo/packages-loader'
import {
  orchestrate,
  OrchestrateError,
  chooseLayoutForSlug,
  shouldRenderToc,
  type OrchestrateUpload,
} from '@/lib/apollo/orchestrate'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const MAX_IMAGES = 10
const MAX_IMAGE_BYTES = 5 * 1024 * 1024

function isAllowedMime(mime: string): boolean {
  return ['image/jpeg', 'image/png', 'image/webp'].includes(mime)
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 8)
}

function todayStamp(): string {
  const d = new Date()
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`
}

// Human-friendly prepared date ("24 April 2026") for the PDF cover. Accepts
// anything Date.parse can handle; falls back to today.
function formatPreparedDate(input: string | undefined): string {
  const d = input ? new Date(input) : new Date()
  if (Number.isNaN(d.getTime())) return formatPreparedDate(undefined)
  const months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  return `${d.getUTCDate()} ${months[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function POST(request: Request) {
  const cors = corsHeaders(request)
  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
  }

  // Branch by content type. The unified-catalog flow posts JSON
  // (referencing apollo_uploads rows by id). The legacy intake page
  // posts multipart FormData (with images attached inline). Both
  // shapes coexist while the frontend transitions.
  const contentType = (request.headers.get('content-type') || '').toLowerCase()
  if (contentType.includes('application/json')) {
    return handleJsonSubmit(request, cors, auth.user)
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return NextResponse.json({ error: 'invalid form data' }, { status: 400, headers: cors })
  }

  const templateSlug = String(form.get('template_slug') ?? '')
  const brandSlug = String(form.get('brand_slug') ?? '')
  const inputsRaw = String(form.get('inputs') ?? '{}')
  const fontPresetRaw = form.get('font_preset')
  const logoPlacementRaw = form.get('logo_placement')
  const paletteOverrideRaw = form.get('palette_override')

  if (!templateSlug || !brandSlug) {
    return NextResponse.json(
      { error: 'template_slug and brand_slug are required' },
      { status: 400, headers: cors }
    )
  }
  if (!isAllowedBrandSlug(brandSlug)) {
    return NextResponse.json({ error: 'invalid brand_slug' }, { status: 400, headers: cors })
  }

  // Validate optional visual controls. Reject obviously-bogus values with
  // a clean 400; silently accept absence (falls through to defaults).
  let fontPresetKey: string | undefined
  if (fontPresetRaw !== null) {
    const candidate = String(fontPresetRaw)
    if (candidate.length > 0) {
      if (!isValidPresetKey(candidate)) {
        return NextResponse.json(
          { error: `invalid font_preset: ${candidate}` },
          { status: 400, headers: cors }
        )
      }
      fontPresetKey = candidate
    }
  }
  let logoPlacementKey: string | undefined
  if (logoPlacementRaw !== null) {
    const candidate = String(logoPlacementRaw)
    if (candidate.length > 0) {
      if (!isValidPlacementKey(candidate)) {
        return NextResponse.json(
          { error: `invalid logo_placement: ${candidate}` },
          { status: 400, headers: cors }
        )
      }
      logoPlacementKey = candidate
    }
  }
  let paletteOverride: Partial<BrandPalette> | undefined
  if (paletteOverrideRaw !== null) {
    const raw = String(paletteOverrideRaw).trim()
    if (raw.length > 0) {
      try {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
          paletteOverride = parsed as Partial<BrandPalette>
        } else {
          throw new Error('palette_override must be a JSON object')
        }
      } catch (err) {
        return NextResponse.json(
          { error: `invalid palette_override JSON: ${(err as Error).message}` },
          { status: 400, headers: cors }
        )
      }
    }
  }

  let template
  try {
    template = await loadTemplate(templateSlug)
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[apollo/submit] templates load failed', err)
    return NextResponse.json(
      { error: 'templates load failed: ' + message },
      { status: 500, headers: cors }
    )
  }
  if (!template) {
    return NextResponse.json({ error: 'unknown template' }, { status: 400, headers: cors })
  }

  let inputs: Record<string, unknown>
  try {
    inputs = JSON.parse(inputsRaw)
    if (inputs === null || typeof inputs !== 'object' || Array.isArray(inputs)) {
      throw new Error('inputs must be an object')
    }
  } catch (err) {
    return NextResponse.json(
      { error: `invalid inputs JSON: ${(err as Error).message}` },
      { status: 400, headers: cors }
    )
  }

  const validation = validateInputs(template, inputs)
  if (!validation.ok) {
    return NextResponse.json(
      { error: 'missing required fields', missing: validation.missing },
      { status: 400, headers: cors }
    )
  }

  const brand = await loadBrand(brandSlug)
  if (!brand) {
    return NextResponse.json({ error: 'unknown brand' }, { status: 400, headers: cors })
  }

  // Load brand-canonical palette from brand.md and apply any per-submission
  // override on top. Font preset and logo placement are resolved with the
  // validated keys; sensible defaults fall through when the user didn't set
  // them in the form.
  const basePalette = await loadBrandPalette(brandSlug)
  const palette = applyPaletteOverride(basePalette, paletteOverride)
  const fontPreset = resolvePreset(fontPresetKey)
  const logoPlacement = resolvePlacement(logoPlacementKey)

  const imageFiles: File[] = []
  for (const value of form.getAll('images')) {
    if (value instanceof File && value.size > 0) imageFiles.push(value)
  }
  if (imageFiles.length > MAX_IMAGES) {
    return NextResponse.json(
      { error: `too many images — max ${MAX_IMAGES}` },
      { status: 400, headers: cors }
    )
  }
  for (const file of imageFiles) {
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json(
        { error: `image ${file.name} exceeds 5MB limit` },
        { status: 400, headers: cors }
      )
    }
    if (!isAllowedMime(file.type)) {
      return NextResponse.json(
        { error: `image ${file.name} has unsupported type ${file.type}` },
        { status: 400, headers: cors }
      )
    }
  }

  const images: ImageInput[] = []
  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = Buffer.from(arrayBuffer)
    images.push({ mime: file.type, base64: bytes.toString('base64'), filename: file.name })
  }

  const serviceClient = await createServiceClient()

  // Try the full insert including the new PDF-option columns (migration 005).
  // If those columns aren't in the schema yet (migration not applied), fall
  // back to the original column set so the route keeps working while Jon
  // applies the migration manually.
  const fullInsertRow = {
    template_slug: templateSlug,
    brand_slug: brandSlug,
    inputs,
    image_count: images.length,
    status: 'generating',
    user_id: auth.user.userId,
    user_email: auth.user.email,
    font_preset: fontPreset.key,
    logo_placement: logoPlacement.key,
    palette_override: paletteOverride ?? null,
  }
  let { data: insertRow, error: insertErr } = await serviceClient
    .from('apollo_submissions')
    .insert(fullInsertRow)
    .select('id')
    .single()

  if (insertErr && insertErr.code === '42703') {
    // Postgres "undefined_column" — migration 005 not applied. Retry without.
    const fallback = { ...fullInsertRow } as Record<string, unknown>
    delete fallback.font_preset
    delete fallback.logo_placement
    delete fallback.palette_override
    const retry = await serviceClient
      .from('apollo_submissions')
      .insert(fallback)
      .select('id')
      .single()
    insertRow = retry.data
    insertErr = retry.error
  }

  if (insertErr || !insertRow) {
    return NextResponse.json(
      { error: `failed to create submission: ${insertErr?.message ?? 'unknown error'}` },
      { status: 500, headers: cors }
    )
  }

  const submissionId = insertRow.id as string

  async function fail(message: string): Promise<NextResponse> {
    await serviceClient
      .from('apollo_submissions')
      .update({
        status: 'failed',
        error_message: message.slice(0, 2000),
        completed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
    return NextResponse.json(
      { error: message, submission_id: submissionId },
      { status: 500, headers: cors }
    )
  }

  try {
    const contentHtml = await generateDocumentHtml({ template, brand, inputs, images })

    const preparedDate = formatPreparedDate(undefined)
    const documentId = `${brandSlug.toUpperCase().slice(0, 3)}-${templateSlug.toUpperCase().slice(0, 3)}-${todayStamp()}-${shortId()}`

    const pdfBuffer = await buildPdf({
      template,
      brand,
      inputs,
      contentHtml,
      documentId,
      preparedDate,
      palette,
      fontPreset,
      logoPlacement,
    })

    const pdfFilename = `${templateSlug}_${brandSlug}_${todayStamp()}_${shortId()}.pdf`

    const uploadResult = await uploadSubmissionOutput({
      submissionId,
      pdfBuffer,
      submissionJson: {
        submission_id: submissionId,
        template_slug: templateSlug,
        brand_slug: brandSlug,
        image_count: images.length,
        inputs,
        user_id: auth.user.userId,
        user_email: auth.user.email,
        font_preset: fontPreset.key,
        logo_placement: logoPlacement.key,
        palette_override: paletteOverride ?? null,
        created_at: new Date().toISOString(),
      },
      filename: pdfFilename,
    })

    await serviceClient
      .from('apollo_submissions')
      .update({
        status: 'delivered',
        s3_prefix: uploadResult.s3Prefix,
        s3_key: uploadResult.s3Key,
        download_url: uploadResult.downloadUrl,
        completed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)

    return NextResponse.json(
      {
        success: true,
        submission_id: submissionId,
        download_url: uploadResult.downloadUrl,
        expires_at: uploadResult.expiresAt,
        file_format: 'pdf',
        file_size_bytes: pdfBuffer.length,
      },
      { headers: cors }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[apollo/submit] failure', err)
    return fail(message)
  }
}

// --------------------------------------------------------------------
// Unified-catalog (JSON) path
// --------------------------------------------------------------------

const UPLOADS_BUCKET = 'apollo-uploads'
const INLINE_BYTE_LIMIT = 5 * 1024 * 1024 // mirrors orchestrate.ts

async function handleJsonSubmit(
  request: Request,
  cors: Record<string, string>,
  user: AuthedUser
): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400, headers: cors })
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return NextResponse.json({ error: 'body must be a JSON object' }, { status: 400, headers: cors })
  }

  const o = body as Record<string, unknown>
  const slug = typeof o.slug === 'string' ? o.slug.trim() : ''
  const brandSlug = typeof o.brand_slug === 'string' ? o.brand_slug.trim() : ''
  const styleId = typeof o.style_id === 'string' ? o.style_id.trim() : ''
  const fields =
    o.fields && typeof o.fields === 'object' && !Array.isArray(o.fields)
      ? (o.fields as Record<string, unknown>)
      : null
  const uploadIdsRaw = Array.isArray(o.upload_ids) ? o.upload_ids : []
  const uploadIds = uploadIdsRaw.filter((x): x is string => typeof x === 'string')

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400, headers: cors })
  }
  if (!brandSlug || !isAllowedBrandSlug(brandSlug)) {
    return NextResponse.json({ error: 'invalid brand_slug' }, { status: 400, headers: cors })
  }
  if (!styleId) {
    return NextResponse.json({ error: 'style_id is required' }, { status: 400, headers: cors })
  }
  if (!fields) {
    return NextResponse.json({ error: 'fields must be an object' }, { status: 400, headers: cors })
  }

  // Catalog lookups
  const summary = findDeliverable(slug)
  if (!summary) {
    return NextResponse.json({ error: 'unknown deliverable' }, { status: 404, headers: cors })
  }
  const industry = findIndustry(summary.industry_slug)
  if (!industry || industry.status !== 'active') {
    return NextResponse.json(
      { error: 'deliverable_not_available', placeholder_industry: industry?.slug },
      { status: 404, headers: cors }
    )
  }
  const moduleData = getModule(slug)
  if (!moduleData) {
    return NextResponse.json({ error: 'module not found' }, { status: 500, headers: cors })
  }
  const schema = getSchema(slug)
  if (!schema || typeof schema !== 'object') {
    return NextResponse.json({ error: 'schema not found' }, { status: 500, headers: cors })
  }

  // Style must belong to this deliverable's industry.
  const style = getStyleById(styleId)
  const allowedStyles = getStylesForIndustry(summary.industry_slug)
  if (!style || !allowedStyles.some((s) => s.id === styleId)) {
    return NextResponse.json(
      { error: 'invalid style_id for this deliverable' },
      { status: 400, headers: cors }
    )
  }

  // Required field presence
  const missing: string[] = []
  for (const f of moduleData.required_fields) {
    const v = fields[f.key]
    if (v === undefined || v === null) { missing.push(f.key); continue }
    if (typeof v === 'string' && v.trim() === '') missing.push(f.key)
  }
  if (missing.length) {
    return NextResponse.json(
      { error: 'missing required fields', missing },
      { status: 400, headers: cors }
    )
  }

  // Brand
  const brand = await loadBrand(brandSlug)
  if (!brand) {
    return NextResponse.json({ error: 'unknown brand' }, { status: 400, headers: cors })
  }

  const serviceClient = await createServiceClient()

  // Fetch uploads owned by this user, scoped to the requested ids.
  let uploads: OrchestrateUpload[] = []
  if (uploadIds.length) {
    const lookup = await serviceClient
      .from('apollo_uploads')
      .select(
        'id, upload_kind, original_filename, content_type, size_bytes, caption, extracted_text, storage_path, user_id, submission_id'
      )
      .in('id', uploadIds)
      .eq('user_id', user.userId)
    if (lookup.error) {
      return NextResponse.json(
        { error: 'upload lookup failed: ' + lookup.error.message },
        { status: 500, headers: cors }
      )
    }
    const rows = (lookup.data ?? []) as Array<{
      id: string
      upload_kind: string
      original_filename: string
      content_type: string
      size_bytes: number
      caption: string | null
      extracted_text: string | null
      storage_path: string
      user_id: string
      submission_id: string | null
    }>
    if (rows.length !== uploadIds.length) {
      return NextResponse.json(
        { error: 'one or more upload_ids do not belong to this user' },
        { status: 403, headers: cors }
      )
    }
    // Download bytes for image and PDF uploads (subject to size cap)
    uploads = await Promise.all(
      rows.map(async (r): Promise<OrchestrateUpload> => {
        let bytes: Buffer | null = null
        const inlineEligible =
          (r.content_type.startsWith('image/') || r.content_type === 'application/pdf') &&
          r.size_bytes <= INLINE_BYTE_LIMIT
        if (inlineEligible) {
          try {
            const dl = await serviceClient.storage
              .from(UPLOADS_BUCKET)
              .download(r.storage_path)
            if (!dl.error && dl.data) {
              const ab = await dl.data.arrayBuffer()
              bytes = Buffer.from(ab)
            }
          } catch {
            bytes = null
          }
        }
        return {
          id: r.id,
          upload_kind: r.upload_kind,
          original_filename: r.original_filename,
          content_type: r.content_type,
          size_bytes: r.size_bytes,
          caption: r.caption,
          extracted_text: r.extracted_text,
          bytes,
        }
      })
    )
  }

  // Insert submission row (status = generating)
  const insertRow: Record<string, unknown> = {
    template_slug: slug,
    brand_slug: brandSlug,
    inputs: { fields, style_id: styleId, upload_ids: uploadIds },
    image_count: uploads.filter((u) => u.content_type.startsWith('image/')).length,
    status: 'generating',
    user_id: user.userId,
    user_email: user.email,
  }
  const { data: insertData, error: insertErr } = await serviceClient
    .from('apollo_submissions')
    .insert(insertRow)
    .select('id')
    .single()
  if (insertErr || !insertData) {
    return NextResponse.json(
      { error: 'failed to create submission: ' + (insertErr?.message ?? 'unknown') },
      { status: 500, headers: cors }
    )
  }
  const submissionId = insertData.id as string

  async function failJson(message: string, status = 500): Promise<NextResponse> {
    await serviceClient
      .from('apollo_submissions')
      .update({
        status: 'failed',
        error_message: message.slice(0, 2000),
        completed_at: new Date().toISOString(),
      })
      .eq('id', submissionId)
    return NextResponse.json(
      { error: message, submission_id: submissionId },
      { status, headers: cors }
    )
  }

  // Link uploads to this submission so they don't dangle.
  if (uploadIds.length) {
    await serviceClient
      .from('apollo_uploads')
      .update({ submission_id: submissionId })
      .in('id', uploadIds)
      .eq('user_id', user.userId)
  }

  let orchestrateResult
  try {
    orchestrateResult = await orchestrate({
      slug,
      deliverableLabel: summary.label,
      industryLabel: summary.industry_label,
      module: moduleData,
      schema: schema as Record<string, unknown>,
      style,
      brand,
      fields,
      uploads,
    })
  } catch (err) {
    if (err instanceof OrchestrateError) {
      return failJson(`orchestration failed (${err.stage}): ${err.message}`)
    }
    return failJson('orchestration failed: ' + (err instanceof Error ? err.message : String(err)))
  }

  // Synthesize a Template adapter so buildPdf can consume the
  // unified-catalog deliverable using its existing layout primitives.
  const syntheticTemplate: Template = {
    slug,
    label: summary.label,
    description: summary.description,
    category: summary.industry_slug,
    supports_images: true,
    has_signature_block: shouldHaveSignatureBlock(slug),
    has_toc: shouldRenderToc(slug),
    layout: chooseLayoutForSlug(slug),
    fields: [],
    sections: moduleData.sections.map((s) => ({ id: s.key, title: s.label })),
    generation_notes: '',
  }

  const palette = applyPaletteOverride(await loadBrandPalette(brandSlug), undefined)
  const fontPreset = resolvePreset(undefined)
  const logoPlacement = resolvePlacement(undefined)

  let pdfBuffer: Buffer
  try {
    pdfBuffer = await buildPdf({
      template: syntheticTemplate,
      brand,
      inputs: fields,
      contentHtml: orchestrateResult.contentHtml,
      documentId:
        `${brandSlug.toUpperCase().slice(0, 3)}-${slug.toUpperCase().slice(0, 6)}-${todayStamp()}-${shortId()}`,
      preparedDate: formatPreparedDate(undefined),
      palette,
      fontPreset,
      logoPlacement,
    })
  } catch (err) {
    return failJson('PDF build failed: ' + (err instanceof Error ? err.message : String(err)))
  }

  let uploadResult
  try {
    uploadResult = await uploadSubmissionOutput({
      submissionId,
      pdfBuffer,
      submissionJson: {
        submission_id: submissionId,
        slug,
        brand_slug: brandSlug,
        style_id: styleId,
        fields,
        upload_ids: uploadIds,
        ai_output: orchestrateResult.output,
        warnings: orchestrateResult.warnings,
        user_id: user.userId,
        user_email: user.email,
        created_at: new Date().toISOString(),
      },
      filename: `${slug}_${brandSlug}_${todayStamp()}_${shortId()}.pdf`,
    })
  } catch (err) {
    return failJson('storage upload failed: ' + (err instanceof Error ? err.message : String(err)))
  }

  await serviceClient
    .from('apollo_submissions')
    .update({
      status: 'delivered',
      s3_prefix: uploadResult.s3Prefix,
      s3_key: uploadResult.s3Key,
      download_url: uploadResult.downloadUrl,
      completed_at: new Date().toISOString(),
    })
    .eq('id', submissionId)

  return NextResponse.json(
    {
      success: true,
      submission_id: submissionId,
      download_url: uploadResult.downloadUrl,
      expires_at: uploadResult.expiresAt,
      file_format: 'pdf',
      file_size_bytes: pdfBuffer.length,
      warnings: orchestrateResult.warnings,
    },
    { headers: cors }
  )
}

// Deliverables that conventionally end with a signature block. The PDF
// pipeline renders signatures from inputs when this flag is on.
function shouldHaveSignatureBlock(slug: string): boolean {
  return [
    'nda',
    'sow',
    'engagement-letter',
    'contract-package',
    'change-order',
    'quote',
  ].includes(slug)
}
