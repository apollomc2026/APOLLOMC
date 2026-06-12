import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createServiceClient } from '@/lib/supabase/server'
import { corsHeaders, preflight } from '@/lib/apollo/cors'
import { requireAllowedUser } from '@/lib/apollo/auth'
import { rateLimit } from '@/lib/apollo/ratelimit'
import { getModule, type ModuleField } from '@/lib/apollo/packages-loader'
import { modelFor } from '@/lib/ai/models'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const MAX_UPLOAD_IDS = 10
const MAX_TOKENS = 2048

// Extract-only, never fabricate — disqualifying rule per spec.
const EXTRACT_SYSTEM =
  `You are a document field extractor for Apollo, a professional document-generation platform.\n\n` +
  `Return a field ONLY if its value is explicitly present in the documents; ` +
  `omit anything not found; never infer, compute, or default.\n\n` +
  `Your only action is to call the extract_fields tool with the fields you found. ` +
  `If you find nothing, call it with an empty object.`

function fieldToJsonSchema(f: ModuleField): Record<string, unknown> {
  if (f.type === 'number') {
    return { type: 'number', description: f.label }
  }
  if (f.type === 'date') {
    return {
      type: 'string',
      pattern: '^\\d{4}-\\d{2}-\\d{2}$',
      description: `${f.label} in YYYY-MM-DD format`,
    }
  }
  if (f.type === 'select') {
    const opts = (f.options ?? []).map((o) => (typeof o === 'string' ? o : o.value))
    return { type: 'string', enum: opts, description: f.label }
  }
  if (f.type === 'multi_select') {
    const opts = (f.options ?? []).map((o) => (typeof o === 'string' ? o : o.value))
    return { type: 'array', items: { type: 'string', enum: opts }, description: f.label }
  }
  // text | textarea | rich_text
  const desc = f.label + (f.placeholder ? ` (e.g. ${f.placeholder})` : '')
  return { type: 'string', description: desc }
}

function buildToolSchema(fields: ModuleField[]): Anthropic.Tool.InputSchema {
  const properties: Record<string, unknown> = {}
  for (const f of fields) {
    properties[f.key] = fieldToJsonSchema(f)
  }
  return { type: 'object', properties }
}

export async function OPTIONS(req: NextRequest) {
  return preflight(req)
}

export async function POST(req: NextRequest) {
  const cors = corsHeaders(req)

  const auth = await requireAllowedUser()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status, headers: cors })
  }
  const { user } = auth

  const rl = await rateLimit(`extract:user:${user.userId}`, 30, 3600)
  if (!rl.ok) {
    return NextResponse.json({ error: 'rate limit exceeded' }, { status: 429, headers: cors })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid JSON body' }, { status: 400, headers: cors })
  }
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'body must be an object' }, { status: 400, headers: cors })
  }
  const { upload_ids, module_slug } = body as Record<string, unknown>

  if (!Array.isArray(upload_ids) || upload_ids.length === 0) {
    return NextResponse.json(
      { error: 'upload_ids must be a non-empty array' },
      { status: 400, headers: cors }
    )
  }
  if (upload_ids.length > MAX_UPLOAD_IDS) {
    return NextResponse.json(
      { error: `upload_ids may not exceed ${MAX_UPLOAD_IDS}` },
      { status: 400, headers: cors }
    )
  }
  if (!upload_ids.every((id) => typeof id === 'string')) {
    return NextResponse.json(
      { error: 'upload_ids must be strings' },
      { status: 400, headers: cors }
    )
  }
  if (typeof module_slug !== 'string' || !module_slug) {
    return NextResponse.json({ error: 'module_slug required' }, { status: 400, headers: cors })
  }

  const moduleData = getModule(module_slug)
  if (!moduleData) {
    return NextResponse.json({ error: 'unknown module_slug' }, { status: 400, headers: cors })
  }

  // Ownership check: server fetches extracted_text from DB — never from client.
  const serviceClient = await createServiceClient()
  const lookup = await serviceClient
    .from('apollo_uploads')
    .select('id, extracted_text')
    .in('id', upload_ids as string[])
    .eq('user_id', user.userId)
  if (lookup.error) {
    return NextResponse.json(
      { error: 'upload lookup failed: ' + lookup.error.message },
      { status: 500, headers: cors }
    )
  }
  const rows = (lookup.data ?? []) as Array<{ id: string; extracted_text: string | null }>
  if (rows.length !== upload_ids.length) {
    return NextResponse.json(
      { error: 'one or more upload_ids do not belong to this user' },
      { status: 403, headers: cors }
    )
  }

  const allFields = [...moduleData.required_fields, ...moduleData.optional_fields]

  // Build document blocks from extracted_text (server-sourced only).
  const documents = rows
    .map((r, i) => {
      const text = (r.extracted_text ?? '').trim()
      return text ? `<document index="${i + 1}">\n${text}\n</document>` : null
    })
    .filter((d): d is string => d !== null)

  // Nothing to extract from — return gracefully with zero found.
  if (documents.length === 0) {
    const missing = allFields.map((f) => f.key)
    return NextResponse.json({ fields: {}, found_count: 0, missing }, { headers: cors })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'extraction service not configured' },
      { status: 500, headers: cors }
    )
  }

  const client = new Anthropic({ apiKey })
  const toolSchema = buildToolSchema(allFields)

  let extracted: Record<string, unknown> = {}
  try {
    const response = await client.messages.create({
      model: modelFor('extraction'),
      max_tokens: MAX_TOKENS,
      // Cache breakpoint on system: caches tools + system together for repeat calls
      // on the same module (same tool schema = same prefix bytes).
      system: [{ type: 'text', text: EXTRACT_SYSTEM, cache_control: { type: 'ephemeral' } }],
      tools: [
        {
          name: 'extract_fields',
          description:
            'Emit the fields found in the provided documents. ' +
            'Only include fields whose values are explicitly present in the documents.',
          input_schema: toolSchema,
        },
      ],
      tool_choice: { type: 'tool', name: 'extract_fields' },
      messages: [
        {
          role: 'user',
          content:
            `Extract fields for module "${module_slug}" from the following documents. ` +
            `Return ONLY values explicitly stated in the text — do not infer or compute.\n\n` +
            documents.join('\n\n'),
        },
      ],
    })

    for (const block of response.content) {
      if (block.type === 'tool_use' && block.name === 'extract_fields') {
        extracted = (block.input as Record<string, unknown>) ?? {}
        break
      }
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json(
      { error: 'extraction failed: ' + msg },
      { status: 500, headers: cors }
    )
  }

  // Strip null/undefined/empty-string values (model may emit explicit nulls for missing fields).
  const fields: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(extracted)) {
    if (v !== null && v !== undefined && v !== '') {
      fields[k] = v
    }
  }

  const foundKeys = new Set(Object.keys(fields))
  const missing = allFields.map((f) => f.key).filter((k) => !foundKeys.has(k))

  return NextResponse.json(
    { fields, found_count: foundKeys.size, missing },
    { headers: cors }
  )
}
