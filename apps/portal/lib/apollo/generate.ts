import Anthropic from '@anthropic-ai/sdk'
import { modelFor } from '@/lib/ai/models'
import type { Template } from './templates'
import type { LoadedBrand } from './brands'

const MAX_TOKENS = 8192

export interface ImageInput {
  mime: string
  base64: string
  filename: string
}

export interface GenerateArgs {
  template: Template
  brand: LoadedBrand
  inputs: Record<string, unknown>
  images: ImageInput[]
}

const SYSTEM_PROMPT = `You are Apollo's document generator. You produce clean, professional HTML that converts to DOCX.

You will receive:
1. A TEMPLATE describing document structure, fields, sections, and voice/structure constraints (generation_notes).
2. A BRAND with identity, voice, visual tokens, and a "Generation rules" section you must follow verbatim.
3. USER INPUTS — values for the template's fields.
4. Optionally, IMAGE references for templates that support them.

You MUST:
- Follow the brand's "Generation rules" verbatim. These are not suggestions.
- Follow the template's generation_notes verbatim for voice and structure.
- Produce semantic HTML (h1/h2/p/ul/ol/table) with no inline styles except where explicitly required for tables (e.g., basic border attributes) or emphasis via <strong>/<em>.
- Emit ONE and only ONE <h1> at the document start, containing the canonical document title (e.g., "NON-DISCLOSURE AGREEMENT", "SCOPE OF WORK"). The title appears exactly once.
- Not emit marketing language, emoji, decorative unicode, or filler phrases.
- Not invent content the user did not provide. If a field is "_(not provided)_", reflect that with a precise placeholder ("to be confirmed", "TBD") or omit the detail — do not fabricate.
- Follow the template's section order exactly. Do not add, remove, or reorder sections.
- For sections marked "fixed": use the standard skeleton for that document type.
- For sections marked "prose": generate original content grounded in user inputs.
- For sections marked "hybrid": fill the structured slots (tables, lists) from user input.

You MUST NOT:
- Rewrite the brand's voice or tone from what brand.md declares.
- Add creative flourishes ("we are thrilled to...", "exciting opportunity", "revolutionary", "world-class", "seamless").
- Use exclamation points unless in direct user-provided quotes.
- Add emoji, asterisk decorations, ASCII art, or spaced-out letter displays ("A T L A S").
- Repeat the document title in subheadings, subtitle paragraphs, or decorative banners.
- Emit a footer — the pipeline adds it with a real page number field.
- Emit a logo or <img> tag — the pipeline adds the logo in the header block.
- Emit a signature block — the pipeline adds one for templates that require it.
- Translate the document title.
- Emit <style> blocks, <script> tags, <link> tags, CSS at-rules (@media, @font-face, @keyframes), or attributes whose names start with "@".

Output: complete HTML of the document body only. Start with a single <h1>, end with the last section's closing tag. No <html>, <head>, or <body> wrapper. No markdown code fences.`

function formatInputs(template: Template, inputs: Record<string, unknown>): string {
  const lines: string[] = []
  for (const field of template.fields) {
    const raw = inputs[field.id]
    const value = raw === undefined || raw === null || raw === '' ? '_(not provided)_' : String(raw)
    lines.push(`- **${field.label}** (\`${field.id}\`): ${value}`)
  }
  return lines.join('\n')
}

// Stable per (template, brand): hoisted into the cached system prefix so
// repeat submissions of the same template+brand reuse it. Must stay
// byte-identical across requests that should share cache — no inputs, no
// timestamps, nothing per-submission above the breakpoint.
function buildStableContext(template: Template, brand: LoadedBrand): string {
  return [
    '# Template',
    '```json',
    JSON.stringify(template, null, 2),
    '```',
    '',
    '# Brand',
    brand.slug === 'other' ? 'UNBRANDED' : brand.brand_md,
  ].join('\n')
}

// Varies per submission: stays in the user turn, below the cache breakpoint.
function buildVaryingPrompt(args: GenerateArgs): string {
  const { template, inputs, images } = args
  const imageNotes =
    images.length === 0
      ? 'none'
      : `${images.length} image(s) attached as image content blocks. Reference them as Figure 1 through Figure ${images.length} in prose sections where relevant.`

  return [
    '# User inputs',
    formatInputs(template, inputs),
    '',
    '# Images provided',
    imageNotes,
    '',
    '# Constraints (hard)',
    '- Produce HTML for the document body only.',
    '- Emit the document title exactly once as a single <h1>.',
    '- Follow the brand\'s "Generation rules" section verbatim.',
    '- Follow the template\'s generation_notes verbatim for voice, structure, and length.',
    '- No emoji, no decorative unicode, no spaced-out letters, no marketing filler.',
    '- Do not emit a logo, footer, or signature block — the pipeline adds those.',
    '- Start at <h1>. No <html>, <head>, or <body> wrapper. No markdown fences.',
    '',
    'Generate the complete HTML document now.',
  ].join('\n')
}

export async function generateDocumentHtml(args: GenerateArgs): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not set')
  }
  const client = new Anthropic({ apiKey })

  // System prefix = static rules + stable per-(template,brand) context, with a
  // cache breakpoint on the stable block. SYSTEM_PROMPT alone measures ~674
  // tokens — below Sonnet 4.6's documented 1024-token cache minimum — so the
  // template/brand content is hoisted here to push the cached prefix over the
  // floor. Repeat submissions of the same template+brand read this prefix.
  const systemBlocks: Anthropic.TextBlockParam[] = [
    { type: 'text', text: SYSTEM_PROMPT },
    {
      type: 'text',
      text: buildStableContext(args.template, args.brand),
      cache_control: { type: 'ephemeral' },
    },
  ]

  const contentBlocks: Anthropic.ContentBlockParam[] = [
    { type: 'text', text: buildVaryingPrompt(args) },
  ]
  if (args.template.supports_images) {
    for (const img of args.images) {
      contentBlocks.push({
        type: 'image',
        source: {
          type: 'base64',
          media_type: img.mime as 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp',
          data: img.base64,
        },
      })
    }
  }

  const response = await client.messages.create({
    model: modelFor('draft_compile'),
    max_tokens: MAX_TOKENS,
    system: systemBlocks,
    messages: [{ role: 'user', content: contentBlocks }],
  })

  // Risk fix: never silently store a truncated document. If the model hit the
  // output cap, surface it so the route marks the submission failed instead.
  if (response.stop_reason === 'max_tokens') {
    console.error('[apollo/generate] output truncated: stop_reason=max_tokens')
    throw new Error('generation truncated: model hit max_tokens before completing the document')
  }

  const textBlock = response.content.find((b) => b.type === 'text')
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('Claude returned no text content')
  }
  let html = textBlock.text.trim()
  html = stripCodeFences(html)
  return html
}

function stripCodeFences(text: string): string {
  const fenceMatch = text.match(/^```(?:html)?\s*\n([\s\S]*?)\n```\s*$/)
  if (fenceMatch) return fenceMatch[1].trim()
  return text
}
