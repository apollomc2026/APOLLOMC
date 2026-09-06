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
| Versioned semantic control plane | `lib/mission-control/contracts.ts`, `repository.ts`, migration RPCs | Typecheck and RLS pgTAP suite |
| Fact provenance and evidence custody | `lib/mission-control/evidence.ts`, evidence API, SHA-256 source manifests | `tests/mission-evidence.test.ts` |
| Specialist recommendation | deterministic router plus Claude Sonnet 5 interpretation | `tests/mission-interpreter.test.ts`, `tests/golden-missions.test.ts` |
| Truthful approval gate | `executionGaps`, atomic approval RPC, immutable content hash | `tests/specification-work-order.test.ts` |
| Canonical durable execution | `lib/executor/accept.ts`, `workflows/document-job.ts` | executor contract and financial verification tests |
| Review by instruction | `/api/mission-control/revise`, revision panel in Mission Control | idempotent revision test |
| Aerospace-industrial interface | Mission Control component and global design system | desktop/mobile browser tests |
| Billing dormant | internal-only billing configuration | billing scaffold tests |
| Browser privacy | service worker caches only immutable public assets | `tests/pwa-privacy.test.ts` |
| Evidence Vault | authenticated current-model evidence ledger with extraction status, fact counts and expiring downloads | `tests/system-surfaces.spec.ts` |
| Brand custody | create or import a user-owned brand kit; uploaded guides are hash-bound in private storage | `tests/system-surfaces.spec.ts` |
| Light and dark UI | persisted theme selection across public and protected surfaces; navigation-specific contrast tokens | `tests/system-surfaces.spec.ts` |
| Operational navigation | Archive, Telemetry, and Settings read current mission/executor state; no release-facing placeholder pages | `tests/system-surfaces.spec.ts` |
| Advanced mission launch | `/new-mission` combines natural-language intent with optional audience, deadline, format, evidence, persisted aura calibration and executable custom brand kits | `tests/system-surfaces.spec.ts` |
| Stellar atmosphere | Theme-aware orange sunburst, drifting nebula and staggered star flicker; reduced-motion users receive a static background | `tests/system-surfaces.spec.ts` |

## Verification snapshot — 2026-09-06

- Framework: Next.js 16.3.4 and React 19.2.8; the version-16 proxy convention is in use.
- TypeScript: passed (`npm run typecheck --workspace apps/portal`).
- Unit/contract suite: 45 passed across 12 files.
- Chromium journeys: 8 passed, including desktop/mobile mission intake, advanced launch handoff, Evidence Vault, brand custody, operational surfaces, both themes, atmospheric rendering, and reduced motion.
- Production build: passed with all portal, executor and Workflow routes emitted.
- Dependency audit: 0 critical, 0 low, 2 moderate and 14 high. All 16 remaining advisories originate in `workflow@4.8.5` and its pinned `nanoid`/`undici` graph. npm's proposed forced remediation is a breaking downgrade to Workflow 2.0.6, so it is not an acceptable automatic release change. Track the upstream 4.x remediation before public release.
- Billing remains scaffold-only. `BILLING_MODE=internal` is a release invariant and no payment provider is activated.

## Hosted evidence

- GitHub branch `audit/conversational-intake-rebuild` is the tested release candidate.
- The Vercel preview for release-candidate commit `b6db13e` reached `READY`. Its homepage and login returned HTTP 200, and a protected dashboard request safely resolved to the explicit configuration boundary with HTTP 200 rather than a middleware/render failure. Deployment-scoped runtime logs contained no error or fatal entries after these probes.
- Preview currently lacks the public Supabase configuration and therefore cannot authenticate. The login surface reports this state without exposing values or throwing a server error.
- The APOLLO Supabase project `yarbyhyomuimetsppsrz` is now connected and healthy. The conversational mission-control and brand-kit migrations were applied on 2026-09-06. Live catalog verification proves RLS is enabled on all five new tables with the expected 15 ownership policies.
- A live rollback transaction exercised authenticated mission creation, specification approval, cross-user rejection and the server-only rate limiter without retaining test data.
- The approval migration hashes the exact approved JSON and does not append evidence facts a second time. `pgcrypto`, caller-privilege execution, Data API grants, least-privilege function grants, ownership RLS and foreign-key indexes are asserted in migration/pgTAP evidence.
- `20260906154531_harden_legacy_database_functions.sql` fixes mutable search paths and removes anonymous/authenticated access to privileged trigger and rate-limit functions. The live security advisor now reports no exposed-function findings; remaining no-policy notices are informational for deliberately server-only tables.

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

Configure the release-candidate deployment for APOLLO project `yarbyhyomuimetsppsrz` with `BILLING_MODE=internal`, run the hosted environment check, and execute one real internal golden mission through Google Drive custody before promoting the branch. Never substitute another Supabase project.
