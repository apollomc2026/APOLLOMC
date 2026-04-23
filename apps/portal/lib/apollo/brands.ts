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
