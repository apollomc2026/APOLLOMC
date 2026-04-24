import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { loadTemplate, validateInputs } from '@/lib/apollo/templates'
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
import { requireAllowedUser } from '@/lib/apollo/auth'

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

  const template = await loadTemplate(templateSlug)
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
