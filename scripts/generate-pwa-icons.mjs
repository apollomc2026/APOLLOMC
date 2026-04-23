// Generates Apollo PWA icons from the canonical master logo.
// Run once when the logo or dimensions change:  node scripts/generate-pwa-icons.mjs
//
// Emits four PNGs:
//   apollo-intake/icons/icon-192.png            (any-purpose, tight crop)
//   apollo-intake/icons/icon-512.png
//   apollo-intake/icons/icon-192-maskable.png   (maskable, extra safe-area)
//   apollo-intake/icons/icon-512-maskable.png
//
// The background is Apollo void (#0a0a0f) so iOS and Android both render the
// icon on a consistent dark surface when installed via "Add to Home Screen".

import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { join } from 'node:path'

const src = 'brand-assets/apollo/apollo_logo_master.png'
const outDir = 'apollo-intake/icons'
await mkdir(outDir, { recursive: true })

const bgColor = { r: 10, g: 10, b: 15, alpha: 1 } // #0a0a0f

async function makeIcon(size, logoRatio, outName) {
  const logoSize = Math.round(size * logoRatio)
  const logoBuf = await sharp(src)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: bgColor },
  })
    .composite([{ input: logoBuf, gravity: 'center' }])
    .png()
    .toFile(join(outDir, outName))
}

// Regular ("any") icons — logo fills most of the canvas.
for (const size of [192, 512]) {
  await makeIcon(size, 0.75, `icon-${size}.png`)
}
// Maskable icons — smaller logo + more padding so launcher masks don't crop content.
for (const size of [192, 512]) {
  await makeIcon(size, 0.55, `icon-${size}-maskable.png`)
}

console.log('PWA icons generated under', outDir)
