import { NextResponse } from 'next/server'
import {
  findDeliverable,
  findIndustry,
  getCatalog,
  getModule,
  getSchema,
  getStylesForIndustry,
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
    const styles = getStylesForIndustry(summary.industry_slug)

    // Strip the full markdown content from styles before sending to the
    // client. The full content is server-side only — used at submit time
    // as a system prompt for the AI. Clients only need id/label/description.
    const available_styles = styles.map((s) => ({
      id: s.id,
      industry_slug: s.industry_slug,
      label: s.label,
      description: s.description,
    }))
    const default_style_id = available_styles[0]?.id ?? null

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
