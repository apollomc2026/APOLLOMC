import { NextResponse } from 'next/server'
import { getCatalog } from '@/lib/apollo/packages-loader'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'

// Returns the full industry-grouped catalog plus a backwards-compatible
// flat templates[] array derived from the active industries. Yesterday's
// dashboard code that does `state.templates.find(t => t.slug === slug)`
// continues to work during the frontend transition.

export const dynamic = 'force-dynamic'

export async function OPTIONS(request: Request) {
  return preflight(request)
}

export async function GET(request: Request) {
  const cors = corsHeaders(request)
  try {
    const auth = await requireAllowedUser()
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
    }

    const catalog = getCatalog()

    // Flat list — only active industries' deliverables. Each entry mirrors
    // yesterday's TemplateSummary shape (slug, label, description, category,
    // supports_images) so existing code paths don't have to branch.
    const templates: Array<{
      slug: string
      label: string
      description: string
      category: string
      supports_images: boolean
    }> = []
    for (const ind of catalog.industries) {
      if (ind.status !== 'active') continue
      for (const d of ind.deliverables) {
        templates.push({
          slug: d.slug,
          label: d.label,
          description: d.description,
          category: ind.slug,
          // Conservative default — true is safe because the wizard will
          // only show file_upload_prompts when the deliverable's module
          // declares them.
          supports_images: true,
        })
      }
    }

    return NextResponse.json({ catalog, templates }, { headers: cors })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[apollo/templates] failure', err)
    return NextResponse.json(
      { error: 'templates load failed: ' + message },
      { status: 500, headers: cors }
    )
  }
}
