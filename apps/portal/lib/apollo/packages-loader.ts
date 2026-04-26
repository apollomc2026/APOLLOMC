// Canonical Apollo catalog loader. Reads catalog + modules + schemas +
// style-library from packages/ at process start, caches in memory.
// Single source of truth for the unified catalog.
//
// File layout under apps/portal/lib/apollo/packages/:
//   catalog/catalog.json
//   catalog/modules/<slug>.json
//   schemas/<slug>.schema.json
//   style-library/<industry>/<style>.md
//
// All reads happen synchronously inside Node's fs API at first call and
// the result is cached. The directory is shipped with the deployment, so
// there is no runtime fetch and no risk of partial loads.

import fs from 'node:fs'
import path from 'node:path'

export type ModuleFieldType =
  | 'text'
  | 'textarea'
  | 'date'
  | 'number'
  | 'select'
  | 'multi_select'
  | 'rich_text'

export interface ModuleFieldOption {
  value: string
  label: string
}

export interface ModuleField {
  key: string
  label: string
  type: ModuleFieldType
  placeholder?: string
  options?: Array<string | ModuleFieldOption>
  help?: string
  default?: string | number
}

export interface FileUploadPrompt {
  // Free-form taxonomy. Common kinds: 'brand_guide', 'reference_doc',
  // 'reference_image', 'financial_data', 'site_photo', 'equipment_photo',
  // 'receipt', 'prior_filing'. Modules introduce new kinds freely.
  kind: string
  label: string
  required: boolean
  accepts?: string
  multiple?: boolean
}

export interface ModuleSection {
  key: string
  label: string
  required: boolean
  min_words: number
  max_words: number
  // AI guidance for this section. The gold-standard generation_notes
  // content lives here, per-section.
  instructions: string
}

export interface DeliverableModule {
  deliverable_slug: string
  required_fields: ModuleField[]
  optional_fields: ModuleField[]
  file_upload_prompts: FileUploadPrompt[]
  sections: ModuleSection[]
}

export interface DeliverableSummary {
  slug: string
  label: string
  description: string
  industry_slug: string
  industry_label: string
  estimated_pages_min: number
  estimated_pages_max: number
  estimated_minutes: number
  base_price_cents: number
  schema_file: string
}

export interface Industry {
  slug: string
  label: string
  description: string
  icon_key: string
  sort_order: number
  status: 'active' | 'placeholder'
  placeholder_cta?: string
  deliverables: DeliverableSummary[]
}

export interface Catalog {
  industries: Industry[]
}

export interface StyleOption {
  id: string
  industry_slug: string
  label: string
  description: string
  content: string
}

// Resolve packages root. apps/portal runs with cwd=apps/portal in dev/build,
// so the relative path is lib/apollo/packages. We resolve from this file's
// own directory to be CWD-independent.
const PACKAGES_ROOT = path.resolve(__dirname, 'packages')
const CATALOG_PATH = path.join(PACKAGES_ROOT, 'catalog', 'catalog.json')
const MODULES_DIR = path.join(PACKAGES_ROOT, 'catalog', 'modules')
const SCHEMAS_DIR = path.join(PACKAGES_ROOT, 'schemas')
const STYLE_LIBRARY_DIR = path.join(PACKAGES_ROOT, 'style-library')

interface RawDeliverable {
  slug: string
  label: string
  description: string
  estimated_pages_min: number
  estimated_pages_max: number
  estimated_minutes: number
  base_price_cents: number
  schema_file: string
}

interface RawIndustry {
  slug: string
  label: string
  description: string
  icon_key: string
  sort_order: number
  status?: 'active' | 'placeholder'
  placeholder_cta?: string
  deliverables: RawDeliverable[]
}

interface RawCatalogFile {
  industries: RawIndustry[]
}

let cache: {
  catalog: Catalog
  modulesBySlug: Map<string, DeliverableModule>
  schemasBySlug: Map<string, unknown>
  stylesById: Map<string, StyleOption>
  stylesByIndustry: Map<string, StyleOption[]>
} | null = null

function readJson<T>(file: string): T {
  const raw = fs.readFileSync(file, 'utf8')
  return JSON.parse(raw) as T
}

function validateField(f: unknown, ctx: string): asserts f is ModuleField {
  if (!f || typeof f !== 'object') throw new Error(`${ctx}: field is not an object`)
  const o = f as Record<string, unknown>
  if (typeof o.key !== 'string' || !o.key) throw new Error(`${ctx}: field.key missing`)
  if (typeof o.label !== 'string' || !o.label) throw new Error(`${ctx}: field.label missing`)
  if (typeof o.type !== 'string') throw new Error(`${ctx}: field.type missing`)
  const validTypes: ModuleFieldType[] = ['text', 'textarea', 'date', 'number', 'select', 'multi_select', 'rich_text']
  if (!validTypes.includes(o.type as ModuleFieldType)) {
    throw new Error(`${ctx}: field.type "${o.type}" not one of ${validTypes.join(', ')}`)
  }
}

function validateSection(s: unknown, ctx: string): asserts s is ModuleSection {
  if (!s || typeof s !== 'object') throw new Error(`${ctx}: section is not an object`)
  const o = s as Record<string, unknown>
  if (typeof o.key !== 'string' || !o.key) throw new Error(`${ctx}: section.key missing`)
  if (typeof o.label !== 'string' || !o.label) throw new Error(`${ctx}: section.label missing`)
  if (typeof o.instructions !== 'string') throw new Error(`${ctx}: section.instructions missing`)
}

function validateModule(m: unknown, slug: string): DeliverableModule {
  if (!m || typeof m !== 'object') throw new Error(`module ${slug}: not an object`)
  const o = m as Record<string, unknown>
  if (o.deliverable_slug !== slug) {
    throw new Error(`module ${slug}: deliverable_slug "${o.deliverable_slug}" does not match filename`)
  }
  const required_fields = Array.isArray(o.required_fields) ? o.required_fields : []
  const optional_fields = Array.isArray(o.optional_fields) ? o.optional_fields : []
  const file_upload_prompts = Array.isArray(o.file_upload_prompts) ? o.file_upload_prompts : []
  const sections = Array.isArray(o.sections) ? o.sections : []
  required_fields.forEach((f, i) => validateField(f, `module ${slug} required_fields[${i}]`))
  optional_fields.forEach((f, i) => validateField(f, `module ${slug} optional_fields[${i}]`))
  sections.forEach((s, i) => validateSection(s, `module ${slug} sections[${i}]`))
  return {
    deliverable_slug: slug,
    required_fields: required_fields as ModuleField[],
    optional_fields: optional_fields as ModuleField[],
    file_upload_prompts: file_upload_prompts as FileUploadPrompt[],
    sections: sections as ModuleSection[],
  }
}

// Style .md → StyleOption parsing.
//   - First H1 (#) → label, with the trailing " — Style Specification"
//     suffix stripped if present.
//   - First non-empty paragraph after the H1 (skipping bold metadata lines
//     like **Version:** 1 and **Industry:** Foo) → description, truncated
//     to 280 chars.
//   - Full file body → content (handed to the AI as the visual style guide).
function parseStyleMarkdown(filePath: string, industrySlug: string, id: string): StyleOption {
  const raw = fs.readFileSync(filePath, 'utf8')
  const lines = raw.split(/\r?\n/)
  let label = id
  for (const line of lines) {
    const m = /^#\s+(.+?)\s*$/.exec(line)
    if (m) {
      label = m[1].replace(/\s*[—-]\s*Style Specification\s*$/i, '').trim()
      break
    }
  }
  // First narrative paragraph: skip H1 / heading lines, **bold metadata**,
  // and blank lines until we hit a real paragraph. Walk forward collecting
  // until the next blank line or section heading.
  let description = ''
  let inBody = false
  const collected: string[] = []
  for (const line of lines) {
    if (!inBody) {
      if (/^#\s+/.test(line)) { inBody = true; continue }
      continue
    }
    const trimmed = line.trim()
    if (!trimmed) {
      if (collected.length) break
      continue
    }
    if (/^\*\*[^*]+:\*\*/.test(trimmed)) continue // metadata like **Version:** 1
    if (/^#/.test(trimmed)) break // hit a sub-heading without paragraph
    collected.push(trimmed)
    if (collected.join(' ').length > 280) break
  }
  description = collected.join(' ').trim()
  if (!description) {
    // Fallback to the H1 label as description for sparse files.
    description = label
  }
  if (description.length > 280) description = description.slice(0, 277).trimEnd() + '…'
  return {
    id,
    industry_slug: industrySlug,
    label,
    description,
    content: raw,
  }
}

function buildCache(): NonNullable<typeof cache> {
  // 1. Catalog
  const raw = readJson<RawCatalogFile>(CATALOG_PATH)
  if (!raw || !Array.isArray(raw.industries)) {
    throw new Error('catalog.json missing industries array')
  }
  const industries: Industry[] = raw.industries.map((ri) => ({
    slug: ri.slug,
    label: ri.label,
    description: ri.description,
    icon_key: ri.icon_key,
    sort_order: ri.sort_order,
    status: ri.status ?? 'active',
    placeholder_cta: ri.placeholder_cta,
    deliverables: ri.deliverables.map((d) => ({
      ...d,
      industry_slug: ri.slug,
      industry_label: ri.label,
    })),
  }))
  industries.sort((a, b) => a.sort_order - b.sort_order)
  const catalog: Catalog = { industries }

  // 2. Modules — iterate the modules dir and validate each
  const modulesBySlug = new Map<string, DeliverableModule>()
  let moduleFiles: string[] = []
  try {
    moduleFiles = fs.readdirSync(MODULES_DIR).filter((f) => f.endsWith('.json'))
  } catch {
    moduleFiles = []
  }
  for (const file of moduleFiles) {
    const slug = file.replace(/\.json$/, '')
    const m = readJson<unknown>(path.join(MODULES_DIR, file))
    modulesBySlug.set(slug, validateModule(m, slug))
  }

  // 3. Schemas
  const schemasBySlug = new Map<string, unknown>()
  let schemaFiles: string[] = []
  try {
    schemaFiles = fs.readdirSync(SCHEMAS_DIR).filter((f) => f.endsWith('.schema.json'))
  } catch {
    schemaFiles = []
  }
  for (const file of schemaFiles) {
    const slug = file.replace(/\.schema\.json$/, '')
    const s = readJson<unknown>(path.join(SCHEMAS_DIR, file))
    schemasBySlug.set(slug, s)
  }

  // 4. Style library — scan industry subdirs; each .md becomes a StyleOption
  const stylesById = new Map<string, StyleOption>()
  const stylesByIndustry = new Map<string, StyleOption[]>()
  let industryDirs: string[] = []
  try {
    industryDirs = fs
      .readdirSync(STYLE_LIBRARY_DIR, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
  } catch {
    industryDirs = []
  }
  for (const ind of industryDirs) {
    const dir = path.join(STYLE_LIBRARY_DIR, ind)
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'))
    const list: StyleOption[] = []
    for (const file of files) {
      const id = file.replace(/\.md$/, '')
      const opt = parseStyleMarkdown(path.join(dir, file), ind, id)
      stylesById.set(id, opt)
      list.push(opt)
    }
    list.sort((a, b) => a.label.localeCompare(b.label))
    stylesByIndustry.set(ind, list)
  }

  return { catalog, modulesBySlug, schemasBySlug, stylesById, stylesByIndustry }
}

function ensureCache(): NonNullable<typeof cache> {
  if (!cache) cache = buildCache()
  return cache
}

// ---- Public API ----

export function getCatalog(): Catalog {
  return ensureCache().catalog
}

export function getModule(slug: string): DeliverableModule | null {
  const c = ensureCache()
  return c.modulesBySlug.get(slug) ?? null
}

export function getSchema(slug: string): unknown | null {
  const c = ensureCache()
  return c.schemasBySlug.get(slug) ?? null
}

export function getStylesForIndustry(industrySlug: string): StyleOption[] {
  const c = ensureCache()
  return c.stylesByIndustry.get(industrySlug) ?? []
}

export function getStyleById(styleId: string): StyleOption | null {
  const c = ensureCache()
  return c.stylesById.get(styleId) ?? null
}

export function listAllStyles(): StyleOption[] {
  const c = ensureCache()
  return Array.from(c.stylesById.values())
}

// Industry helpers — useful for routes that need to look up a deliverable's
// industry without iterating the whole catalog.
export function findDeliverable(slug: string): DeliverableSummary | null {
  const cat = getCatalog()
  for (const ind of cat.industries) {
    const d = ind.deliverables.find((x) => x.slug === slug)
    if (d) return d
  }
  return null
}

export function findIndustry(industrySlug: string): Industry | null {
  return getCatalog().industries.find((i) => i.slug === industrySlug) ?? null
}
