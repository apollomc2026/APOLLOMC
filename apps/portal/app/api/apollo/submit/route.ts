import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { loadTemplate, validateInputs } from '@/lib/apollo/templates'
import { loadBrand, isAllowedBrandSlug } from '@/lib/apollo/brands'
import { generateDocumentHtml, type ImageInput } from '@/lib/apollo/generate'
import { buildDocx } from '@/lib/apollo/docx'
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

  if (!templateSlug || !brandSlug) {
    return NextResponse.json(
      { error: 'template_slug and brand_slug are required' },
      { status: 400, headers: cors }
    )
  }
  if (!isAllowedBrandSlug(brandSlug)) {
    return NextResponse.json({ error: 'invalid brand_slug' }, { status: 400, headers: cors })
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
  const imageBuffers: { bytes: Buffer; mime: string; filename: string }[] = []
  for (const file of imageFiles) {
    const arrayBuffer = await file.arrayBuffer()
    const bytes = Buffer.from(arrayBuffer)
    imageBuffers.push({ bytes, mime: file.type, filename: file.name })
    images.push({ mime: file.type, base64: bytes.toString('base64'), filename: file.name })
  }

  const serviceClient = await createServiceClient()

  const { data: insertRow, error: insertErr } = await serviceClient
    .from('apollo_submissions')
    .insert({
      template_slug: templateSlug,
      brand_slug: brandSlug,
      inputs,
      image_count: images.length,
      status: 'generating',
      user_id: auth.user.userId,
      user_email: auth.user.email,
    })
    .select('id')
    .single()

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

    const docxBuffer = await buildDocx({
      contentHtml,
      title: template.label,
      brandLabel: brand.label,
      brandLogo:
        brand.logo_bytes && brand.logo_mime
          ? { bytes: brand.logo_bytes, mime: brand.logo_mime }
          : null,
      images: imageBuffers,
      templateLabel: template.label,
      templateSlug: template.slug,
      hasSignatureBlock: template.has_signature_block === true,
      inputs,
    })

    const docxFilename = `${templateSlug}_${brandSlug}_${todayStamp()}_${shortId()}.docx`

    const uploadResult = await uploadSubmissionOutput({
      submissionId,
      docxBuffer,
      submissionJson: {
        submission_id: submissionId,
        template_slug: templateSlug,
        brand_slug: brandSlug,
        image_count: images.length,
        inputs,
        user_id: auth.user.userId,
        user_email: auth.user.email,
        created_at: new Date().toISOString(),
      },
      filename: docxFilename,
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
      },
      { headers: cors }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[apollo/submit] failure', err)
    return fail(message)
  }
}
