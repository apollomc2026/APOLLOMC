# APOLLO 3 internal release evidence

Authoritative product direction: `guiding light/Apollo guiding light.docx` in the APOLLO workspace.

## Product spine

1. A user begins with a natural-language outcome in Mission Control.
2. APOLLO separates stated facts, evidence-derived facts, and inference; recommends one specialist playbook; and asks one consequential question.
3. Every conversational or evidence change creates a durable specification version. Readiness is capped below approval until the selected document module has all required inputs.
4. Approval atomically locks the current specification. The compiler refuses missing fields instead of fabricating content.
5. The canonical executor retrieves hash-bound evidence, generates a schema-constrained document, applies deterministic checks, renders a PDF draft, records checkpoints, and writes final custody to Google Drive.
6. A delivered draft accepts natural-language revision instructions as a new idempotent job. The prior draft remains intact.

## Requirement evidence

| Guiding-light requirement | Implementation evidence | Automated gate |
|---|---|---|
| Natural-language first | `components/mission-control/MissionControl.tsx`, `/api/mission-control/interpret` | `tests/mission-control.spec.ts` |
| Voice intake seam | Browser speech recognition streams interim text into the same editable mission draft; low-confidence and critical values require visible review before submission | `tests/mission-control.spec.ts` |
| Versioned semantic control plane | `lib/mission-control/contracts.ts`, `repository.ts`, migration RPCs | Typecheck and RLS pgTAP suite |
| Fact provenance and evidence custody | `lib/mission-control/evidence.ts`, evidence API, SHA-256 source manifests | `tests/mission-evidence.test.ts` |
| Complete fact and execution lineage | Every fact carries normalized value, source reference, capture method, confidence, verification state, sensitivity, editor and timestamp; every work order traces the approved specification hash, playbook, model versions, checks and accepted unresolved items | `tests/mission-interpreter.test.ts`, `tests/specification-work-order.test.ts` |
| Specialist recommendation | deterministic router plus Claude Sonnet 5 interpretation | `tests/mission-interpreter.test.ts`, `tests/golden-missions.test.ts` |
| Truthful approval gate | `executionGaps`, atomic approval RPC, immutable content hash | `tests/specification-work-order.test.ts` |
| Canonical durable execution | `lib/executor/accept.ts`, `workflows/document-job.ts` | executor contract and financial verification tests |
| Enforced execution lifecycle | Application and Postgres guards reject skipped, backward and post-terminal document-job transitions while retaining retry-safe idempotent checkpoints | `tests/job-state-machine.test.ts` plus live trigger verification |
| Reconnectable Drive delivery | Per-user OAuth connection in Settings; refresh credentials encrypted with AES-256-GCM and readable only through the service role; revoked grants stop at a truthful `blocked` checkpoint | `tests/google-drive-auth.test.ts`, `tests/google-drive-custody.test.ts` |
| Content-first workmanship floor | Nine user-supplied field, commercial, QC, and contract-review PDFs were visually inspected across all 51 pages and distilled into `docs/engineering/apollo-deliverable-quality-bar.md`; generation performs a deterministic archetype audit and one fact-preserving repair before decoration | `tests/deliverable-quality.test.ts` plus rendered field-record QA fixture |
| Review by instruction | `/api/mission-control/revise`, revision panel in Mission Control | idempotent revision test |
| Aerospace-industrial interface | Mission Control component and global design system | desktop/mobile browser tests |
| Billing dormant | internal-only billing configuration | billing scaffold tests |
| Browser privacy | service worker caches only immutable public assets | `tests/pwa-privacy.test.ts` |
| Evidence Vault | authenticated current-model evidence ledger with extraction status, fact counts and expiring downloads | `tests/system-surfaces.spec.ts` |
| Brand custody | create or import a user-owned brand kit; uploaded guides are hash-bound in private storage | `tests/system-surfaces.spec.ts` |
| Light and dark UI | persisted theme selection across public and protected surfaces; navigation-specific contrast tokens | `tests/system-surfaces.spec.ts` |
| Operational navigation | Archive, Telemetry, and Settings read current mission/executor state; no release-facing placeholder pages | `tests/system-surfaces.spec.ts` |
| Advanced mission launch | `/new-mission` combines natural-language intent with optional audience, deadline, format, evidence, persisted aura calibration and executable custom brand kits | `tests/system-surfaces.spec.ts` |
| One authoritative intake | Retired taxonomy-first mission URLs and the legacy launch pad redirect to `/new-mission`; shell navigation links directly to the conversational intake | `tests/system-surfaces.spec.ts` |
| Stellar atmosphere | Theme-aware orange sunburst, drifting nebula and staggered star flicker; reduced-motion users receive a static background | `tests/system-surfaces.spec.ts` |
| Explicit unresolved-item consent | Mission Control disables approval while open decisions remain unless the operator explicitly accepts the exact current set; the database rejects stale, partial or additional acceptance lists and disables the legacy bypass signature | `tests/mission-control.spec.ts` plus RPC privilege verification |
| Product infrastructure separation | Legacy THEMIS/CMD rows are retained for controlled extraction, but all browser-role privileges are revoked inside APOLLO's Supabase project; no APOLLO runtime code references those tables | live catalog privilege verification |

## Verification snapshot — 2026-09-07

- Framework: Next.js 16.3.4 and React 19.2.8; the version-16 proxy convention is in use.
- TypeScript: passed (`npm run typecheck --workspace apps/portal`).
- Unit/contract suite: 63 passed across 17 files.
- Chromium journeys: 13 passed, including desktop/mobile mission intake, editable voice capture with critical-value review, explicit unresolved-item consent, advanced launch handoff, legacy-route convergence, Evidence Vault, brand custody, operational surfaces, both themes, atmospheric rendering, reduced motion and controlled review/revision.
- Production build: passed with all portal, executor and Workflow routes emitted.
- Dependency audit: 0 critical, 0 low, 2 moderate and 14 high. All 16 remaining advisories originate in `workflow@4.8.5` and its pinned `nanoid`/`undici` graph. npm's proposed forced remediation is a breaking downgrade to Workflow 2.0.6, so it is not an acceptable automatic release change. Track the upstream 4.x remediation before public release.
- Billing remains scaffold-only. `BILLING_MODE=internal` is a release invariant and no payment provider is activated.

## Hosted evidence

- GitHub branch `audit/conversational-intake-rebuild` is the tested release candidate.
- GitHub Actions run `34043939894` passed the production build, lint baseline, typecheck, 48-test unit/contract suite, Chromium installation, and the complete browser acceptance suite for commit `d3e38b4`.
- The Vercel preview for release-candidate commit `b6db13e` reached `READY`. Its homepage and login returned HTTP 200, and a protected dashboard request safely resolved to the explicit configuration boundary with HTTP 200 rather than a middleware/render failure. Deployment-scoped runtime logs contained no error or fatal entries after these probes.
- Preview deployment `dpl_35YHycDwzYTxhwLj4D6N6VofW4Qa` for commit `01b8906` reached `READY`. Its build log contains no Turborepo environment-declaration warnings after the application environment allowlist was added to `turbo.json`, and the obsolete Active CPU memory override was removed.
- The stable preview is fully configured for the APOLLO Supabase project and authenticated mission-control use. The prior hosted-configuration boundary is resolved.
- The APOLLO Supabase project `yarbyhyomuimetsppsrz` is now connected and healthy. The conversational mission-control and brand-kit migrations were applied on 2026-09-06. Live catalog verification proves RLS is enabled on all five new tables with the expected 15 ownership policies.
- A live rollback transaction exercised authenticated mission creation, specification approval, cross-user rejection and the server-only rate limiter without retaining test data.
- The approval migration hashes the exact approved JSON and does not append evidence facts a second time. `pgcrypto`, caller-privilege execution, Data API grants, least-privilege function grants, ownership RLS and foreign-key indexes are asserted in migration/pgTAP evidence.
- `20260906154531_harden_legacy_database_functions.sql` fixes mutable search paths and removes anonymous/authenticated access to privileged trigger and rate-limit functions. The live security advisor now reports no exposed-function findings; remaining no-policy notices are informational for deliberately server-only tables.
- Live internal mission `ad64eff1-3a37-5a8d-a8af-3c6dca5f6b97` proved the complete intake, 29-fact specification, zero-open-decision approval, durable generation, schema validation, and corrected serverless PDF rendering path on commit `fdf061f`. Execution then reached the external Drive boundary and Google returned `invalid_grant` for the legacy refresh credential.
- Commit `c94d022` adds user-scoped Drive reconnection from Settings and the private `apollo_google_drive_connections` table. Tokens are encrypted at rest and are never returned to the browser.
- Live database verification on 2026-09-07 found zero persisted Drive connections. Final hosted delivery and revision verification therefore remain open until an APOLLO user completes Settings → Connect Google Drive on the stable preview. No connection from THEMIS or another product may be substituted.
- Commits `9bebae6`, `6ec59b9`, `1e3dd70` and `15a8e39` add complete semantic provenance, a guarded execution lifecycle, non-destructive isolation of 14 legacy non-APOLLO tables, and exact unresolved-item consent. The matching migrations are applied to APOLLO Supabase.
- Vercel deployment `dpl_5mM2roQXazHmuEk6WNLGF8F993UT` reached `READY` for exact commit `15a8e390e958cd6682c2603a86fb82afebd5b9ea`; the stable branch alias reported that same service version and a 30-minute runtime scan returned no errors.

## Release commands

From the repository root:

```text
npm run typecheck --workspace apps/portal
npm test --workspace apps/portal -- --run
npm run build --workspace apps/portal
cd apps/portal && npx playwright test --project=chromium
npm run release:check --workspace apps/portal
```

The first four gates can run locally. The environment check must run inside the hosted service so it can validate presence without copying or printing secret values.

## Hosted activation

Keep `BILLING_MODE=internal`. In the existing Google OAuth client's authorized redirect URIs, register:

```text
https://portal-git-audit-conversational-i-1da0d5-support-3556s-projects.vercel.app/api/integrations/google-drive/callback
```

Then use Settings → Connect Google Drive once and execute the existing internal golden mission through Drive custody and revision before promotion. Never substitute another Supabase project.
