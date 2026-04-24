import Anthropic from '@anthropic-ai/sdk'
import type { Template } from './templates'
import type { LoadedBrand } from './brands'

const MODEL = 'claude-sonnet-4-20250514'
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

function buildUserPrompt(args: GenerateArgs): string {
  const { template, brand, inputs, images } = args
  const imageNotes =
    images.length === 0
      ? 'none'
      : `${images.length} image(s) attached as image content blocks. Reference them as Figure 1 through Figure ${images.length} in prose sections where relevant.`

  return [
    '# Template',
    '```json',
    JSON.stringify(template, null, 2),
    '```',
    '',
    '# Brand',
    brand.slug === 'other' ? 'UNBRANDED' : brand.brand_md,
    '',
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

  const userPrompt = buildUserPrompt(args)

  const contentBlocks: Anthropic.ContentBlockParam[] = [{ type: 'text', text: userPrompt }]
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
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: contentBlocks }],
  })

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
