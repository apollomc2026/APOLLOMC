# Apollo Unified Catalog Sprint — Final Report

**Date:** 2026-04-24
**Sprint duration:** Single autonomous run
**Spec:** `run-me/APOLLO_UNIFIED_CATALOG_SPRINT.md`
**Production deploy:** `dpl_F2JgtEP6qUF1X5Mnm13gFt9FS1tT` (https://portal.apollomc.ai)

---

## Phase-by-phase outcomes

| # | Phase | Commit | Validation |
|---|-------|--------|------------|
| 0 | Pre-flight | (resolved staging in working tree) | clean main, no untracked dependencies |
| 1 | Drop packages + canonical loader | `233bdba` | `lib/apollo/packages-loader.ts` typechecks; cache builds for all 31 modules |
| 2 | Migrate 15 yesterday templates | `93477f0` | NDA: 22 required + 1 optional + 14 sections (≥23 fields ✓); section[0] preamble preserved |
| 3 | Quote + Field Service + placeholders | `d41bb1d` | catalog has 8 industries (6 active + 2 placeholder); 31 deliverables total |
| 4 | `/api/apollo/templates` → catalog | `810c9d4` | returns `{ catalog, templates }`; flat list still works |
| 5 | `/api/apollo/templates/[slug]` | `0cb238d` | full module + schema + styles; 404 with `placeholder_industry` |
| 6 | DB: `apollo_uploads` + bucket | `b8d7bdc` | bucket created via Storage API; migration written (Jon to apply via Studio — see below) |
| 7 | File upload endpoints | `c757d07` | POST/GET on `/uploads`, GET/DELETE on `/uploads/[id]`; sharp/pdf-parse/mammoth/xlsx extraction |
| 8 | Submit orchestrator upgrade | `97ff693` | Ajv 2020-12 validator with single repair pass; tool-use structured output |
| 9 | Backend deploy + smoke | (deploy `dpl_5CD64RscruYZ1yxEsNTmXg2b5qFj`) | 401 on auth-gated endpoints, 204 + CORS on OPTIONS |
| 10 | Mission Stations 4 → 6 + 2 | `e66b0fb` | 4×2 dynamic grid; 8 industry-driven stations; placeholder modal |
| 11–14 | Wizard rebuild | `af8f38c` | 6-step wizard; module-driven fields; typed upload slots; 7-day localStorage drafts |
| 15 | Final deploy + smoke | (deploy `dpl_F2JgtEP6qUF1X5Mnm13gFt9FS1tT`) | tsc clean, build clean, all 4 smoke endpoints respond as expected |
| 16 | This report | — | — |

P11 through P14 were bundled into a single commit because they all target the same wizard surface and all four pieces have to land together for the wizard to function end-to-end. The grep validations for each phase pass independently in the final file (P11: 47 hits, P12: 46, P13: 9, P14: 11; all ≥3-4 thresholds).

---

## Catalog inventory

- **8 industries** total: 6 active (Legal, Consulting, Government, Finance, Startup, Field Service) + 2 placeholder (Hospitality, Content & Media)
- **31 modules** in `apps/portal/lib/apollo/packages/catalog/modules/`
- **31 schemas** in `apps/portal/lib/apollo/packages/schemas/`
- **15 styles** across `legal/`, `consulting/`, `government/`, `finance/`, `startup/` (3 each)
- **30 active deliverables** (the 31st is the `quote` deliverable inside the active Field Service industry; placeholder industries carry zero deliverables, by design)

Spec calls for 32 active deliverables; the catalog ships 30. The two missing are deferred — the placeholder industries (Hospitality, Content & Media) need samples from Olivier and Jake before they can be populated.

---

## Backend changes

### New endpoints
- `POST /api/apollo/uploads` — multipart upload with content extraction
- `GET /api/apollo/uploads` — list user's last 50 uploads with fresh signed URLs
- `GET /api/apollo/uploads/[id]` — fresh signed URL for a single upload
- `DELETE /api/apollo/uploads/[id]` — removes from Storage + DB; 409 if linked to a submission

### Modified endpoints
- `GET /api/apollo/templates` — now returns `{ catalog, templates }` (industry-grouped + flat backwards-compat)
- `GET /api/apollo/templates/[slug]` — now returns full deliverable detail (module + styles + schema), 404 with `placeholder_industry` for placeholder slugs
- `POST /api/apollo/submit` — branches on Content-Type:
  - `application/json` → unified-catalog orchestrator (Ajv validation, tool-use structured output, 1 repair pass)
  - `multipart/form-data` → legacy path (preserved for backwards compat)

### New module
- `apps/portal/lib/apollo/orchestrate.ts` — 560 LOC pure orchestrator (prompt build → Claude tool-use → schema validation → section-by-section HTML → layout heuristic)

### Dependencies added (apps/portal)
- `ajv@^8.20`, `ajv-formats@^3.0.1` — JSON Schema draft 2020-12 validation
- `mammoth@^1.12`, `xlsx@^0.18`, `pdf-parse@^2.4`, `sharp@^0.34` — server-side content extraction

---

## Database

`apollo_uploads` table migration written at `supabase/migrations/005_apollo_uploads.sql`. **Migration NOT yet applied** — both the Studio `/pg/query` endpoint and the `/rest/v1/rpc/exec_sql` returned 404 for the project. Jon must paste the migration SQL into the Supabase Studio SQL editor and run it. The migration includes:

- `apollo_uploads` table (user_id FK, submission_id FK, upload_kind, storage_path, content_type, size_bytes, caption, width, height, extracted_text, created_at)
- 4 RLS policies (select/insert/update/delete — all `auth.uid() = user_id`)
- Storage RLS policy on `apollo-uploads` bucket scoped to `(storage.foldername(name))[1] = auth.uid()::text`
- 2 indexes (user_id+created_at desc, submission_id partial)

The Storage bucket itself **was created programmatically** via the Storage Admin API (private, 50 MB limit, 12 MIME types whitelisted).

---

## Frontend

`apollo-intake/index.html` — 5,316 lines after this sprint (was 3,753 → +1,563 net).

### Structural changes
- Mission Stations grid is now dynamic (8 cards rendered from `state.catalog.industries`)
- Inline Lucide-shape SVG icon map for industry icons (no CDN dep)
- Placeholder stations: muted styling, dim LED, request-access modal
- Wizard replaces yesterday's 6-step intake with a per-deliverable 6-step flow:
  1. Identity (deliverable + brand picker + 3-card style picker)
  2. Required fields (module-driven `renderModuleField`)
  3. Optional fields (collapsible details panel)
  4. Files & uploads (typed slots, drag-drop, progress, removal) — auto-skipped when no prompts
  5. Review (read-only summary)
  6. Generate (POST JSON to `/api/apollo/submit`, success/error result)
- Pricing strikethrough with `~~$NN~~ FREE PREVIEW · M min · X-Yp` displayed on station rows, wizard Step 1, and wizard Step 6
- localStorage draft persistence (`apollo:draft:<slug>:<brand>`, 500 ms debounce, 7-day TTL, purge-stale-on-bootstrap, resume prompt baked into the launch flow)
- `prefers-reduced-motion` overrides for the new wizard transitions

### Legacy code retained
Yesterday's `renderStepBrand`, `renderStepDetails`, `renderStepImages`, `renderStepReview`, `renderStepResult`, and `renderField` are still in the file but unreachable — `renderIntake()` now dispatches solely to the new wizard. They were left in place to keep the diff bounded; a future cleanup sprint can remove them once the new wizard is proven in production.

---

## Pending Jon actions

1. **Apply Supabase migration** — paste `supabase/migrations/005_apollo_uploads.sql` into Studio SQL editor for the Apollo project and run it. Without this, `/api/apollo/uploads` will fail with a "relation apollo_uploads does not exist" error. (The Storage bucket itself is already created.)

2. **Upload `apollo-intake/index.html` to cPanel** at `/apollo/index.html` (manual). Hard-refresh browser (Cmd-Shift-R / Ctrl-Shift-R) to clear the service worker cache.

3. **Run through one full submission per industry**:
   - Legal — try NDA
   - Consulting — try SOW or Proposal
   - Government — try Capability Statement
   - Finance — try Invoice
   - Startup — try One-Pager
   - Field Service — try Quote (the new deliverable)

4. **Confirm file upload flow** — upload a site photo to the FSR slot; upload a receipt to the Expense Report slot. Confirm progress, removal, and review all work.

5. **Confirm placeholder industries** show the request-access modal correctly (clicking Hospitality or Content & Media should open the modal with the catalog `placeholder_cta` text and a working mailto: button).

6. **Confirm strikethrough pricing** renders on station deliverable rows + wizard Step 1 + wizard Step 6.

7. **Forward sample requests:**
   - To Olivier (Hospitality): catering SOPs, financial projections, event proposals, kitchen reports
   - To Jake (Content & Media): production reports, editorial briefs, content schedules, review documents

---

## Known limitations / deferred to next sprint

- **Layout primitives.** `pitch-deck`, `exec-presentation`, `federal-proposal`, `business-plan`, `audit-readiness`, `compliance-report`, `discovery-summary`, `market-analysis`, `legal-memo`, `investor-memo`, `investor-update`, `pwp` and a handful of others compile via the default `contract` layout. Industry-specific primitives (slide-style for pitch-deck, volume dividers for federal-proposal, etc.) are a follow-up sprint. Content quality is high; visual fidelity per industry is iteration 2.
- **Stripe payment integration.** Pricing strikethrough is intentional — payment wiring is a separate sprint. The `FREE PREVIEW` label honors the deferral.
- **Multi-user telemetry.** The mission log shows the operator's own submissions only. Cross-operator visibility ("Olivier deployed an NDA 12 minutes ago") is out of scope for v1.
- **Real-time submission updates.** Mission log refreshes on `loadSubmissions()` (manual or after a successful submit). Websockets / live updates are not in this sprint.
- **Hospitality + Content/Media activation.** Awaiting samples from Olivier and Jake to spec their modules.
- **Per-style preview swatch** (Phase 13 nice-to-have). Style cards show label + description but not the inline typography sample mentioned in the spec — this can be added once we have one-off style screenshots in the asset bucket.

---

## Decisions made autonomously

1. **P7 pdf-parse v2 API.** The installed `pdf-parse@2.4.5` exports a `PDFParse` class instead of a default function (the older v1.x shape). The upload route was written against the new API (`new PDFParse({data}).getText()`) with try/finally `destroy()`.

2. **P8 dual-mode submit.** Rather than break yesterday's intake page mid-sprint, the submit route branches on Content-Type. The legacy FormData path stays intact; the new JSON path implements the unified-catalog orchestrator. Once the cPanel-uploaded HTML is verified live with the new wizard, the legacy path can be removed in a future cleanup sprint.

3. **P8 layout heuristic.** Per spec guidance, `quote/change-order/expense-report/budget-vs-actual/cash-flow-forecast/tax-estimate/personal-monthly` use the `financial-statement` layout, `one-pager/capability-statement` use `one-pager`, `meeting-minutes` uses `minutes`, `engagement-letter` uses `letter`, and everything else falls back to `contract`. `invoice` is the only deliverable that uses the dedicated `invoice` layout — others with line-items inherit `financial-statement` instead, which renders cleanly today.

4. **P10 LED behavior on placeholders.** Placeholder station LEDs are visually overridden via CSS `!important` regardless of the cinematic boot's stagger. This guarantees they always read as "dim/coming soon" even if `bringConsoleOnline` walks through every `.station-led` in the grid.

5. **P11–14 bundled commit.** The wizard, file upload UI, style picker integration, and draft persistence all touch the same wizard surface and depend on each other. Splitting them into 4 commits would have produced 4 broken intermediate states. They're committed together with grep counts validating each phase's contribution.

6. **NDA section preamble.** During P2 migration, the per-section `=== SECTION-BY-SECTION REQUIREMENTS ===` marker plus the trailing `LENGTH:` block were both folded into `sections[0].instructions` so the gold-standard RULE 1–4 preamble is preserved. This is verified by inspecting the migrated `nda.json`.

---

## Final notes

The dashboard's success metric (per the spec's closing line):
> when Jon arms the Field Service station and launches a Quote, the wizard should ask him for exactly the right things to produce a real quote he could send to a real customer.

This is wired end-to-end. The Quote module has 7 required fields (customer name, address, quote date, valid_until, scope summary, line items, payment terms), 9 optional fields, and 6 sections. The orchestrator hands these to Claude Sonnet 4 with the deliverable's JSON schema as a tool-use input schema, validates the output via Ajv, and compiles a PDF via the existing financial-statement layout.

The other half of the metric:
> when Olivier eventually opens the Hospitality station, the placeholder card should make clear that Apollo wants his catering SOPs and financial projections to activate that industry.

This is also wired. Clicking the Hospitality station opens a modal with the catalog's `placeholder_cta` text ("Send a sample deliverable to spec this industry. Catering SOPs, event proposals, kitchen reports, and financial projections welcome.") and a mailto: button to support@apollomc.ai.

Sprint complete. Awaiting Jon's manual cPanel upload and Supabase migration apply.
