# APOLLO 3.0 Phase 1 baseline

Captured: 2026-09-06 America/New_York  
Authority: `guiding light/APOLLO 3.0 Authoritative Engineering Execution.docx`  
Branch: `audit/conversational-intake-rebuild`  
Baseline: `3d152a201061f775b1db0a1f1616207832f7cb68`

## Reproducibility result

| Control | Result | Release meaning |
|---|---|---|
| `npm ci` | Pass; 961 packages installed | Lockfile reproduces. |
| Forced TypeScript check | Pass | Current static contracts compile. |
| Forced Vitest suite | Pass; 4 files / 15 tests | Existing narrow executor, custody, financial and brand assertions reproduce. |
| Forced ESLint | Pass with 50 warnings | Warning debt is accepted only as baseline and must trend downward. |
| Forced production build | Pass; 17 static/dynamic page groups and API routes emitted | Repository produces a deployable Next.js bundle. |
| Dependency audit | 25 findings: 19 high, 6 moderate | Phase 2 blocker; no blind major-version fix. |
| Python processor tests | Not runnable: bundled Python lacks pytest | Environment gap; create a pinned isolated test environment before processor changes. |

## Authority reconciliation

The repository's historical `CLAUDE.md` remains lineage evidence. It contradicts verified live state and the current mandate in several material ways: taxonomy-first intake, a claimed empty Supabase project, future Hostinger language, SES as the locked sender and a different GitHub authority. Those statements do not control APOLLO 3.0.

The no-drift authority requires natural-language mission discovery, an immutable approved Deliverable Specification, one canonical executor, verified artifacts, provenance and governed custody.

## Phase 1 gate

### Passed

- Clean canonical Git baseline and matching origin/main.
- Dedicated rebuild branch created from the exact verified commit.
- Fresh dependency install, typecheck, unit test, lint and production build executed without cache reliance.
- Environment-variable names inventoried without exporting values.
- Route, caller and hosting migration manifests established.
- CI aligned to the Node 24 production runtime and now requires a production build.

### Open external evidence

- Fresh authenticated cPanel inventory or verified full account backup.
- Purchased/provisioned Hostinger target and temporary hostname.
- Supabase dashboard-only controls, Render dashboard/Zapier retirement proof and controlled Auth test identity.

These external items block destructive retirement and production cutover. They do not block additive contracts, tests or local security repairs.

## Rollback rule

All schema work is additive until verified; legacy routes remain callable adapters until telemetry proves zero callers; GoDaddy hosting stays frozen and recoverable through the Hostinger observation window. No credential value belongs in this repository or evidence ledger.
