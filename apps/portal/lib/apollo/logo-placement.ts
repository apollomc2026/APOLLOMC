// Four logo-placement options for Apollo PDFs. The user picks one per
// submission; the builder consults the option per-layout to decide whether
// to render a cover logo, a per-page header mark, a faded watermark on
// body pages, and/or a small mark above the signature block.

export type LogoPlacementKey =
  | 'cover-only'
  | 'cover-plus-header'
  | 'cover-plus-watermark'
  | 'cover-plus-sig-mark'

export interface LogoPlacementOption {
  key: LogoPlacementKey
  label: string
  description: string
}

export const LOGO_PLACEMENTS: Record<LogoPlacementKey, LogoPlacementOption> = {
  'cover-only': {
    key: 'cover-only',
    label: 'Cover only',
    description:
      'Logo appears on the cover page. Body pages are clean — no header mark, no watermark.',
  },
  'cover-plus-header': {
    key: 'cover-plus-header',
    label: 'Cover + Header',
    description:
      'Logo on cover, plus a small mark in the top-right header of every body page.',
  },
  'cover-plus-watermark': {
    key: 'cover-plus-watermark',
    label: 'Cover + Header + Watermark',
    description:
      'Logo on cover, header mark on every body page, plus a faded watermark on body pages.',
  },
  'cover-plus-sig-mark': {
    key: 'cover-plus-sig-mark',
    label: 'Cover + Header + Signature Mark',
    description:
      'Logo on cover, header mark on every body page, and a small mark above the signature block.',
  },
}

export function resolvePlacement(key?: string | null): LogoPlacementOption {
  if (key && key in LOGO_PLACEMENTS) return LOGO_PLACEMENTS[key as LogoPlacementKey]
  return LOGO_PLACEMENTS['cover-plus-header']
}

export function listPlacements(): Array<{
  key: string
  label: string
  description: string
}> {
  return Object.values(LOGO_PLACEMENTS).map(({ key, label, description }) => ({
    key,
    label,
    description,
  }))
}

export function isValidPlacementKey(key: string): key is LogoPlacementKey {
  return key in LOGO_PLACEMENTS
}

// Layout × placement matrix. Each layout that has a concept of "cover"
// honors all four placements. Layouts without a cover (invoice, one-pager,
// minutes) treat cover-only as "no logo anywhere" and the others as
// reasonable fallbacks (header mark always shown if requested).
//
// hasCoverLogo:  emit the full logo on the cover page
// hasHeaderMark: emit a small mark in the top-right of every body page
// hasWatermark:  emit a faded full-page watermark on body pages
// hasSigMark:    emit a small mark above the signature block
export interface PlacementFlags {
  hasCoverLogo: boolean
  hasHeaderMark: boolean
  hasWatermark: boolean
  hasSigMark: boolean
}

export function placementFlags(
  placement: LogoPlacementOption,
  layout: 'contract' | 'letter' | 'invoice' | 'one-pager' | 'minutes'
): PlacementFlags {
  const layoutHasCover = layout === 'contract' || layout === 'letter'
  const layoutHasSignatures = layout === 'contract' || layout === 'letter'

  const base: PlacementFlags = {
    hasCoverLogo: false,
    hasHeaderMark: false,
    hasWatermark: false,
    hasSigMark: false,
  }
  switch (placement.key) {
    case 'cover-only':
      return { ...base, hasCoverLogo: layoutHasCover }
    case 'cover-plus-header':
      return { ...base, hasCoverLogo: layoutHasCover, hasHeaderMark: true }
    case 'cover-plus-watermark':
      return {
        ...base,
        hasCoverLogo: layoutHasCover,
        hasHeaderMark: true,
        hasWatermark: true,
      }
    case 'cover-plus-sig-mark':
      return {
        ...base,
        hasCoverLogo: layoutHasCover,
        hasHeaderMark: true,
        hasSigMark: layoutHasSignatures,
      }
  }
}
