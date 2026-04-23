import fs from 'node:fs/promises'
import path from 'node:path'

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select' | 'multi_select'
export type SectionType = 'fixed' | 'prose' | 'hybrid'

export interface TemplateField {
  id: string
  label: string
  type: FieldType
  required?: boolean
  placeholder?: string
  help?: string
  default?: string | number
  options?: string[]
}

export interface TemplateSection {
  id: string
  label: string
  type: SectionType
}

export interface Template {
  slug: string
  label: string
  description: string
  category: string
  supports_images: boolean
  fields: TemplateField[]
  sections: TemplateSection[]
  generation_notes: string
}

const TEMPLATE_DIR = path.join(process.cwd(), 'lib', 'apollo', 'templates')

export async function listTemplates(): Promise<Template[]> {
  const entries = await fs.readdir(TEMPLATE_DIR)
  const files = entries.filter((f) => f.endsWith('.json'))
  const templates: Template[] = []
  for (const file of files) {
    const raw = await fs.readFile(path.join(TEMPLATE_DIR, file), 'utf8')
    templates.push(JSON.parse(raw) as Template)
  }
  templates.sort((a, b) => a.label.localeCompare(b.label))
  return templates
}

export async function loadTemplate(slug: string): Promise<Template | null> {
  const safe = slug.replace(/[^a-z0-9-]/gi, '')
  if (safe !== slug) return null
  const filePath = path.join(TEMPLATE_DIR, `${safe}.json`)
  try {
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw) as Template
  } catch {
    return null
  }
}

export function validateInputs(
  template: Template,
  inputs: Record<string, unknown>
): { ok: true } | { ok: false; missing: string[] } {
  const missing: string[] = []
  for (const field of template.fields) {
    if (!field.required) continue
    const value = inputs[field.id]
    if (value === undefined || value === null) {
      missing.push(field.id)
      continue
    }
    if (typeof value === 'string' && value.trim() === '') {
      missing.push(field.id)
      continue
    }
  }
  return missing.length === 0 ? { ok: true } : { ok: false, missing }
}
