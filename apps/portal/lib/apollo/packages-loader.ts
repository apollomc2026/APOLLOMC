// Canonical Apollo catalog loader. Reads catalog + modules + schemas +
// style-library from a generated TS module so the data is bundled into
// the JS chunk — no runtime file dependency.
//
// Source files live under apps/portal/lib/apollo/packages/:
//   catalog/catalog.json
//   catalog/modules/<slug>.json
//   schemas/<slug>.schema.json
//   style-library/<industry>/<style>.md
//
// scripts/generate-packages-data.mjs walks that tree at build time and
// emits packages-data.generated.ts with every file inlined as an export.
// `npm run prebuild` runs the generator. The generated file is committed
// so dev mode and type-checking work without a manual codegen step.
//
// Why this indirection: previously the loader used fs.readFileSync and
// resolved paths via __dirname. That works locally and in webpack-built
// deployments, but the production build runs `next build --turbopack` and
// Vercel's deployment of Turbopack builds does not honor
// outputFileTracingIncludes — the chunk hard-codes
// /ROOT/apps/portal/lib/apollo and ENOENTs at runtime on every catalog
// read. Bundling via the generated module sidesteps file tracing entirely.

import {
  CATALOG_RAW,
  MODULES_RAW,
  SCHEMAS_RAW,
  STYLES_RAW,
} from './packages-data.generated'

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
function parseStyleMarkdown(raw: string, industrySlug: string, id: string): StyleOption {
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
  const raw = CATALOG_RAW as unknown as RawCatalogFile
  if (!raw || !Array.isArray(raw.industries)) {
    throw new Error('packages-data: catalog missing industries array')
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

  // 2. Modules — validate each entry from the generated map
  const modulesBySlug = new Map<string, DeliverableModule>()
  for (const [slug, mod] of Object.entries(MODULES_RAW)) {
    modulesBySlug.set(slug, validateModule(mod, slug))
  }

  // 3. Schemas
  const schemasBySlug = new Map<string, unknown>()
  for (const [slug, schema] of Object.entries(SCHEMAS_RAW)) {
    schemasBySlug.set(slug, schema)
  }

  // 4. Style library — STYLES_RAW[industrySlug][styleId] = markdown body
  const stylesById = new Map<string, StyleOption>()
  const stylesByIndustry = new Map<string, StyleOption[]>()
  for (const [ind, byId] of Object.entries(STYLES_RAW)) {
    const list: StyleOption[] = []
    for (const [id, raw] of Object.entries(byId)) {
      const opt = parseStyleMarkdown(raw, ind, id)
      stylesById.set(id, opt)
      list.push(opt)
    }
    list.sort((a, b) => a.label.localeCompare(b.label))
    stylesByIndustry.set(ind, list)
  }

  return { catalog, modulesBySlug, schemasBySlug, stylesById, stylesByIndustry }
}

// Diagnostic wrapper. If buildCache throws (malformed module shape, missing
// schema, etc.) we attach extra context so the route surfacing the failure
// can return a useful 500 body instead of an opaque "Internal Server Error".
export class PackagesLoadError extends Error {
  constructor(
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'PackagesLoadError'
  }
}

function ensureCache(): NonNullable<typeof cache> {
  if (!cache) {
    try {
      cache = buildCache()
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      throw new PackagesLoadError(
        'Failed to build packages cache: ' + message +
          ` (modules=${Object.keys(MODULES_RAW).length}, schemas=${Object.keys(SCHEMAS_RAW).length}, styles=${Object.values(STYLES_RAW).reduce((a, m) => a + Object.keys(m).length, 0)})`,
        err
      )
    }
  }
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
