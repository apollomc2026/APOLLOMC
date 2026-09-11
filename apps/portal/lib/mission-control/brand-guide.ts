import Anthropic from '@anthropic-ai/sdk'
import { modelFor } from '@/lib/ai/models'
import { extractEvidence } from './evidence'

const HEX = /^#[0-9a-f]{6}$/i
const INLINE_LIMIT = 10 * 1024 * 1024

export interface InterpretedBrandProfile {
  primary_color: string | null
  secondary_color: string | null
  accent_color: string | null
  heading_font: string | null
  body_font: string | null
  voice: string | null
}

function shortText(value: unknown, limit: number) {
  return typeof value === 'string' && value.trim() ? value.trim().slice(0, limit) : null
}

export function normalizeBrandProfile(input: Record<string, unknown>): InterpretedBrandProfile {
  const color = (value: unknown) => typeof value === 'string' && HEX.test(value.trim()) ? value.trim().toUpperCase() : null
  return {
    primary_color: color(input.primary_color),
    secondary_color: color(input.secondary_color),
    accent_color: color(input.accent_color),
    heading_font: shortText(input.heading_font, 120),
    body_font: shortText(input.body_font, 120),
    voice: shortText(input.voice, 1200),
  }
}

export async function interpretBrandGuide(bytes: Buffer, mime: string, filename: string): Promise<InterpretedBrandProfile> {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('Brand interpretation service is not configured')
  const extracted = await extractEvidence(bytes, mime)
  const content: Anthropic.ContentBlockParam[] = [{
    type: 'text',
    text: `Interpret the attached brand guide ${JSON.stringify(filename)}. Extract only supported identity rules. A color must be returned as an exact six-digit hex value. Leave any field absent when the guide does not support it. Voice should concisely preserve explicit tone, language, and usage rules; do not invent marketing claims.`,
  }]
  if (bytes.length <= INLINE_LIMIT && mime.startsWith('image/')) {
    content.push({ type:'image', source:{ type:'base64', media_type:mime as 'image/jpeg'|'image/png'|'image/gif'|'image/webp', data:bytes.toString('base64') } })
  } else if (bytes.length <= INLINE_LIMIT && mime === 'application/pdf') {
    content.push({ type:'document', source:{ type:'base64', media_type:'application/pdf', data:bytes.toString('base64') } })
  } else if (extracted.text?.trim()) {
    content.push({ type:'text', text:`Extracted guide contents:\n${extracted.text.slice(0, 80000)}` })
  } else {
    throw new Error('The uploaded guide could not be interpreted; use a text-searchable PDF, DOCX, PNG, or JPG')
  }

  const client = new Anthropic({ apiKey:process.env.ANTHROPIC_API_KEY })
  const response = await client.messages.create({
    model:modelFor('extraction'),
    max_tokens:1200,
    system:'You are APOLLO brand-intelligence ingestion. Preserve evidence boundaries. Extract visual and verbal identity rules from the supplied guide without fabricating unsupported attributes.',
    tools:[{
      name:'record_brand_profile',
      description:'Record the supported brand identity attributes found in the supplied guide.',
      input_schema:{
        type:'object',
        properties:{
          primary_color:{ type:'string', pattern:'^#[0-9A-Fa-f]{6}$', description:'Primary brand color as exact hex' },
          secondary_color:{ type:'string', pattern:'^#[0-9A-Fa-f]{6}$', description:'Secondary brand color as exact hex' },
          accent_color:{ type:'string', pattern:'^#[0-9A-Fa-f]{6}$', description:'Accent brand color as exact hex' },
          heading_font:{ type:'string', description:'Explicit heading or display typeface' },
          body_font:{ type:'string', description:'Explicit body typeface' },
          voice:{ type:'string', description:'Concise evidence-grounded voice, tone, language, and usage rules' },
        },
        additionalProperties:false,
      },
    }],
    tool_choice:{ type:'tool', name:'record_brand_profile' },
    messages:[{ role:'user', content }],
  })
  const block = response.content.find(item => item.type === 'tool_use' && item.name === 'record_brand_profile')
  if (!block || block.type !== 'tool_use') throw new Error('Brand guide interpretation returned no profile')
  const profile = normalizeBrandProfile(block.input as Record<string, unknown>)
  if (!Object.values(profile).some(Boolean)) throw new Error('No usable color, typography, or voice rules were found in this guide')
  return profile
}
