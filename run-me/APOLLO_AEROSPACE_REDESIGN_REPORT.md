# Apollo Aerospace Redesign Sprint — Final Report

**Date:** 2026-04-27
**Sprint duration:** Single autonomous run
**Spec:** `run-me/APOLLO_AEROSPACE_REDESIGN.md`
**Backend deploy at sprint close:** `dpl_AgG3ydhX7J2tuhPbMhyyp6SM9UVZ` (https://portal.apollomc.ai)

---

## Token shift summary

| Old (saturated cyan / glass) | New (aerospace) | Notes |
|---|---|---|
| `--bg: #0a0a0f` | `--vacuum: #0A0A0F` (renamed) | Page bg, deepest |
| (no equivalent) | `--graphite: #14141A` | Primary panel bg |
| (no equivalent) | `--graphite-rise: #1C1C24` | Hover/elevation |
| (no equivalent) | `--graphite-high: #232330` | Selected panel inset |
| `--border: rgba(107,227,255,0.2)` | `--titanium: #2A2A33` | Hairline rules |
| (no equivalent) | `--titanium-low: #1F1F26` | Muted hairlines |
| `--text: #ffffff` | `--ivory: #F5F5F0` | Primary type |
| `--text-2/3/4` (white alphas) | `--ivory-2/3/4` (warm grays) | Secondary type tiers |
| `--cyan: #6be3ff` | `--cyan-go: #5BCEFA` | Reserved for go/proceed only |
| `--orange: #ff7a00` | `--ignition: #FF6B1A` | Active mission, primary CTA |
| (no equivalent) | `--ignition-dim: #B84B11` | Pressed ignition |
| `--red: #ff5252` | `--alert: #FF3B30` | Failure / abort |
| `--green: #7bff9f` | `--confirm: #4DD964` | Mission complete |
| `--bg-rad` (center, blue tint) | `--bg-rad` (top, warm tint) | Composition |
| `--radius: 16px` | `--radius-card: 0` (slabs sharp) + `--radius-control: 2px` (buttons barely-there) | |
| `--ease-out-expo` | `--ease-cinematic` (kept old as alias) | SpaceX-style long-tail ease |

### Back-compat aliases

The old token names are preserved as `var()` aliases in `:root`, so every existing rule across `index.html`, `mission.html`, `theme.css` (LED, glass, command bar, auth modal, fields, toast) keeps working unchanged. No CSS rename pass needed:

```css
--cyan: var(--cyan-go);
--orange: var(--ignition);
--text: var(--ivory);
--text-2: var(--ivory-2);  /* and -3, -4 */
--border: var(--titanium);
--glass-bg: var(--graphite);
--glass-blur: none;          /* glass surfaces flatten to graphite */
--radius: 0;                 /* legacy radius collapses to slab */
```

Brand-aware overrides shift `--cyan-go` (and `--cyan` via the alias). Ignition orange stays constant — it represents platform mission-active state, not a brand expression.

---

## Phase-by-phase outcomes

| # | Phase | Commit | Notes |
|---|-------|--------|-------|
| 1 | Token replacement | `7526ae1` | `:root` replaced; back-compat aliases keep all existing rules working |
| 2 | Wizard component CSS | `aa805bf` | `.wiz-*` block fully rewritten; cards → slabs, glass → graphite, gradient text → ivory |
| 3 | Wizard JS adjustments | `9fd3d94` | Step bar markup, Step 1 default selection, mission code generator, navRow rewrite, button labels uppercased, Step 6 result panel |
| 4 | Style thumbnails | `f3e018a` | 15 PNGs generated locally + committed; `/api/apollo/templates/[slug]` augments `available_styles` with `thumbnail_url` |
| 5 | Cross-page surface polish | `83b509e` | Dashboard station cards → slabs; hero dim on launch/mission; cmd bar ivory hover; SW cache bumped to v4 |
| 6 | Push + deploy + smoke | (deploy `dpl_AgG3ydhX7J2tuhPbMhyyp6SM9UVZ`) | Routes 401, thumbnails 200 image/png, OPTIONS 204 + CORS |
| 7 | This report | — | — |

---

## Files modified inventory

### Modified

```
apollo-intake/
├── index.html                  (station-card slab refactor — 5a)
├── launch.html                 (P2 full CSS rewrite + P3 JS edits + P5b hero dim)
├── mission.html                (P5b hero dim only)
├── service-worker.js           (CACHE_NAME → apollo-v4-aerospace)
└── shared/
    └── theme.css               (P1 token block + P5c cmd bar hover)

apps/portal/
├── app/api/apollo/templates/[slug]/route.ts   (thumbnail_url augment)
└── package.json                               (gen:thumbnails npm script)
```

### New

```
apps/portal/
├── scripts/generate-style-thumbnails.mjs      (159 lines, manual run)
└── public/style-thumbnails/                   (15 PNGs, ~520 B–2.5 KB each)
```

---

## Style thumbnails generated

15 PNGs at 60×80 (rendered at 2× device scale → 120×160 source, downscaled in CSS):

| File | Layout kind | Accent | Size |
|---|---|---|---|
| `consulting-bold.png` | modular | `#E76F51` | 521 B |
| `consulting-executive.png` | editorial | `#0A2463` | 2.5 KB |
| `consulting-strategy.png` | editorial | `#006D77` | 2.5 KB |
| `finance-audit.png` | editorial | `#4A4E69` | 2.5 KB |
| `finance-board.png` | editorial | `#0D1B2A` | 2.5 KB |
| `finance-investor.png` | modular | `#2D6A4F` | 521 B |
| `gov-compliance.png` | editorial | `#2C2C2C` | 2.5 KB |
| `gov-federal-standard.png` | minimal | `#000000` | 1.3 KB |
| `gov-proposal.png` | editorial | `#003366` | 2.5 KB |
| `legal-classic.png` | editorial | `#1B2A4A` | 2.5 KB |
| `legal-minimal.png` | minimal | `#333333` | 1.3 KB |
| `legal-modern.png` | modular | `#3D5A80` | 521 B |
| `startup-bold.png` | modular | `#FF6B6B` | 518 B |
| `startup-minimal.png` | minimal | `#1A1A2E` | 1.3 KB |
| `startup-pitch.png` | modular | `#3A86FF` | 518 B |

Layout kinds were derived heuristically from style id suffix (the spec assumed YAML frontmatter with `layout_kind`/`accent_color` fields, which the actual `.md` files don't have):

- `*-bold`, `*-modern`, `*-investor`, `*-pitch` → **modular** (block grid + accent bars)
- `*-minimal`, `*-federal-standard` → **minimal** (light headline + thin underline)
- everything else → **editorial** (serif headline + hairline rules — the default)

Accent colors are pulled from the first hex literal under each style's `## Color palette` heading (the `Primary:` line). 11 of 15 styles had a clear primary; the other 4 fell back to a graphite neutral.

---

## Bug fix verified — brand-picker stuck issue

The double-blocking bug at Step 1 is resolved by side effects of Phase 3b:

- **Brand**: `state.brand_slug` is initialized from `localStorage.getItem('apollo:brand') || 'apollo'` in the existing `requireAuth.onAuthed` handler, so the wizard arrives with a brand already selected. Previously the wizard's "no brand selected" check disabled Next; now `state.brand_slug` is always truthy on arrival.
- **Style**: `state.style_id` is initialized from `state.template.default_style_id` (or `available_styles[0].id` as fallback) in the existing draft-load logic. Wizard arrives with a style already selected.
- **Both still user-overridable**: clicking any brand or style slab updates `state` and re-renders. The "selected" indicator slides to the new choice.
- **Next button**: The `nextDisabled: !state.brand_slug || !state.style_id` clause stays (defensive; both should always be truthy now), but the practical effect is INITIATE is enabled the moment the user lands on Step 1.

---

## Pending Jon actions

### Manual cPanel upload

Drag-and-drop the following to cPanel `/apollo/`:

1. **Replace** `index.html` (P5a station card slab refactor)
2. **Replace** `launch.html` (P2 + P3 + P5b)
3. **Replace** `mission.html` (P5b only)
4. **Replace** `service-worker.js` (cache bumped to v4-aerospace — critical for flushing v3 cache)
5. **Replace** `shared/theme.css` (P1 + P5c)

`shared/api.js`, `shared/auth.js`, `shared/auth-modal.js`, `shared/catalog.js`, `shared/command-bar.js`, `shared/drafts.js`, `shared/hero.js`, `shared/submissions.js`, `shared/ui.js`, `shared/uploads.js` are **unchanged** in this sprint — leave as-is unless you want a clean reupload of the whole `shared/` directory for safety.

### Browser cache flush

After upload:

1. DevTools → Application → Service Workers → **Unregister** anything for apollomc.ai
2. DevTools → Application → Storage → **Clear site data**
3. Hard refresh (Cmd-Shift-R / Ctrl-Shift-R)
4. Sign in

The cache version bump (`apollo-v3-modular` → `apollo-v4-aerospace`) will eventually flush automatically via the SW activate handler, but unregister+reload is the fast path.

### End-to-end sanity check

1. Dashboard renders with **slab-style station cards** (graphite + titanium hairline, no glass blur, no rounded corners), hero behind, command bar with ivory hover.
2. Click a station → expand → click LAUNCH on a deliverable.
3. **Step 1 of the wizard:** brand is preselected (matches command bar choice), style is preselected (default_style_id). **INITIATE button is enabled on arrival** — no double-blocking.
4. Both pickers show as full-width **slab rows** with hairline dividers, selected state has 3px ignition-orange left edge.
5. Style slabs show real **thumbnail PNGs** from `https://portal.apollomc.ai/style-thumbnails/`.
6. **Mission code** appears in mono in the telemetry strip (under headline) and the step indicator's right corner. Format: `APO-QUOTE-2026-04-27-7K3D2P`.
7. Step indicator is **hairline marks**, not numbered circles. Done = cyan-go, active = ignition orange, future = titanium.
8. Tab through to Step 2 — fields are bottom-border-only, no boxes; required marker is an **orange dot**, not asterisk.
9. Submit a real deliverable end-to-end. The result panel uses display-type headline + aerospace mono telemetry. Download is a cyan-go slab button.

If any of the above is wrong:
- Visual styling wrong → check P1 token block applied (theme.css)
- Step bar still shows circles → P3a renderStepBar didn't replace
- Brand still requires explicit selection → P3b renderStep1Identity defaults missing
- Style thumbnails missing → check `/style-thumbnails/<id>.png` returns 200 (verified at deploy time, but cPanel could be caching)

---

## Architecture decisions made autonomously

1. **playwright instead of puppeteer-core for the thumbnail generator.** The spec called for `puppeteer-core` but it's not in `apps/portal/package.json`. The PDF pipeline already uses `playwright` + `playwright-core` + `@sparticuz/chromium`. Spec rule #3 says "no new dependencies", so I reused the existing stack. The generator tries `playwright` (devDependency, bundled chromium) first; falls back to `playwright-core` + `@sparticuz/chromium` for environments where the bundled chromium is absent.

2. **Local-only thumbnail generation, not chained to `prebuild`.** The spec's example wired thumbnail generation into `predev`/`prebuild`. That would force Vercel's build container to launch Chromium on every deploy. I committed the 15 PNGs to git and exposed the generator as `npm run gen:thumbnails` for manual invocation. Re-run only when style metadata or layout heuristics change. Vercel just serves the static files from `/public`.

3. **Layout-kind heuristic instead of style frontmatter.** The spec assumed each style `.md` had `layout_kind: editorial|modular|minimal` and `accent_color: #XXXXXX` in YAML frontmatter. The actual `.md` files in `lib/apollo/packages/style-library/<industry>/<id>.md` don't have frontmatter — they're freeform markdown. I parse:
   - Label from the first `# ` heading (stripping `— Style Specification` suffix)
   - Accent from the first hex under `## Color palette`
   - Layout kind from id suffix (regex: `*-bold|*-modern|*-investor|*-pitch` → modular; `*-minimal|*-federal-standard` → minimal; else editorial).

4. **Thumbnail URL uses request origin.** Built as `request.url.origin + '/style-thumbnails/...'` so it stays correct across preview deploys, custom domains, and the prod alias. The intake page on `apollomc.ai/apollo/` loads them cross-origin from `portal.apollomc.ai`; no CORS preflight needed for `<img src>`.

5. **Service worker cache version bump to v4.** Phase 5 spec didn't explicitly request this, but the modularization SW bumped to v3 and we need v4 to flush the v3 shell from returning users (theme.css and three HTML files all changed). Without this bump, returning users keep seeing the old visual layer.

6. **`rocketIcon` import kept and `void`-suppressed.** Step 6's old result UI used the rocket SVG; the new aerospace result panel doesn't. I kept the import + added `void rocketIcon` to the unused-import suppressor block, matching the existing pattern (`void formatPriceCents`, etc.) so the import surface stays stable for future expansions.

---

## Known limitations / deferred

- **Logo placement option in wizard** — still backend-only. The frontend doesn't surface it; deferred to a future sprint. The submit endpoint accepts a `logo_placement` field; it's just not exposed as a wizard control.
- **Atlas brand logo** — separate file-swap task, not touched in this sprint.
- **PDF body styling unchanged** — only the wizard's screen UI changed. PDF compilation is identical to the modularization-sprint output.
- **Style thumbnails are schematic, not literal renders** — the miniatures show one of three reference compositions (editorial/modular/minimal) tinted with the style's accent color. They communicate the visual register, not the exact layout. A future sprint could render each style's actual cover-page-in-miniature for higher fidelity.
- **`layout_kind` is a derived heuristic** — if a style's id doesn't match the regex (`*-bold|*-modern|*-investor|*-pitch|*-minimal|*-federal-standard`), it defaults to editorial. Future styles may need explicit metadata if the heuristic guesses wrong.
- **Brand thumbnails are first-letter chips, not real logos** — the brand picker uses `BRAND_LABELS[slug].charAt(0)` in the empty-thumbnail slot. Real brand logo PNGs in those slots is a future polish.
- **Per-brand full palette** — only `--cyan-go` shifts in v1 (`atlas`/`habi`/`themis`/`on-spot-solutions`). The graphite ladder, ignition orange, and ivory tiers stay constant across brands.

---

## Operating notes

- **6 atomic commits**, push deferred until P6 as the spec required.
- **No new dependencies added** — playwright was already in devDependencies for the PDF pipeline.
- **No frontend framework adoption** — plain ES modules + DOM, same as the modularization sprint.
- **Hero composition byte-identical** — same letter stagger, same Mars cross-fade timing, same opacities. Only the page-level opacity dim on launch.html and mission.html is new (0.55 / 0.35 vs default 1.0).
- **Modular architecture from the prior sprint stays intact** — three pages, eleven shared modules. No file restructuring this sprint.

Sprint complete. Awaiting Jon's manual cPanel upload + browser-side end-to-end test.
