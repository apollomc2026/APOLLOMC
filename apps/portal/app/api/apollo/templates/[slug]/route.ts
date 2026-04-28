import { NextResponse } from 'next/server'
import {
  findDeliverable,
  findIndustry,
  getCatalog,
  getModule,
  getSchema,
  listAllStyles,
} from '@/lib/apollo/packages-loader'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'

// Returns the full deliverable detail: catalog summary + module
// (required/optional fields, file_upload_prompts, sections), the 3 styles
// available for the deliverable's industry, and the parsed output schema.
//
// 404 with placeholder_industry context when a slug belongs to a
// placeholder industry (Hospitality / Content & Media).

export const dynamic = 'force-dynamic'

const SLUG_PATTERN = /^[a-z0-9-]+$/

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const cors = corsHeaders(request)
  try {
    const auth = await requireAllowedUser()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
    }

    const { slug } = await params
    if (!slug || !SLUG_PATTERN.test(slug) || slug.includes('..') || slug.includes('/')) {
      return NextResponse.json({ error: 'invalid slug' }, { status: 400, headers: cors })
    }

    const summary = findDeliverable(slug)
    if (!summary) {
      // Check whether the slug LOOKS like it might belong to a placeholder
      // industry — i.e., the slug isn't anywhere in the catalog. We can't
      // know which placeholder industry, so we don't try; just 404.
      return NextResponse.json(
        { error: 'deliverable_not_available' },
        { status: 404, headers: cors }
      )
    }

    const industry = findIndustry(summary.industry_slug)
    if (!industry || industry.status !== 'active') {
      return NextResponse.json(
        {
          error: 'deliverable_not_available',
          placeholder_industry: industry?.slug,
        },
        { status: 404, headers: cors }
      )
    }

    const moduleData = getModule(slug)
    if (!moduleData) {
      return NextResponse.json(
        { error: 'module_missing', slug },
        { status: 500, headers: cors }
      )
    }

    const schema = getSchema(slug)

    // All 15 styles are available on every deliverable. Earlier the route
    // filtered by industry (getStylesForIndustry), but the catalog only
    // ships per-industry style dirs for legal/consulting/government/finance/
    // startup — field-service deliverables (quote, fsr, change-order,
    // expense-report) returned available_styles: [] and the wizard couldn't
    // submit. Universal exposure makes every deliverable selectable; the
    // default still nudges the user toward an industry-matched style.
    //
    // Strip the full markdown content before sending to the client — that
    // content is server-side only (system prompt for the AI at submit time).
    // Clients only need id/label/description + thumbnail URL.
    //
    // Thumbnails are pre-rendered PNGs committed to /public/style-thumbnails/
    // by scripts/generate-style-thumbnails.mjs and served from the portal
    // origin (cross-origin from the static intake page on apollomc.ai/apollo/,
    // but no CORS preflight is needed for <img src>).
    const allStyles = listAllStyles()
    const reqUrl = new URL(request.url)
    const thumbBase = reqUrl.origin + '/style-thumbnails/'
    const available_styles = allStyles.map((s) => ({
      id: s.id,
      industry_slug: s.industry_slug,
      label: s.label,
      description: s.description,
      thumbnail_url: thumbBase + s.id + '.png',
    }))
    // Default selection priority:
    //   1. A style whose industry matches the deliverable's industry
    //   2. consulting-executive (broadly-applicable boardroom style)
    //   3. First style alphabetically
    // Falls through to null only if the catalog ships zero styles.
    const industryMatch = allStyles.find((s) => s.industry_slug === summary.industry_slug)
    const universalFallback = allStyles.find((s) => s.id === 'consulting-executive')
    const default_style_id =
      industryMatch?.id ??
      universalFallback?.id ??
      allStyles[0]?.id ??
      null

    return NextResponse.json(
      {
        template: {
          // Catalog summary
          slug: summary.slug,
          label: summary.label,
          description: summary.description,
          industry_slug: summary.industry_slug,
          industry_label: summary.industry_label,
          estimated_pages_min: summary.estimated_pages_min,
          estimated_pages_max: summary.estimated_pages_max,
          estimated_minutes: summary.estimated_minutes,
          base_price_cents: summary.base_price_cents,

          // Intake module
          required_fields: moduleData.required_fields,
          optional_fields: moduleData.optional_fields,
          file_upload_prompts: moduleData.file_upload_prompts,
          sections: moduleData.sections,

          // Style picker
          available_styles,
          default_style_id,

          // Output schema (handed to the client for debug + preflight; the
          // server enforces it on submit too).
          output_schema: schema,
        },
      },
      { headers: cors }
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[apollo/templates/[slug]] failure', err)
    return NextResponse.json(
      { error: 'template detail load failed: ' + message },
      { status: 500, headers: cors }
    )
  }
}

// Suppress unused-import warning on getCatalog — kept available for future
// helper additions in this route.
void getCatalog
