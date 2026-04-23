# Apollo — Backend Reference

Canonical file inventory and request lifecycle for the Apollo MVP. A new engineer (or Claude instance) should be able to read this in 10 minutes and understand the whole system.

---

## 1. One-paragraph overview

Apollo is a single-user document generator. The UI is a static HTML file (`apollo-intake/index.html`) hosted on cPanel at `apollomc.ai/apollo/`. It talks to a small set of Next.js serverless routes deployed to Vercel at `portal.apollomc.ai/api/apollo/*`. The routes are protected by a single shared API key (`X-Apollo-Key`). A submission = one template JSON + one brand folder + a dynamic questionnaire's worth of user inputs + optional images. The server loads the template, reads the selected brand's `brand.md`, calls the Anthropic API (Claude Sonnet 4) to render HTML with brand voice and colors, wraps it in a DOCX with `html-to-docx`, uploads the DOCX to a shared Google Drive folder via a service account, and returns a Drive link. Every submission is logged to a single Supabase table (`apollo_submissions`).

---

## 2. Architecture diagram

```
  ┌──────────────────────────┐
  │ apollomc.ai/apollo/      │   static HTML on cPanel
  │ apollo-intake/index.html │◄──── user's browser
  └────────────┬─────────────┘
               │ fetch() with X-Apollo-Key
               ▼
  ┌──────────────────────────────────────┐
  │ portal.apollomc.ai  (Vercel)         │
  │                                      │
  │   app/api/apollo/templates           │
  │   app/api/apollo/brands              │
  │   app/api/apollo/brands/[slug]/logo  │
  │   app/api/apollo/submit   (POST)     │
  │                                      │
  │   lib/apollo/{cors,templates,brands, │
  │               generate,docx,drive}   │
  └───┬──────────┬────────────┬──────────┘
      │          │            │
      ▼          ▼            ▼
  ┌────────┐ ┌──────────┐ ┌─────────────┐
  │ Claude │ │ Supabase │ │ Google Drive│
  │  API   │ │ Postgres │ │  (service   │
  │        │ │ (audit)  │ │   account)  │
  └────────┘ └──────────┘ └─────────────┘
```

- HTML file is self-contained — no framework, no build step.
- Every HTTP hop from the HTML to Vercel is CORS-checked (`apollomc.ai` in prod; `localhost:3000/8080` in dev).
- The Supabase table is write-only from the API using the service role key. RLS is enabled with no permissive policies — anon and authenticated roles get no access.

---

## 3. Repository file inventory

### `apollo-intake/`  — Standalone intake UI (cPanel-hosted)

```
apollo-intake/index.html
  Purpose: Self-contained 6-step intake wizard (API key gate → template → brand → fields → images → review → result).
  Talks to: GET /api/apollo/templates, GET /api/apollo/brands, GET /api/apollo/brands/[slug]/logo, POST /api/apollo/submit.
  External deps: Google Fonts (Syne / Inter / JetBrains Mono) at runtime. No JS deps.
  Deploy: upload to cPanel at apollomc.ai/apollo/index.html. Upload Apollo logo separately as apollomc.ai/apollo/logo.png.
```

### `apps/portal/app/api/apollo/`  — Serverless API routes

```
app/api/apollo/templates/route.ts
  Purpose: GET — list available templates (slug, label, description, category, supports_images).
  Exports: GET, OPTIONS.
  Calls: lib/apollo/templates.ts → listTemplates.
  Auth: X-Apollo-Key via requireApiKey.

app/api/apollo/brands/route.ts
  Purpose: GET — list brands from brand-assets/ (5 real + synthetic "other").
  Exports: GET, OPTIONS.
  Calls: lib/apollo/brands.ts → listBrands.
  Auth: X-Apollo-Key via requireApiKey.

app/api/apollo/brands/[slug]/logo/route.ts
  Purpose: GET — serve primary brand logo bytes (image/png) from brand-assets/<slug>/.
  Exports: GET, OPTIONS.
  Calls: lib/apollo/brands.ts → readBrandLogoBytes.
  Auth: X-Apollo-Key via requireApiKey.
  Cache: private, max-age=300.

app/api/apollo/submit/route.ts
  Purpose: POST — multipart (template_slug, brand_slug, inputs JSON, images[]). Full orchestrator.
  Exports: POST, OPTIONS.
  Calls: lib/apollo/templates.ts (loadTemplate, validateInputs), lib/apollo/brands.ts (loadBrand, isAllowedBrandSlug), lib/apollo/generate.ts, lib/apollo/docx.ts, lib/apollo/drive.ts, lib/supabase/server.ts (createServiceClient).
  Auth: X-Apollo-Key via requireApiKey.
  maxDuration: 300s.
```

### `apps/portal/lib/apollo/`  — Backend library modules

```
lib/apollo/cors.ts
  Purpose: CORS preflight + API key gate. Single source of truth for both concerns.
  Exports: corsHeaders, preflight, requireApiKey, resolveAllowedOrigin.
  Called by: every route under app/api/apollo/.

lib/apollo/templates.ts
  Purpose: Template JSON loader + input validator.
  Exports: listTemplates, loadTemplate(slug), validateInputs(template, inputs), Template, TemplateField, TemplateSection, FieldType, SectionType.
  Called by: api/apollo/templates/route.ts, api/apollo/submit/route.ts, api/apollo/.../page.tsx isn't used (no Next UI).
  Reads from: apps/portal/lib/apollo/templates/*.json.

lib/apollo/brands.ts
  Purpose: Brand folder scanner + brand.md reader + primary-logo resolver.
  Exports: listBrands, loadBrand(slug), isAllowedBrandSlug(slug), readBrandLogoBytes(slug), BrandInfo, LoadedBrand.
  Called by: api/apollo/brands/route.ts, api/apollo/brands/[slug]/logo/route.ts, api/apollo/submit/route.ts.
  Reads from: brand-assets/<slug>/{brand.md, <primary logo>.png}.
  Hard-coded PRIMARY_LOGO_CANDIDATES map picks the first existing file per brand.

lib/apollo/generate.ts
  Purpose: Build the Claude prompt from template + brand.md + inputs + images, call Anthropic, return HTML.
  Exports: generateDocumentHtml(args), ImageInput, GenerateArgs.
  Model: claude-sonnet-4-20250514, max_tokens 8192, streaming off.
  Called by: api/apollo/submit/route.ts.

lib/apollo/docx.ts
  Purpose: HTML → DOCX via html-to-docx. Prepends a header (logo + title) and appends an "Attachments" figure list for uploaded images.
  Exports: buildDocx(args), BuildDocxArgs.
  Called by: api/apollo/submit/route.ts.

lib/apollo/drive.ts
  Purpose: Google Drive service-account upload. Creates a per-submission subfolder, uploads the DOCX + submission.json audit file.
  Exports: uploadToDrive(args), DriveUploadArgs, DriveUploadResult.
  Called by: api/apollo/submit/route.ts.
  Env: GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON, GOOGLE_DRIVE_PARENT_FOLDER_ID.
```

### `apps/portal/lib/apollo/templates/`  — Template catalog (10 JSON files)

Each JSON is brand-agnostic: it describes sections and required fields only.

```
change-order.json       — Change order (8 fields, 7 sections)
engagement-letter.json  — Client engagement letter (8 fields, 7 sections)
fsr.json                — Field service report (11 fields, 8 sections, supports_images=true)
incident-report.json    — Incident report (11 fields, 10 sections, supports_images=true)
invoice.json            — Invoice (10 fields, 6 sections, hybrid tables)
meeting-minutes.json    — Meeting minutes / decision log (10 fields, 7 sections)
nda.json                — Non-disclosure agreement (7 fields, 7 sections)
one-pager.json          — Executive one-pager (7 fields, 5 sections)
proposal.json           — Consulting/services proposal (10 fields, 10 sections)
sow.json                — Scope of work (9 fields, 9 sections)
```

To add a new template: drop a new `<slug>.json` in this folder. No code change needed.

### `brand-assets/`  — Brand identity per sub-brand

```
brand-assets/apollo/
  brand.md + 6 logo PNGs (master, transparent, apollomc lockup, rocket, rocket-transparent, UDI variant)
brand-assets/atlas/
  brand.md + 18 PNGs (hi-res wordmark, statue marks, PWA icons in 16/32/192/512 + maskable, plus dallas + enterprise tenant variants)
brand-assets/on-spot-solutions/
  brand.md + OnSpot_FULL_nearTouch.png + OSAL.gif + 2 favicons (16/32)
brand-assets/habi/
  brand.md (placeholder)
brand-assets/themis/
  brand.md (placeholder)
```

### `supabase/migrations/`  — Schema migrations

```
supabase/migrations/001_baseline.sql         Pre-Apollo-MVP baseline (industries, deliverable_types, missions, tasks, ...). Not used by Apollo MVP; pre-existing.
supabase/migrations/002_apollo_submissions.sql  Creates apollo_submissions table + index + RLS.
```

### `apps/portal/lib/supabase/`  — Supabase clients (pre-existing, reused)

```
lib/supabase/client.ts       Browser client (unused by Apollo — MVP is API-key only).
lib/supabase/server.ts       Server client + createServiceClient. Apollo uses createServiceClient.
lib/supabase/middleware.ts   Session refresher for legacy portal routes. Not involved in the Apollo path.
```

### Environment config — `apps/portal/.env.local`

See §6.

### Pre-existing portal code — ignored by Apollo

`apps/portal/app/(auth|protected|public)/*` is the legacy portal cascade (`/dashboard`, `/new-mission/*`, `/mission/*`, etc.). Apollo does not touch it. The legacy `/api/missions`, `/api/intake`, `/api/stripe`, etc. routes are also untouched.

---

## 4. Data model — `apollo_submissions`

| Column            | Type        | Notes                                            |
|-------------------|-------------|--------------------------------------------------|
| `id`              | UUID        | PK, default `gen_random_uuid()`                  |
| `template_slug`   | TEXT        | NOT NULL — matches file in `lib/apollo/templates/` |
| `brand_slug`      | TEXT        | NOT NULL — `apollo`, `atlas`, `on-spot-solutions`, `habi`, `themis`, or `other` |
| `inputs`          | JSONB       | NOT NULL — field id → value map                  |
| `image_count`     | INT         | default 0                                        |
| `status`          | TEXT        | NOT NULL default `processing`; one of `processing | generating | delivered | failed` |
| `drive_folder_id` | TEXT        | nullable — set on successful upload              |
| `drive_file_id`   | TEXT        | nullable — set on successful upload              |
| `drive_file_url`  | TEXT        | nullable — set on successful upload              |
| `error_message`   | TEXT        | nullable — first 2000 chars on failure           |
| `created_at`      | TIMESTAMPTZ | default `NOW()`                                  |
| `completed_at`    | TIMESTAMPTZ | nullable — set on terminal status                |

**Index:** `idx_apollo_submissions_created` on `(created_at DESC)`.
**RLS:** enabled, no permissive policies (default deny). Server uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

---

## 5. Request lifecycle

The exact chain on a happy-path submission, in order:

1. User enters API key in `apollo-intake/index.html`. It is stored in `localStorage.apolloApiKey`.
2. The HTML fetches `GET /api/apollo/templates` and `GET /api/apollo/brands`. Both include `X-Apollo-Key`.
3. User clicks a template card → `state.templateSlug` set. User clicks a brand card → `state.brandSlug` set. User fills fields. User optionally adds images. User clicks **Generate Document**.
4. Browser `POST /api/apollo/submit` with FormData: `template_slug`, `brand_slug`, `inputs` (JSON string), `images[]`.
5. `submit/route.ts` calls `requireApiKey(request)` (`cors.ts`). 401 if missing/wrong.
6. `request.formData()` parsed.
7. `loadTemplate(templateSlug)` reads `lib/apollo/templates/<slug>.json`. Returns 400 if unknown.
8. `JSON.parse(inputsRaw)` + `validateInputs(template, inputs)` → 400 `missing: [...]` if any required field is empty.
9. `loadBrand(brandSlug)` reads `brand-assets/<slug>/brand.md` (or returns `{brand_md: "UNBRANDED"}` for `other`) and resolves the primary logo bytes.
10. Image files validated: max 10, max 5MB each, MIME in `{image/jpeg, image/png, image/webp}`. Converted to `Buffer` + base64.
11. `createServiceClient()` → INSERT into `apollo_submissions` with `status='generating'`, returning `id`.
12. `generateDocumentHtml({template, brand, inputs, images})` calls Claude Sonnet 4 with a system prompt (fixed) + a user prompt assembling the template JSON, brand.md text, formatted inputs, and image blocks. Returns HTML (code fences stripped).
13. `buildDocx({contentHtml, title, brandLabel, brandLogo, images, templateLabel})` wraps the content with a logo/title header + attachments block and converts to a DOCX `Buffer`.
14. `uploadToDrive({subfolderName, docxBuffer, docxFilename, submissionJson})` creates a subfolder `<slug>_<yyyy-mm-dd>_<short-id>` under `GOOGLE_DRIVE_PARENT_FOLDER_ID`, uploads the DOCX, uploads `submission.json` (audit record).
15. UPDATE `apollo_submissions` with `status='delivered'`, `drive_folder_id`, `drive_file_id`, `drive_file_url`, `completed_at`.
16. Return `{success: true, submission_id, drive_url}` with CORS headers.
17. HTML shows the Drive link.

Failure anywhere after step 11 runs `fail(message)`: UPDATE the same row with `status='failed'`, `error_message`, `completed_at`. The HTTP response is 500 with the error text so the UI can surface it.

---

## 6. Environment variables

Everything referenced by `process.env.*` in the Apollo code, with where it is used.

| Var                              | Used by                     | Example format                                             |
|----------------------------------|-----------------------------|------------------------------------------------------------|
| `APOLLO_API_KEY`                 | `lib/apollo/cors.ts`        | 48+ char random string (base64url). Shared with cPanel HTML users via the browser-side prompt. |
| `ANTHROPIC_API_KEY`              | `lib/apollo/generate.ts`    | `sk-ant-...`                                               |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON` | `lib/apollo/drive.ts`    | Full JSON from Google Cloud service account, single line   |
| `GOOGLE_DRIVE_PARENT_FOLDER_ID`  | `lib/apollo/drive.ts`       | Drive folder ID (letters/digits/dashes, no URL). MVP uses `1kBFTL9eh326eLTbvN0sYlQrq4rMwlwxu`. |
| `NEXT_PUBLIC_SUPABASE_URL`       | `lib/supabase/server.ts`    | `https://<ref>.supabase.co`                                |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`  | `lib/supabase/server.ts`    | JWT anon key                                               |
| `SUPABASE_SERVICE_ROLE_KEY`      | `lib/supabase/server.ts`    | JWT service role key — keep secret                         |
| `NODE_ENV`                       | `lib/apollo/cors.ts`        | `development` / `production` — Vercel sets this            |

Mirror all of the above (except `NODE_ENV`) into the Vercel project env for production.

---

## 7. How to deploy

- **API changes:** commit to `main`. Vercel auto-deploys in ~60s. Verify with `curl -H "X-Apollo-Key: ..." https://portal.apollomc.ai/api/apollo/templates`.
- **HTML changes:** edit `apollo-intake/index.html`, commit, then re-upload the file (plus `logo.png` if changed) to cPanel under `/apollo/`. The HTML is not built by Vercel.
- **Brand asset changes:** commit changes under `brand-assets/<slug>/`. Vercel picks them up on the next deploy — the brand-logo route reads from disk on every request.
- **Schema changes:** add a new numbered migration under `supabase/migrations/`. Apply via Supabase SQL editor or `supabase db push`. The Apollo app runs against the already-applied schema; it does not apply migrations at startup.

---

## 8. How to add a new template

1. Create `apps/portal/lib/apollo/templates/<slug>.json` matching the existing shape (`slug`, `label`, `description`, `category`, `supports_images`, `fields[]`, `sections[]`, `generation_notes`).
2. `fields[]`: each `{id, label, type, required?, placeholder?, help?, default?, options?}`. Field types: `text`, `textarea`, `date`, `number`, `select`, `multi_select`. Select fields require `options: [...]`.
3. `sections[]`: each `{id, label, type}`. Section types: `fixed`, `prose`, `hybrid`.
4. If `supports_images: true`, include a `photos` (or similar) section and mention photo/figure references in `generation_notes` so Claude knows to cite them.
5. No code change needed — `listTemplates()` reads the directory at request time.
6. Commit + push.

---

## 9. How to add a new brand

1. Create `brand-assets/<slug>/` folder.
2. Add `brand.md` (follow Apollo / Atlas / On Spot structure — voice, colors, typography, logo inventory).
3. Add logo files.
4. Update `PRIMARY_LOGO_CANDIDATES` and `BRAND_LABELS` in `apps/portal/lib/apollo/brands.ts` to include the new slug and its primary-logo filename.
5. Commit + push. Vercel redeploys; the brands endpoint will now return the new brand.

---

## 10. Troubleshooting

| Symptom                                                          | Likely cause / next step |
|------------------------------------------------------------------|--------------------------|
| `{error: "Unauthorized"}` from any Apollo route                   | `X-Apollo-Key` header missing or mismatch. Check Vercel project env for `APOLLO_API_KEY`. |
| Browser shows CORS error on `fetch`                              | Origin mismatch. Production only allows `https://apollomc.ai`. Edit `lib/apollo/cors.ts` if you need another origin. |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT_JSON is not valid JSON`            | The env var contains escaped quotes or line breaks. Paste as a single-line JSON string. |
| Drive `404: File not found` when uploading                        | The service account is not shared on the parent folder, or `GOOGLE_DRIVE_PARENT_FOLDER_ID` is wrong. |
| Claude returns malformed HTML / template structure deviates       | Inspect the prompt in `lib/apollo/generate.ts`. Consider tightening `generation_notes` in the offending template. |
| Template card missing from Step 1                                 | The JSON didn't parse. Run `node -e "JSON.parse(require('fs').readFileSync('apps/portal/lib/apollo/templates/<slug>.json'))"` to locate the error. |
| Generated DOCX has no logo                                        | `resolvePrimaryLogo` could not find any candidate file on disk. Verify `PRIMARY_LOGO_CANDIDATES[<slug>]` lists a filename that exists in `brand-assets/<slug>/`. |
| Apollo routes return 500 "failed to create submission"            | Supabase service key is invalid, the `apollo_submissions` table does not exist, or RLS is blocking the service role (shouldn't — service role bypasses RLS). Check Supabase dashboard logs. |
| Brand logos 404 in the Brand step                                 | `readBrandLogoBytes` returns null. Either the brand is `habi` / `themis` (no logos — expected placeholder) or the logo filename in `PRIMARY_LOGO_CANDIDATES` doesn't exist on disk. |
