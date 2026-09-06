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

Apply `supabase/migrations/20260906125055_apollo_mission_control.sql` only to APOLLO project `yarbyhyomuimetsppsrz`, then run `supabase/tests/apollo_mission_control_rls_test.sql`. Never substitute another project. Deploy the tested commit with `BILLING_MODE=internal`, run the hosted environment check, and execute one real internal golden mission through Google Drive custody before promoting the branch.
