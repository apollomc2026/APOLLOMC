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

const SYSTEM_PROMPT = `You are Apollo's deliverable generator. Your job: produce a polished, client-ready document by filling a template structure with prose that applies a specific brand's voice and visual identity.

Rules:
- Follow the template's section structure exactly. Do not add, remove, or reorder sections.
- For sections marked "fixed": use the standard skeleton for that document type.
- For sections marked "prose": generate original content based on user inputs and brand voice.
- For sections marked "hybrid": fill the structured slots (tables, lists) from user input.
- Apply the brand's voice and tone from the brand.md content provided.
- Use the brand's color scheme via inline HTML/CSS in your output.
- Output valid HTML that will be converted to DOCX. Use semantic tags (h1, h2, p, ul, table). Apply colors and brand styling only through inline style="..." attributes. Do NOT emit <style> blocks, <script> tags, <link> tags, CSS at-rules (@media, @font-face, @keyframes), or attributes whose names start with "@" (these are framework template directives and are not valid HTML). No images — logos are inserted by the pipeline.
- Keep output within realistic document length. Do not pad.`

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
    'Generate the complete HTML document now. Respond with HTML only, starting at <h1> or <section>. Do not include <html>, <head>, or <body> tags, and do not wrap the response in markdown code fences.',
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
