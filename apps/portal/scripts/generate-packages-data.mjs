// Generates apps/portal/lib/apollo/packages-data.generated.ts by reading
// the catalog/modules/schemas/style-library tree at build time and inlining
// every file's content as a TypeScript export.
//
// Why: packages-loader.ts originally read these files via fs.readFileSync
// at runtime. That works in dev but fails on Vercel serverless because
// outputFileTracingIncludes is not honored reliably with --turbopack — the
// per-route .nft.json lists the catalog files locally but the deployed
// function still ENOENTs on /ROOT/apps/portal/lib/apollo/packages/...
//
// Bundling the data via a generated TS module sidesteps file tracing
// entirely: the JSON/MD content lives inside the JS chunk.
//
// Run automatically by the `prebuild` npm script, and committed to the repo
// so dev / type-check work without explicitly running the generator.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORTAL_ROOT = path.resolve(__dirname, '..')
const PACKAGES_ROOT = path.join(PORTAL_ROOT, 'lib', 'apollo', 'packages')
const OUT_FILE = path.join(PORTAL_ROOT, 'lib', 'apollo', 'packages-data.generated.ts')

const CATALOG_PATH = path.join(PACKAGES_ROOT, 'catalog', 'catalog.json')
const MODULES_DIR = path.join(PACKAGES_ROOT, 'catalog', 'modules')
const SCHEMAS_DIR = path.join(PACKAGES_ROOT, 'schemas')
const STYLE_LIBRARY_DIR = path.join(PACKAGES_ROOT, 'style-library')

function readJson(p) {
  return JSON.parse(fs.readFileSync(p, 'utf8'))
}

function readDirJson(dir, suffix) {
  const out = {}
  if (!fs.existsSync(dir)) return out
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(suffix))
  for (const file of files) {
    const slug = file.slice(0, -suffix.length)
    out[slug] = readJson(path.join(dir, file))
  }
  return out
}

function readStyleLibrary(dir) {
  // styles[industrySlug][styleId] = raw markdown
  const out = {}
  if (!fs.existsSync(dir)) return out
  const industries = fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
  for (const ind of industries) {
    const industryDir = path.join(dir, ind)
    const files = fs.readdirSync(industryDir).filter((f) => f.endsWith('.md'))
    out[ind] = {}
    for (const file of files) {
      const id = file.slice(0, -'.md'.length)
      out[ind][id] = fs.readFileSync(path.join(industryDir, file), 'utf8')
    }
  }
  return out
}

const catalog = readJson(CATALOG_PATH)
const modules = readDirJson(MODULES_DIR, '.json')
const schemas = readDirJson(SCHEMAS_DIR, '.schema.json')
const styles = readStyleLibrary(STYLE_LIBRARY_DIR)

const moduleCount = Object.keys(modules).length
const schemaCount = Object.keys(schemas).length
const styleCount = Object.values(styles).reduce((acc, m) => acc + Object.keys(m).length, 0)

const banner = `// AUTO-GENERATED — do not edit by hand.
// Source: apps/portal/lib/apollo/packages/**
// Regenerate: npm run prebuild  (runs scripts/generate-packages-data.mjs)
//
// Inlines the catalog/modules/schemas/style-library tree so packages-loader.ts
// has zero runtime file dependencies — required for Vercel serverless where
// outputFileTracingIncludes is unreliable with the --turbopack production build.
//
// Counts at generation time: ${moduleCount} modules, ${schemaCount} schemas, ${styleCount} styles.

/* eslint-disable */
`

const body = `
export const CATALOG_RAW = ${JSON.stringify(catalog, null, 2)} as const;

export const MODULES_RAW: Record<string, unknown> = ${JSON.stringify(modules, null, 2)};

export const SCHEMAS_RAW: Record<string, unknown> = ${JSON.stringify(schemas, null, 2)};

export const STYLES_RAW: Record<string, Record<string, string>> = ${JSON.stringify(styles, null, 2)};
`

fs.writeFileSync(OUT_FILE, banner + body, 'utf8')

console.log(
  '[generate-packages-data] wrote ' +
    path.relative(PORTAL_ROOT, OUT_FILE) +
    ` (${moduleCount} modules, ${schemaCount} schemas, ${styleCount} styles)`
)
