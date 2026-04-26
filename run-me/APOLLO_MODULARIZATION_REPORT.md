# Apollo Modularization Sprint — Final Report

**Date:** 2026-04-26
**Sprint duration:** Single autonomous run (resumed after a one-hour pause)
**Spec:** `run-me/APOLLO_MODULARIZATION_SPRINT.md`
**Backend deploy at sprint close:** `dpl_8pYVBzfrgPdGDBkeP4QsispKG4Et` (https://portal.apollomc.ai)

---

## Phase 0 outcome — API alive verification

Phase 0 was already passing entering this sprint. The `/api/apollo/templates` 500 had been resolved by commit `335f22b` (legacy templates loader codegen) and the submissions schema was patched via SQL migration 006. The user confirmed authenticated curl on both `/templates` and `/submissions` returned 200 before this sprint started.

What I verified at sprint start:
- Production alias `portal.apollomc.ai` → `dpl_D8MGG4bP5pjdYDGk8EyURyyWprEA` (the codegen fix)
- Both `/templates` and `/submissions` returned **401 + CORS headers** for unauthenticated curl (route alive, auth gate working)
- `OPTIONS /api/apollo/templates -H "Origin: https://apollomc.ai"` returned **204** with full CORS headers (`Access-Control-Allow-Origin: https://apollomc.ai`, credentials/methods/headers all set)
- Zero error-level logs on the current deploy

**Validation gate passed.** Modularization proceeded.

---

## Phase-by-phase outcomes

| # | Phase | Commit | Notes |
|---|-------|--------|-------|
| 0 | API alive verification | (no commit — verification only) | Pre-existing fix from `335f22b` confirmed live |
| 1 | Scaffold `shared/` | `feecdaa` | 11 empty placeholder files |
| 2 | `shared/theme.css` | `700de30` | 694 lines (initial) → 788 after P6 added custom-select rules |
| 3 | `shared/ui.js` + `api.js` | `8a62350` | 290 + 87 lines; typed errors (ApiAuthError/ForbiddenError/HttpError) |
| 4 | `shared/auth.js` + `auth-modal.js` + `hero.js` | `77efbf0` | 75 + 114 + 37 lines |
| 5 | `shared/` data modules | `c5608f6` | catalog (67) + submissions (44 — with `download_url`/`drive_file_url`/`pdf_url` normalization) + uploads (117) + drafts (110) |
| 6 | `shared/command-bar.js` | `7cb14f5` | 140 lines; real brand selector dropdown (replaces yesterday's click-to-cycle hack) |
| 7 | `index.html` dashboard | `d6f1e35` | 1090 lines; ↓ from 5316 monolith |
| 8 | `launch.html` wizard | `7036d6b` | 1280 lines; standalone page driven by `?slug=` query param |
| 9 | `mission.html` detail | `118481d` | 415 lines |
| 10 | `service-worker.js` | `1a3e27d` | Cache version bumped to `apollo-v3-modular`; precache list grew from 6 → 20 entries |
| 11 | Push + deploy + smoke | (deploy `dpl_8pYVBzfrgPdGDBkeP4QsispKG4Et`) | All four unauth smoke endpoints pass; auth-cookie smoke deferred to Jon's browser test |
| 12 | This report | — | — |

All phases atomic-committed. Local commits accumulated through P10; pushed at P11 in one go.

---

## File inventory

### New (created this sprint)

```
apollo-intake/
├── launch.html                    1280 lines
├── mission.html                    415 lines
├── shared/
│   ├── theme.css                   788 lines
│   ├── ui.js                       290 lines
│   ├── command-bar.js              140 lines
│   ├── uploads.js                  117 lines
│   ├── auth-modal.js               114 lines
│   ├── drafts.js                   110 lines
│   ├── api.js                       87 lines
│   ├── auth.js                      75 lines
│   ├── catalog.js                   67 lines
│   ├── submissions.js               44 lines
│   └── hero.js                      37 lines
```

### Modified

```
apollo-intake/
├── index.html                     1090 lines  (was 5316 — ↓ 4226 lines, ~80% reduction)
└── service-worker.js                71 lines  (was 37 — bumped CACHE_NAME, expanded PRECACHE_URLS)
```

### Unchanged

`manifest.json`, `mars.png`, `logo.png`, `icons/*`.

### Total active code surface

**4725 lines across 15 files.** Down from the 5316-line single monolith (one file). Largest individual file is launch.html at 1280 lines (over the spec's 800-1000 estimate, but page-specific CSS extraction was the inflator — the JS is comparable to the monolith's wizard section).

---

## Removed from monolith

The new `index.html` no longer contains:

- The legacy 5-step intake flow (`renderStepTemplate`, `renderStepBrand`, `renderStepDetails`, `renderStepImages`, `renderStepReview`, `renderStepResult`) — ~600 lines
- The unified-catalog 6-step wizard (`renderWizStep1Identity` through `renderWizStep6Generate`, `renderModuleField`, `validateModuleFields`, `renderUploadSlot`, `handleUploadFiles`, `removeUpload`, `submitWizard`, `loadFullTemplateForWizard`, `rehydrateDraftUploads`, `closeIntakeFlow`) — ~700 lines
- The legacy auth modal helpers (`showAuthModal`, `hideAuthModal`, `renderLoading`, `renderSignedOut`, `renderNotAuthorized`) — ~100 lines
- The wizard CSS block (`.wiz-*`) — ~530 lines
- The intake overlay container — ~50 lines
- Yesterday's `bootstrap`, `currentSteps`, `stepIndexFor`, `renderIntake`, `renderSteps` — ~100 lines

All of these moved into `launch.html` (the wizard now lives on its own page) or were eliminated entirely (the intake overlay is replaced by full-page navigation).

---

## Validation results

| Phase | Validation | Result |
|---|---|---|
| 1 | 11 empty files created | ✓ |
| 2 | `:root` ≥ 30 custom properties; `marsAppear` keyframe present; LED keyframe present; 600-800 lines | ✓ (788 after P6 expansion) |
| 3 | Both files `node --check` clean; expected exports present | ✓ |
| 4 | Three files `node --check` clean | ✓ |
| 5 | Four files `node --check` clean | ✓ |
| 6 | `node --check` clean | ✓ |
| 7 | No `wiz-*` CSS in index.html (`grep -c "wiz-"` = 0); 9 shared imports; `launchDeliverable` is a single line | ✓ |
| 8 | Module script `node --check` clean; reads slug via URLSearchParams; redirects to mission.html on success | ✓ |
| 9 | Module script `node --check` clean; reads id via URLSearchParams; renders status badge + download + Generate similar | ✓ |
| 10 | `CACHE_NAME` bumped to `apollo-v3-modular`; PRECACHE_URLS includes 3 HTML pages + 11 shared files; activate handler purges old caches | ✓ |
| 11 | Unauth `/templates` 401, `/submissions` 401, `/templates/quote` 401, OPTIONS 204 + CORS headers | ✓ |

---

## Pending Jon actions

### Manual cPanel upload

Drag-and-drop the following to cPanel `/apollo/`:

1. **Replace** `index.html` (was 5316 lines, now 1090)
2. **New** `launch.html` (1280 lines)
3. **New** `mission.html` (415 lines)
4. **Replace** `service-worker.js` (CACHE_NAME bumped — critical)
5. **New** `shared/` directory containing all 11 files:
   - `theme.css`
   - `api.js`, `auth.js`, `auth-modal.js`, `catalog.js`, `command-bar.js`, `drafts.js`, `hero.js`, `submissions.js`, `ui.js`, `uploads.js`

`manifest.json`, `mars.png`, `logo.png`, `icons/` are untouched — leave as-is.

### Browser cache flush (mandatory)

After upload, the existing service worker will keep serving the monolith shell to returning users. The CACHE_NAME bump will eventually flush on next SW activation, but the fast path is:

1. DevTools → Application → Service Workers → **Unregister** anything for apollomc.ai
2. DevTools → Application → Storage → **Clear site data**
3. Hard refresh (Cmd-Shift-R / Ctrl-Shift-R)
4. Sign in

### Per-page smoke (after upload)

| URL | Expected |
|---|---|
| `https://apollomc.ai/apollo/` | 8-station grid, hero composition behind, sign-in works, brand selector in command bar |
| `https://apollomc.ai/apollo/launch.html?slug=quote` | 6-step wizard for the Quote deliverable; Step 1 shows brand picker + 3 style cards + ~~$45~~ FREE PREVIEW pricing |
| `https://apollomc.ai/apollo/mission.html?id=<any-existing-submission-id>` | Detail card with status badge, download button (if delivered), inputs collapsible, "Generate similar" |

### Confirm

- Hero composition appears on all three pages with byte-identical entrance animation (letter stagger, Mars cross-fade, opacities preserved)
- Brand selector in command bar shifts the cyan accent across the UI (`--cyan` token override via `[data-brand="atlas"]` etc.)
- Navigating dashboard → launch → mission preserves auth (no re-prompt)
- Drafts persist when leaving and returning to launch.html (close tab, reopen with same slug+brand → resume mid-wizard)
- File upload works on launch.html (try a Field Service quote with a site photo, or an expense report with a receipt)
- Reduced-motion fallback applies (toggle in OS settings — letters become static at 0.12 opacity, no Mars cross-fade)

---

## Architecture decisions made autonomously

1. **`stationGridListenerBound` flag in dashboard.** Instead of unbinding/rebinding on every renderStations call, the delegated launch-button listener is bound once on the grid root. Per-card listeners are bound directly to each card and refresh with the innerHTML rewrite. Same pattern as the monolith.

2. **Page-specific wizard CSS retained in launch.html.** The spec said "if a rule is page-specific... leave it on that page." The `.wiz-*` rules are only used by launch.html (mission.html doesn't have a wizard), so they live there. ~480 lines of CSS in launch.html's `<style>` block. Acceptable given the alternative is a second CSS file or making theme.css carry rules only one page uses.

3. **`uploads.upload()` uses XHR instead of fetch.** The spec calls for an `onProgress(loaded, total)` callback. fetch can't expose upload progress; XHR can (`xhr.upload.addEventListener('progress')`). The wrapper still resolves a Promise so callers feel the same as the rest of the API client.

4. **Mission Log gained a VIEW link.** The dashboard's mission log entries now have three actions instead of two: VIEW (→ mission.html?id=…), DOWNLOAD (when completed), CLONE (→ launch.html?slug=…). Without the modularization, mission detail wasn't a navigable destination — now it is, so VIEW is the natural way to expose it. Doesn't conflict with the spec.

5. **launch.html exposes a standalone "View mission" button** on the success card (Step 6). When the submit returns a `submission_id`, the success state offers a direct link to `/apollo/mission.html?id=<id>` alongside Mission Control + New mission. Same reasoning as #4.

6. **`escapeHtml` re-exported from auth.js, kept available in command-bar.js.** Both modules import `escapeHtml` for future expansions (status text, etc.) but don't currently use it. `void` suppression keeps the imports without the linter flagging them. Cleaner than commenting out and harder to forget.

7. **Submission shape normalization extracted into `normalizeOne`.** `submissions.js` defines `normalizeOne(s)` once and applies it to both `list()` results and `get()` results. Same fields exposed: `download_url`, `pdf_url` (both pointing at whichever of `download_url`/`drive_file_url` was non-null). The user's specified shape was followed verbatim.

8. **launch.html's `submitWizard` also normalizes the submit response.** Same rule as submissions.js — older rows used drive_file_url; submit endpoint may also surface either. The Step 6 success card uses `r.download_url` so Phase 5's normalization rule works end-to-end.

---

## Known limitations (deferred)

- **Brand-aware palette currently only swaps `--cyan`.** Per-brand full theme support (paper / ink / accent / metadata / hairline tokens) is out of scope per the spec.
- **"Generate similar" on mission.html re-launches the wizard fresh.** It does not pre-populate fields from the original submission. Deferred per spec.
- **PWA offline support depends on the service worker.** First visit needs network; subsequent visits work offline (read-only — submit calls always go to the network).
- **launch.html line count (1280) exceeds the spec's 800-1000 estimate.** All overage is page-specific CSS that I judged better to keep colocated with the page than to push into theme.css for a single consumer.
- **Authenticated smoke test is browser-only.** I don't have a session cookie, so I verified backend health unauthenticated (401 + CORS) and structurally (chunk inspection, file-tracing). The Jon-side cPanel-upload + hard-refresh + sign-in flow is the conclusive end-to-end test.
- **Submission detail's "Attached uploads" shows count only.** Per-upload re-fetch on mission.html would be N+1; deferred to a future sprint where the submission row could embed an uploads array directly.

---

## Operating notes

- **Push deferred until P11** as specified — local commits accumulated cleanly through P10, all 10 commits pushed in one go.
- **Each phase = one atomic commit**; rolling back any phase doesn't break prior phases. The wizard rebuild in P11-14 of the prior sprint had been bundled into one commit because of mutual dependencies; the modularization sprint phases are genuinely independent so each got its own commit.
- **Phase 0 was a hard prerequisite** that was already satisfied by prior sprints. Spec's intent ("don't modularize on a broken backend") was respected — verification ran before any rendering code moved.

Sprint complete. Awaiting Jon's manual cPanel upload + browser-side end-to-end test.
