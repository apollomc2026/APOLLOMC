// Apollo unified-catalog orchestrator.
//
// Inputs (from POST /api/apollo/submit JSON):
//   slug            — deliverable slug (must resolve to an active industry)
//   brand_slug      — brand to render the deliverable in
//   style_id        — chosen style from the deliverable's industry
//   fields          — user-filled module fields keyed by ModuleField.key
//   uploads         — already-fetched apollo_uploads rows (with downloaded
//                     bytes for inline injection where supported)
//
// Pipeline:
//   1. Build system prompt from Apollo master rules + brand.md + style.md
//   2. Build user prompt: module sections + fields + uploads
//   3. Invoke Claude Sonnet 4 with a tool whose input_schema is the
//      deliverable's output JSON schema → forces structured output
//   4. Validate AI output against the schema with Ajv (draft 2020-12)
//   5. On validation failure, send a corrective follow-up; on second
//      failure throw OrchestrateError so the caller can mark the
//      submission failed
//   6. Render the validated structured output into PDF-ready body HTML
//
// The orchestrator is pure with respect to DB / S3 — the route owns
// submission rows, file persistence, and the final response. This keeps
// the Claude/validation logic testable in isolation.

import Anthropic from '@anthropic-ai/sdk'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { marked } from 'marked'
import type {
  DeliverableModule,
  ModuleField,
  ModuleSection,
  StyleOption,
} from './packages-loader'
import type { LoadedBrand } from './brands'

const MODEL = 'claude-sonnet-4-20250514'
const MAX_TOKENS_PRIMARY = 8192
const MAX_TOKENS_RETRY = 6144
const INLINE_BYTE_LIMIT = 5 * 1024 * 1024 // 5 MB per inline document/image

export interface OrchestrateUpload {
  id: string
  upload_kind: string
  original_filename: string
  content_type: string
  size_bytes: number
  caption: string | null
  extracted_text: string | null
  bytes: Buffer | null // populated for image/* and application/pdf when ≤ 5 MB
}

export interface OrchestrateArgs {
  slug: string
  deliverableLabel: string
  industryLabel: string
  module: DeliverableModule
  schema: Record<string, unknown>
  style: StyleOption
  brand: LoadedBrand
  fields: Record<string, unknown>
  uploads: OrchestrateUpload[]
}

export interface OrchestrateResult {
  output: Record<string, unknown>
  contentHtml: string
  warnings: string[]
}

export class OrchestrateError extends Error {
  constructor(
    message: string,
    public readonly stage:
      | 'no_api_key'
      | 'claude_invocation'
      | 'no_output'
      | 'schema_invalid'
      | 'render',
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'OrchestrateError'
  }
}

// Apollo's master rules — the global preamble that applies to every
// deliverable regardless of brand or style. These mirror the rules in
// generate.ts so the unified path stays consistent with yesterday's
// hand-tuned prompt.
const MASTER_RULES = `You are Apollo's deliverable generator. You produce structured, professional output for a chosen deliverable type.

You MUST:
- Follow the brand's "Generation rules" verbatim. These are not suggestions.
- Follow the chosen style's content verbatim for visual restraint and voice.
- Follow each section's instructions verbatim.
- Stay grounded in the user-provided fields. If a value is not provided, use a precise placeholder ("to be confirmed", "TBD") — do not fabricate.
- Use the uploaded reference materials (images, PDFs, extracted text) to inform tone, factual content, and visual identity. If a brand guide is uploaded, follow its colors, fonts, and tone notes inside the body content.
- Honor the section list exactly: same keys, same labels, same order.
- For each section, write content within the min/max word range declared in the module.

You MUST NOT:
- Add creative flourishes ("we are thrilled to...", "exciting opportunity", "world-class", "seamless").
- Use exclamation points unless inside a direct user-provided quote.
- Add emoji, asterisk decorations, ASCII art, spaced-out letter displays.
- Repeat the document title inside section content.
- Emit logos, footers, signature blocks, or page numbers — the renderer adds those.

Output: invoke the provided tool with structured JSON that matches the schema exactly. Do not respond with prose.`

function pickFieldValue(
  fields: Record<string, unknown>,
  field: ModuleField
): string {
  const raw = fields[field.key]
  if (raw === undefined || raw === null) return '_(not provided)_'
  if (typeof raw === 'string') {
    const trimmed = raw.trim()
    return trimmed.length === 0 ? '_(not provided)_' : trimmed
  }
  if (Array.isArray(raw)) return raw.length === 0 ? '_(not provided)_' : raw.join(', ')
  return String(raw)
}

function formatFieldsBlock(
  module: DeliverableModule,
  fields: Record<string, unknown>
): string {
  const lines: string[] = []
  if (module.required_fields.length) {
    lines.push('### Required fields')
    for (const f of module.required_fields) {
      lines.push(`- **${f.label}** (\`${f.key}\`): ${pickFieldValue(fields, f)}`)
    }
  }
  if (module.optional_fields.length) {
    lines.push('')
    lines.push('### Optional fields')
    for (const f of module.optional_fields) {
      lines.push(`- **${f.label}** (\`${f.key}\`): ${pickFieldValue(fields, f)}`)
    }
  }
  return lines.join('\n')
}

function formatSectionsBlock(sections: ModuleSection[]): string {
  const lines: string[] = []
  sections.forEach((s, i) => {
    lines.push(`#### Section ${i + 1}: ${s.label}  (\`${s.key}\`)`)
    lines.push(`Word range: ${s.min_words}–${s.max_words}`)
    if (s.required) lines.push('Required: yes')
    if (s.instructions) {
      lines.push('Instructions:')
      lines.push(s.instructions.trim())
    }
    lines.push('')
  })
  return lines.join('\n')
}

function buildSystemPrompt(args: OrchestrateArgs): string {
  const brandBlock =
    args.brand.slug === 'other'
      ? '## Brand\nUNBRANDED — neutral professional tone, no brand-specific voice rules.'
      : '## Brand\n' + args.brand.brand_md
  const styleBlock = '## Style: ' + args.style.label + '\n' + args.style.content

  return [
    MASTER_RULES,
    '',
    brandBlock,
    '',
    styleBlock,
  ].join('\n')
}

function buildUserPromptText(args: OrchestrateArgs): string {
  const moduleSummary = {
    deliverable_slug: args.module.deliverable_slug,
    required_fields: args.module.required_fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
    })),
    optional_fields: args.module.optional_fields.map((f) => ({
      key: f.key,
      label: f.label,
      type: f.type,
    })),
    file_upload_prompts: args.module.file_upload_prompts,
    sections: args.module.sections.map((s) => ({
      key: s.key,
      label: s.label,
      required: s.required,
      min_words: s.min_words,
      max_words: s.max_words,
    })),
  }

  return [
    `# Deliverable`,
    `Generate a ${args.deliverableLabel} (industry: ${args.industryLabel}, slug: ${args.slug}).`,
    '',
    '# Module',
    '```json',
    JSON.stringify(moduleSummary, null, 2),
    '```',
    '',
    '# User-provided fields',
    formatFieldsBlock(args.module, args.fields),
    '',
    '# Sections (build all of them, in order, using these per-section instructions)',
    formatSectionsBlock(args.module.sections),
    '',
    '# Uploaded reference materials',
    args.uploads.length === 0
      ? 'No files uploaded.'
      : `${args.uploads.length} file(s) attached as additional content blocks. Use them as factual, visual, and tonal references.`,
    '',
    '# Output',
    'Invoke the `emit_deliverable` tool with structured JSON matching the schema. Every section in the module must appear in the output. Do not respond with prose outside the tool call.',
  ].join('\n')
}

type AnthropicContentBlock = Anthropic.ContentBlockParam

function buildContentBlocks(
  args: OrchestrateArgs,
  prompt: string
): AnthropicContentBlock[] {
  const blocks: AnthropicContentBlock[] = [{ type: 'text', text: prompt }]

  for (const u of args.uploads) {
    const headerText =
      `Document: ${u.original_filename} (kind: ${u.upload_kind}` +
      (u.caption ? `, caption: ${u.caption}` : '') +
      ')'
    if (u.bytes && u.bytes.length <= INLINE_BYTE_LIMIT) {
      if (u.content_type.startsWith('image/')) {
        const mediaType = u.content_type as
          | 'image/jpeg'
          | 'image/png'
          | 'image/gif'
          | 'image/webp'
        blocks.push({ type: 'text', text: headerText })
        blocks.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mediaType,
            data: u.bytes.toString('base64'),
          },
        })
        continue
      }
      if (u.content_type === 'application/pdf') {
        blocks.push({ type: 'text', text: headerText })
        blocks.push({
          type: 'document',
          source: {
            type: 'base64',
            media_type: 'application/pdf',
            data: u.bytes.toString('base64'),
          },
        })
        continue
      }
    }
    if (u.extracted_text && u.extracted_text.trim()) {
      blocks.push({
        type: 'text',
        text:
          headerText +
          '\nExtracted contents:\n' +
          u.extracted_text.slice(0, 80000),
      })
      continue
    }
    blocks.push({
      type: 'text',
      text:
        headerText +
        '\n(File present, no inline preview — include it in your reasoning conceptually.)',
    })
  }

  return blocks
}

// Ajv strict mode is too noisy for hand-authored schemas (we have
// "additionalProperties": true and metadata constraints that ajv flags
// in strict mode). We turn strict off but keep all validators on so real
// shape errors still surface.
function makeValidator(schema: Record<string, unknown>) {
  const ajv = new Ajv2020({
    strict: false,
    allErrors: true,
    allowUnionTypes: true,
  })
  addFormats(ajv)
  return ajv.compile(schema)
}

function describeAjvErrors(errors: unknown): string {
  if (!Array.isArray(errors)) return 'unknown validation error'
  return errors
    .slice(0, 12)
    .map((e: { instancePath?: string; message?: string; keyword?: string; params?: unknown }) => {
      const path = e.instancePath || '/'
      return `- ${path}: ${e.message || e.keyword || 'invalid'}`
    })
    .join('\n')
}

interface ToolUseBlock {
  type: 'tool_use'
  id: string
  name: string
  input: Record<string, unknown>
}

function findToolUse(
  blocks: Anthropic.Messages.ContentBlock[]
): ToolUseBlock | null {
  for (const b of blocks) {
    if (b.type === 'tool_use') return b as unknown as ToolUseBlock
  }
  return null
}

async function callClaudeWithTool(
  client: Anthropic,
  args: OrchestrateArgs,
  systemPrompt: string,
  promptBlocks: AnthropicContentBlock[],
  maxTokens: number
): Promise<Record<string, unknown>> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    tools: [
      {
        name: 'emit_deliverable',
        description:
          'Emit the structured deliverable matching the provided JSON schema.',
        input_schema: args.schema as Anthropic.Tool.InputSchema,
      },
    ],
    tool_choice: { type: 'tool', name: 'emit_deliverable' },
    messages: [{ role: 'user', content: promptBlocks }],
  })

  const tool = findToolUse(response.content)
  if (!tool) {
    throw new OrchestrateError(
      'Claude returned no tool_use block',
      'no_output',
      { content: response.content }
    )
  }
  return tool.input
}

function renderContentHtml(
  output: Record<string, unknown>,
  module: DeliverableModule,
  fallbackTitle: string
): string {
  const metadata = (output.metadata && typeof output.metadata === 'object')
    ? (output.metadata as Record<string, unknown>)
    : {}
  const titleRaw = typeof metadata.title === 'string' ? metadata.title : fallbackTitle
  const title = escapeHtml(titleRaw)

  const sectionsRaw = Array.isArray(output.sections) ? output.sections : []
  const byKey = new Map<string, { label: string; content: string }>()
  for (const s of sectionsRaw) {
    if (!s || typeof s !== 'object') continue
    const o = s as Record<string, unknown>
    const key = typeof o.key === 'string' ? o.key : ''
    const label = typeof o.label === 'string' ? o.label : key
    const content = typeof o.content === 'string' ? o.content : ''
    if (key) byKey.set(key, { label, content })
  }

  const parts: string[] = []
  parts.push(`<h1>${title}</h1>`)

  // Walk module.sections to keep order; fall back to AI's order for any
  // sections present in the output but not in the module (defensive).
  const seen = new Set<string>()
  for (const s of module.sections) {
    const found = byKey.get(s.key)
    if (!found) continue
    seen.add(s.key)
    parts.push(`<h2>${escapeHtml(found.label || s.label)}</h2>`)
    parts.push(markdownToHtml(found.content))
  }
  for (const [key, val] of byKey) {
    if (seen.has(key)) continue
    parts.push(`<h2>${escapeHtml(val.label)}</h2>`)
    parts.push(markdownToHtml(val.content))
  }

  return parts.join('\n')
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function markdownToHtml(input: string): string {
  if (!input.trim()) return ''
  const html = marked.parse(input, { async: false }) as string
  return html.trim()
}

export async function orchestrate(args: OrchestrateArgs): Promise<OrchestrateResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new OrchestrateError('ANTHROPIC_API_KEY is not set', 'no_api_key')
  }
  const client = new Anthropic({ apiKey })

  const systemPrompt = buildSystemPrompt(args)
  const userPromptText = buildUserPromptText(args)
  const promptBlocks = buildContentBlocks(args, userPromptText)
  const validator = makeValidator(args.schema)
  const warnings: string[] = []

  let output: Record<string, unknown>
  try {
    output = await callClaudeWithTool(client, args, systemPrompt, promptBlocks, MAX_TOKENS_PRIMARY)
  } catch (err) {
    if (err instanceof OrchestrateError) throw err
    throw new OrchestrateError(
      'Claude invocation failed: ' + (err instanceof Error ? err.message : String(err)),
      'claude_invocation',
      err
    )
  }

  if (!validator(output)) {
    const errorSummary = describeAjvErrors(validator.errors)
    warnings.push('First-pass schema validation failed; running corrective follow-up.')

    // Corrective second pass — feed the model its own output and the ajv
    // error list, ask it to repair.
    const repairBlocks: AnthropicContentBlock[] = [
      {
        type: 'text',
        text: [
          'Your previous tool output failed schema validation:',
          '```',
          errorSummary,
          '```',
          'Repair the structure and re-emit the deliverable via the emit_deliverable tool.',
          'Original output (for reference):',
          '```json',
          JSON.stringify(output).slice(0, 12000),
          '```',
        ].join('\n'),
      },
    ]
    try {
      output = await callClaudeWithTool(
        client,
        args,
        systemPrompt,
        repairBlocks,
        MAX_TOKENS_RETRY
      )
    } catch (err) {
      throw new OrchestrateError(
        'Schema repair pass failed: ' + (err instanceof Error ? err.message : String(err)),
        'claude_invocation',
        err
      )
    }
    if (!validator(output)) {
      throw new OrchestrateError(
        'AI output failed schema validation after repair pass',
        'schema_invalid',
        validator.errors
      )
    }
  }

  let contentHtml: string
  try {
    contentHtml = renderContentHtml(output, args.module, args.deliverableLabel)
  } catch (err) {
    throw new OrchestrateError(
      'Failed to render content HTML: ' + (err instanceof Error ? err.message : String(err)),
      'render',
      err
    )
  }

  return { output, contentHtml, warnings }
}

// Layout heuristic for the unified catalog. The PDF pipeline supports
// contract / letter / invoice / one-pager / minutes / financial-statement;
// for deliverables that don't have a perfect primitive (pitch-deck,
// exec-presentation, federal-proposal), we fall back to "contract" for
// v1 — the spec acknowledges visual-fidelity-per-industry as iteration 2.
export type LayoutKey =
  | 'contract'
  | 'letter'
  | 'invoice'
  | 'one-pager'
  | 'minutes'
  | 'financial-statement'

const LAYOUT_BY_SLUG: Record<string, LayoutKey> = {
  quote: 'financial-statement',
  invoice: 'invoice',
  'change-order': 'financial-statement',
  'expense-report': 'financial-statement',
  'budget-vs-actual': 'financial-statement',
  'cash-flow-forecast': 'financial-statement',
  'tax-estimate': 'financial-statement',
  'personal-monthly': 'financial-statement',
  'one-pager': 'one-pager',
  'capability-statement': 'one-pager',
  'meeting-minutes': 'minutes',
  'engagement-letter': 'letter',
}

export function chooseLayoutForSlug(slug: string): LayoutKey {
  return LAYOUT_BY_SLUG[slug] ?? 'contract'
}

// Slugs whose layout doesn't benefit from a Table of Contents page.
const NO_TOC_SLUGS = new Set([
  'quote',
  'invoice',
  'change-order',
  'expense-report',
  'budget-vs-actual',
  'cash-flow-forecast',
  'tax-estimate',
  'personal-monthly',
  'one-pager',
  'capability-statement',
  'investor-update',
  'engagement-letter',
])

export function shouldRenderToc(slug: string): boolean {
  return !NO_TOC_SLUGS.has(slug)
}
