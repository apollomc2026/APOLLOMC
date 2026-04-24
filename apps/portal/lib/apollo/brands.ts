import fs from 'node:fs/promises'
import path from 'node:path'

export interface BrandInfo {
  slug: string
  label: string
  logo_file: string | null
  logo_path: string | null
}

export interface LoadedBrand extends BrandInfo {
  brand_md: string
  logo_bytes: Buffer | null
  logo_mime: string | null
}

// Structured color palette for document output. Drives the PDF pipeline's
// paper/ink/accent/metadata/hairline CSS variables. Parsed from a YAML
// block inside each brand.md (see loadBrandPalette below).
export interface BrandPalette {
  paper: string
  ink: string
  accent: string
  metadata: string
  hairline: string
}

export const DEFAULT_BRAND_PALETTE: BrandPalette = {
  paper: '#fafafa',
  ink: '#14151a',
  accent: '#6be3ff',
  metadata: '#5a5e66',
  hairline: 'rgba(20,21,26,0.22)',
}

const BRAND_ROOT = path.join(process.cwd(), '..', '..', 'brand-assets')

const BRAND_LABELS: Record<string, string> = {
  apollo: 'Apollo',
  atlas: 'Atlas',
  'on-spot-solutions': 'On Spot Solutions',
  habi: 'Habi',
  themis: 'Themis',
}

const PRIMARY_LOGO_CANDIDATES: Record<string, string[]> = {
  apollo: ['apollo_logo_master.png', 'apollo_logo_transparent.png', 'apollomc-logo.png'],
  atlas: ['atlas-logo-hires.png', 'atlas-statue.png'],
  'on-spot-solutions': ['OnSpot_FULL_nearTouch.png'],
  habi: [],
  themis: [],
}

const MIME_BY_EXT: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
}

async function resolvePrimaryLogo(brandSlug: string): Promise<string | null> {
  const dir = path.join(BRAND_ROOT, brandSlug)
  const candidates = PRIMARY_LOGO_CANDIDATES[brandSlug] ?? []
  for (const candidate of candidates) {
    const filePath = path.join(dir, candidate)
    try {
      await fs.access(filePath)
      return candidate
    } catch {
      // try next
    }
  }
  return null
}

export async function listBrands(): Promise<BrandInfo[]> {
  const results: BrandInfo[] = []
  let entries: string[] = []
  try {
    entries = await fs.readdir(BRAND_ROOT)
  } catch {
    return results
  }
  for (const entry of entries) {
    const entryPath = path.join(BRAND_ROOT, entry)
    const stat = await fs.stat(entryPath).catch(() => null)
    if (!stat?.isDirectory()) continue
    const hasBrandMd = await fs
      .access(path.join(entryPath, 'brand.md'))
      .then(() => true)
      .catch(() => false)
    if (!hasBrandMd) continue
    const label = BRAND_LABELS[entry] ?? entry
    const logo_file = await resolvePrimaryLogo(entry)
    results.push({
      slug: entry,
      label,
      logo_file,
      logo_path: logo_file ? `/api/apollo/brands/${entry}/logo` : null,
    })
  }
  results.sort((a, b) => a.label.localeCompare(b.label))
  return results
}

export function isAllowedBrandSlug(slug: string): boolean {
  if (slug === 'other') return true
  return /^[a-z0-9][a-z0-9-]*$/.test(slug)
}

export async function loadBrand(slug: string): Promise<LoadedBrand | null> {
  if (slug === 'other') {
    return {
      slug: 'other',
      label: 'Other',
      logo_file: null,
      logo_path: null,
      brand_md: 'UNBRANDED',
      logo_bytes: null,
      logo_mime: null,
    }
  }
  if (!isAllowedBrandSlug(slug)) return null
  const dir = path.join(BRAND_ROOT, slug)
  const brandMdPath = path.join(dir, 'brand.md')
  let brand_md: string
  try {
    brand_md = await fs.readFile(brandMdPath, 'utf8')
  } catch {
    return null
  }
  const logo_file = await resolvePrimaryLogo(slug)
  let logo_bytes: Buffer | null = null
  let logo_mime: string | null = null
  if (logo_file) {
    const logoPath = path.join(dir, logo_file)
    try {
      logo_bytes = await fs.readFile(logoPath)
      const ext = path.extname(logo_file).toLowerCase()
      logo_mime = MIME_BY_EXT[ext] ?? 'application/octet-stream'
    } catch {
      logo_bytes = null
    }
  }
  return {
    slug,
    label: BRAND_LABELS[slug] ?? slug,
    logo_file,
    logo_path: logo_file ? `/api/apollo/brands/${slug}/logo` : null,
    brand_md,
    logo_bytes,
    logo_mime,
  }
}

export async function readBrandLogoBytes(
  slug: string
): Promise<{ bytes: Buffer; mime: string; filename: string } | null> {
  if (!isAllowedBrandSlug(slug) || slug === 'other') return null
  const logo_file = await resolvePrimaryLogo(slug)
  if (!logo_file) return null
  const dir = path.join(BRAND_ROOT, slug)
  const logoPath = path.join(dir, logo_file)
  const bytes = await fs.readFile(logoPath)
  const ext = path.extname(logo_file).toLowerCase()
  const mime = MIME_BY_EXT[ext] ?? 'application/octet-stream'
  return { bytes, mime, filename: logo_file }
}

// Read the structured palette YAML block from a brand.md. The block is
// delimited by <!-- apollo-pdf-palette: START --> … <!-- apollo-pdf-palette: END -->
// markers with a fenced YAML block between them. Returns the default palette
// if the brand doesn't define one (or if parsing fails).
const PALETTE_BLOCK = /<!--\s*apollo-pdf-palette:\s*START\s*-->[\s\S]*?```yaml\s*([\s\S]*?)```[\s\S]*?<!--\s*apollo-pdf-palette:\s*END\s*-->/

export async function loadBrandPalette(brandSlug: string): Promise<BrandPalette> {
  if (!isAllowedBrandSlug(brandSlug) || brandSlug === 'other') {
    return DEFAULT_BRAND_PALETTE
  }
  const mdPath = path.join(BRAND_ROOT, brandSlug, 'brand.md')
  let content: string
  try {
    content = await fs.readFile(mdPath, 'utf8')
  } catch {
    return DEFAULT_BRAND_PALETTE
  }
  const match = content.match(PALETTE_BLOCK)
  if (!match) return DEFAULT_BRAND_PALETTE
  const yaml = match[1]
  const parsed: Partial<BrandPalette> = {}
  for (const line of yaml.split('\n')) {
    const m = line.match(/^\s*(\w+)\s*:\s*"?([^"\n]+?)"?\s*$/)
    if (!m) continue
    const key = m[1]
    const value = m[2].trim()
    if (
      key === 'paper' ||
      key === 'ink' ||
      key === 'accent' ||
      key === 'metadata' ||
      key === 'hairline'
    ) {
      parsed[key] = value
    }
  }
  return { ...DEFAULT_BRAND_PALETTE, ...parsed }
}

// Apply a per-submission partial override on top of a base palette. Unknown
// keys are ignored. Used by the submit route when the user provides a
// palette_override form field.
export function applyPaletteOverride(
  base: BrandPalette,
  override: Partial<BrandPalette> | undefined | null
): BrandPalette {
  if (!override || typeof override !== 'object') return base
  const allowedKeys: Array<keyof BrandPalette> = [
    'paper',
    'ink',
    'accent',
    'metadata',
    'hairline',
  ]
  const clean: Partial<BrandPalette> = {}
  for (const k of allowedKeys) {
    const v = override[k]
    if (typeof v === 'string' && v.trim().length > 0) clean[k] = v.trim()
  }
  return { ...base, ...clean }
}
