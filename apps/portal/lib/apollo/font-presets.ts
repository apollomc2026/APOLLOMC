// Five curated typographic presets for Apollo PDF output. Each preset is a
// self-contained package of display/body/mono font stacks + weights + the
// Google Fonts URL that loads them. The PDF renderer uses the preset's
// values instead of hardcoded font strings.

export type FontPresetKey =
  | 'editorial'
  | 'classic-serif'
  | 'modern-sans'
  | 'minimal'
  | 'technical'

export interface FontPresetWeights {
  displayItalic: number // cover titles, pull quotes
  displayBold: number // h1 body
  bodyRegular: number
  bodyMedium: number // labels, emphasized text
  bodyBold: number // strong
  monoRegular: number
}

export interface FontPreset {
  key: FontPresetKey
  label: string
  description: string
  googleFontsUrl: string
  displayFont: string
  bodyFont: string
  monoFont: string
  weights: FontPresetWeights
}

export const FONT_PRESETS: Record<FontPresetKey, FontPreset> = {
  editorial: {
    key: 'editorial',
    label: 'Editorial',
    description:
      'Italic display serif, humanist sans body. Feels like a premium magazine or law-firm letterhead.',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600;700&display=swap',
    displayFont: "'Cormorant Garamond', Georgia, serif",
    bodyFont: "'Inter', -apple-system, 'Segoe UI', sans-serif",
    monoFont: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
    weights: {
      displayItalic: 400,
      displayBold: 600,
      bodyRegular: 400,
      bodyMedium: 500,
      bodyBold: 600,
      monoRegular: 400,
    },
  },
  'classic-serif': {
    key: 'classic-serif',
    label: 'Classic Serif',
    description:
      'Traditional serif throughout, like a law brief or whitepaper. Authoritative and timeless.',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap',
    displayFont: "'EB Garamond', 'Times New Roman', serif",
    bodyFont: "'Source Serif 4', Georgia, serif",
    monoFont: "'JetBrains Mono', Consolas, monospace",
    weights: {
      displayItalic: 400,
      displayBold: 600,
      bodyRegular: 400,
      bodyMedium: 500,
      bodyBold: 600,
      monoRegular: 400,
    },
  },
  'modern-sans': {
    key: 'modern-sans',
    label: 'Modern Sans',
    description:
      'Crisp geometric sans throughout. Tech-forward, Silicon Valley polish.',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400&display=swap',
    displayFont: "'Inter', -apple-system, sans-serif",
    bodyFont: "'Inter', -apple-system, sans-serif",
    monoFont: "'JetBrains Mono', Consolas, monospace",
    weights: {
      displayItalic: 400,
      displayBold: 700,
      bodyRegular: 400,
      bodyMedium: 500,
      bodyBold: 700,
      monoRegular: 400,
    },
  },
  minimal: {
    key: 'minimal',
    label: 'Minimal',
    description:
      'Understated sans with light weights and generous spacing. Feels like a Kinfolk magazine or a Swiss design museum catalog.',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap',
    displayFont: "'Manrope', -apple-system, sans-serif",
    bodyFont: "'Manrope', -apple-system, sans-serif",
    monoFont: "'JetBrains Mono', Consolas, monospace",
    weights: {
      displayItalic: 400,
      displayBold: 600,
      bodyRegular: 300,
      bodyMedium: 500,
      bodyBold: 600,
      monoRegular: 400,
    },
  },
  technical: {
    key: 'technical',
    label: 'Technical',
    description:
      'Monospace display, clean sans body. For engineering reports, technical specs, field documentation.',
    googleFontsUrl:
      'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@500;700&family=Inter:wght@400;500;600&display=swap',
    displayFont: "'JetBrains Mono', 'SFMono-Regular', Consolas, monospace",
    bodyFont: "'Inter', -apple-system, sans-serif",
    monoFont: "'JetBrains Mono', Consolas, monospace",
    weights: {
      displayItalic: 500,
      displayBold: 700,
      bodyRegular: 400,
      bodyMedium: 500,
      bodyBold: 600,
      monoRegular: 500,
    },
  },
}

export function resolvePreset(key?: string | null): FontPreset {
  if (key && key in FONT_PRESETS) return FONT_PRESETS[key as FontPresetKey]
  return FONT_PRESETS.editorial
}

export function listPresets(): Array<{
  key: string
  label: string
  description: string
}> {
  return Object.values(FONT_PRESETS).map(({ key, label, description }) => ({
    key,
    label,
    description,
  }))
}

export function isValidPresetKey(key: string): key is FontPresetKey {
  return key in FONT_PRESETS
}
