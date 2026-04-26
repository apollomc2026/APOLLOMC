// Generates two TS modules at build time so packages-loader.ts and
// templates.ts have zero runtime file dependencies:
//
//   apps/portal/lib/apollo/packages-data.generated.ts
//     ← lib/apollo/packages/catalog + modules + schemas + style-library
//
//   apps/portal/lib/apollo/templates-data.generated.ts
//     ← lib/apollo/templates/*.json (yesterday's flat templates dir,
//       still consumed by /api/apollo/submissions and the legacy
//       FormData submit path)
//
// Why: both loaders originally read via fs.readFileSync at runtime.
// That works in dev but fails on Vercel serverless because
// outputFileTracingIncludes is not honored reliably with --turbopack —
// the per-route .nft.json lists the files locally but the deployed
// function still ENOENTs at runtime.
//
// Bundling via generated TS modules sidesteps file tracing entirely:
// the JSON/MD content lives inside the JS chunk.
//
// Run automatically by the predev / prebuild npm hooks, and committed
// to the repo so dev / type-check work without explicit codegen.

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORTAL_ROOT = path.resolve(__dirname, '..')
const PACKAGES_ROOT = path.join(PORTAL_ROOT, 'lib', 'apollo', 'packages')
const PACKAGES_OUT = path.join(PORTAL_ROOT, 'lib', 'apollo', 'packages-data.generated.ts')

const CATALOG_PATH = path.join(PACKAGES_ROOT, 'catalog', 'catalog.json')
const MODULES_DIR = path.join(PACKAGES_ROOT, 'catalog', 'modules')
const SCHEMAS_DIR = path.join(PACKAGES_ROOT, 'schemas')
const STYLE_LIBRARY_DIR = path.join(PACKAGES_ROOT, 'style-library')

const TEMPLATES_DIR = path.join(PORTAL_ROOT, 'lib', 'apollo', 'templates')
const TEMPLATES_OUT = path.join(PORTAL_ROOT, 'lib', 'apollo', 'templates-data.generated.ts')

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

// ---- packages (unified catalog) ----

const catalog = readJson(CATALOG_PATH)
const modules = readDirJson(MODULES_DIR, '.json')
const schemas = readDirJson(SCHEMAS_DIR, '.schema.json')
const styles = readStyleLibrary(STYLE_LIBRARY_DIR)

const moduleCount = Object.keys(modules).length
const schemaCount = Object.keys(schemas).length
const styleCount = Object.values(styles).reduce((acc, m) => acc + Object.keys(m).length, 0)

const packagesBanner = `// AUTO-GENERATED — do not edit by hand.
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

const packagesBody = `
export const CATALOG_RAW = ${JSON.stringify(catalog, null, 2)} as const;

export const MODULES_RAW: Record<string, unknown> = ${JSON.stringify(modules, null, 2)};

export const SCHEMAS_RAW: Record<string, unknown> = ${JSON.stringify(schemas, null, 2)};

export const STYLES_RAW: Record<string, Record<string, string>> = ${JSON.stringify(styles, null, 2)};
`

fs.writeFileSync(PACKAGES_OUT, packagesBanner + packagesBody, 'utf8')

console.log(
  '[generate-packages-data] wrote ' +
    path.relative(PORTAL_ROOT, PACKAGES_OUT) +
    ` (${moduleCount} modules, ${schemaCount} schemas, ${styleCount} styles)`
)

// ---- templates (legacy yesterday-templates dir) ----

const templates = readDirJson(TEMPLATES_DIR, '.json')
const templatesCount = Object.keys(templates).length

const templatesBanner = `// AUTO-GENERATED — do not edit by hand.
// Source: apps/portal/lib/apollo/templates/*.json
// Regenerate: npm run prebuild  (runs scripts/generate-packages-data.mjs)
//
// Inlines yesterday's flat templates dir so lib/apollo/templates.ts has
// zero runtime file dependencies. Same Vercel/Turbopack tracing reason
// as packages-data.generated.ts.
//
// Count at generation time: ${templatesCount} templates.

/* eslint-disable */
`

const templatesBody = `
export const TEMPLATES_RAW: Record<string, unknown> = ${JSON.stringify(templates, null, 2)};
`

fs.writeFileSync(TEMPLATES_OUT, templatesBanner + templatesBody, 'utf8')

console.log(
  '[generate-packages-data] wrote ' +
    path.relative(PORTAL_ROOT, TEMPLATES_OUT) +
    ` (${templatesCount} templates)`
)
