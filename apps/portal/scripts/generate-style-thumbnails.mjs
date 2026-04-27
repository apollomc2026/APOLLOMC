// Generates a 60×80px PNG preview for each style in
// lib/apollo/packages/style-library/<industry>/<style>.md.
//
// Output: apps/portal/public/style-thumbnails/<style-id>.png
//
// Run manually: `node scripts/generate-style-thumbnails.mjs`. The PNGs are
// committed to the repo and served directly from /public, so Vercel's
// build never has to execute Chromium. Re-run only when style metadata
// or layout-kind heuristics change.
//
// Why local-only: Vercel's build container doesn't ship Chromium; we'd
// have to wire @sparticuz/chromium into the build, increasing build
// time + complexity for an asset that changes once a quarter.

import { readFile, readdir, writeFile, mkdir, stat } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const STYLES_ROOT = join(__dirname, '..', 'lib', 'apollo', 'packages', 'style-library');
const OUTPUT_DIR  = join(__dirname, '..', 'public', 'style-thumbnails');

// ---- Style discovery -------------------------------------------------

// Walk style-library/<industry>/<style-id>.md. Each style's id is the
// filename minus .md; the industry is the parent directory name.
async function loadStyles() {
  const out = [];
  let industries = [];
  try {
    industries = (await readdir(STYLES_ROOT, { withFileTypes: true }))
      .filter((d) => d.isDirectory())
      .map((d) => d.name);
  } catch {
    return out;
  }
  for (const ind of industries) {
    const dir = join(STYLES_ROOT, ind);
    let files = [];
    try {
      files = (await readdir(dir)).filter((f) => f.endsWith('.md'));
    } catch { continue; }
    for (const file of files) {
      const id = file.replace(/\.md$/, '');
      const md = await readFile(join(dir, file), 'utf8');
      out.push(parseStyle(id, ind, md));
    }
  }
  return out;
}

// Extract what the renderer needs from the freeform markdown:
//   label         — first H1, stripped of " — Style Specification"
//   accent_color  — first hex literal under the "Color palette" heading
//                   (Primary line); falls back to a neutral graphite
//   layout_kind   — derived heuristically from the style id suffix
function parseStyle(id, industry, md) {
  const lines = md.split(/\r?\n/);
  let label = id;
  for (const line of lines) {
    const m = /^#\s+(.+?)\s*$/.exec(line);
    if (m) {
      label = m[1].replace(/\s*[—-]\s*Style Specification\s*$/i, '').trim();
      break;
    }
  }
  // Extract accent_color from the first hex under the "Color palette" section.
  let accent_color = '#888';
  let inPalette = false;
  for (const line of lines) {
    if (/^##\s+Color palette/i.test(line)) { inPalette = true; continue; }
    if (inPalette) {
      if (/^##\s+/.test(line)) break; // next section
      const m = /(#[0-9A-Fa-f]{6})/.exec(line);
      if (m) { accent_color = m[1]; break; }
    }
  }
  // Layout kind heuristic — pick a miniature based on id suffix.
  // Keep deterministic so re-renders don't shuffle.
  const idLower = id.toLowerCase();
  let layout_kind = 'editorial';
  if (/(modern|bold|investor|pitch)/.test(idLower)) layout_kind = 'modular';
  if (/(minimal|minimalist|federal-standard)/.test(idLower)) layout_kind = 'minimal';
  return { id, industry, label, accent_color, layout_kind };
}

// ---- Miniature compositions -----------------------------------------

function thumbnailHtml(style) {
  const accent = style.accent_color || '#888';
  const kind = style.layout_kind || 'editorial';

  // 60×80 paper (#FAFAF7), absolute-positioned marks. The renderer paints
  // these onto a cropped viewport so the resulting PNG is exactly 60×80.
  const compositions = {
    editorial:
      '<div style="position:absolute;top:8px;left:6px;right:6px;height:1px;background:' + accent + ';"></div>' +
      '<div style="position:absolute;top:18px;left:6px;right:6px;font-family:Georgia,serif;font-size:7px;font-style:italic;text-align:center;color:#222;">Investor Update</div>' +
      '<div style="position:absolute;top:34px;left:6px;right:6px;font-family:Inter,sans-serif;font-size:4px;letter-spacing:0.2em;text-align:center;color:#666;text-transform:uppercase;">PREPARED 27 APR</div>' +
      '<div style="position:absolute;bottom:8px;left:6px;right:6px;height:1px;background:' + accent + ';opacity:0.4;"></div>',
    modular:
      '<div style="position:absolute;top:6px;left:6px;width:48px;height:3px;background:' + accent + ';"></div>' +
      '<div style="position:absolute;top:14px;left:6px;width:24px;height:3px;background:#333;"></div>' +
      '<div style="position:absolute;top:24px;left:6px;right:6px;height:14px;background:#eee;"></div>' +
      '<div style="position:absolute;top:42px;left:6px;width:22px;height:14px;background:#eee;"></div>' +
      '<div style="position:absolute;top:42px;left:32px;width:22px;height:14px;background:#eee;"></div>' +
      '<div style="position:absolute;top:60px;left:6px;right:6px;height:14px;background:#eee;"></div>',
    minimal:
      '<div style="position:absolute;top:34px;left:6px;right:6px;font-family:Inter,sans-serif;font-weight:300;font-size:6px;letter-spacing:0.05em;text-align:center;color:#222;">Investor Update</div>' +
      '<div style="position:absolute;top:44px;left:24px;right:24px;height:1px;background:' + accent + ';"></div>',
  };

  return '<!doctype html><html><head><style>' +
    'body { margin:0; padding:0; background:#FAFAF7; }' +
    '.thumb { width:60px; height:80px; position:relative; background:#FAFAF7; overflow:hidden; }' +
    '</style></head><body>' +
    '<div class="thumb">' + (compositions[kind] || compositions.editorial) + '</div>' +
    '</body></html>';
}

// ---- Browser launcher -----------------------------------------------

// Try playwright (bundled Chromium) first — it's a devDependency and is
// the same library used by the PDF pipeline. Falls back to playwright-core
// + @sparticuz/chromium for environments where the bundled Chromium isn't
// present.
async function launchBrowser() {
  try {
    const { chromium } = await import('playwright');
    return await chromium.launch({ headless: true });
  } catch {}
  const { chromium } = await import('playwright-core');
  const sparticuz = (await import('@sparticuz/chromium')).default;
  return chromium.launch({
    args: sparticuz.args,
    executablePath: await sparticuz.executablePath(),
    headless: true,
  });
}

// ---- Main -----------------------------------------------------------

async function ensureDir(p) {
  try { await stat(p); } catch { await mkdir(p, { recursive: true }); }
}

async function main() {
  await ensureDir(OUTPUT_DIR);
  const styles = await loadStyles();
  if (styles.length === 0) {
    console.error('No styles found under', STYLES_ROOT);
    process.exit(1);
  }

  const browser = await launchBrowser();
  const context = await browser.newContext({
    viewport: { width: 60, height: 80 },
    deviceScaleFactor: 2, // crisp 120×160 PNG, downscaled to 60×80 in CSS
  });
  const page = await context.newPage();

  let count = 0;
  for (const style of styles) {
    await page.setContent(thumbnailHtml(style), { waitUntil: 'load' });
    const buf = await page.screenshot({
      type: 'png',
      omitBackground: false,
      clip: { x: 0, y: 0, width: 60, height: 80 },
    });
    await writeFile(join(OUTPUT_DIR, style.id + '.png'), buf);
    count++;
    console.log('  ' + style.id + '.png  (' + style.layout_kind + ', ' + style.accent_color + ')');
  }

  await context.close();
  await browser.close();
  console.log('\nGenerated ' + count + ' thumbnails to ' + OUTPUT_DIR);
}

main().catch((err) => { console.error(err); process.exit(1); });
