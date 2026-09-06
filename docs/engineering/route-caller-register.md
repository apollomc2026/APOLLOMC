# Route and caller register

This is the Phase 1 control register. A route may be retired only when code, deployment, logs, DNS, scheduled jobs and external dashboards agree that it has no callers.

| Surface | Known caller or trigger | Current role | APOLLO 3.0 disposition |
|---|---|---|---|
| `/api/v1/document-jobs` | Signed machine clients using METIS executor secret | Durable executor entry | Preserve and evolve to consume approved specification IDs. |
| `/api/v1/document-jobs/{id}` and `/cancel` | Signed machine clients | Status/cancellation | Preserve. |
| Workflow callback URL | Durable workflow | State/artifact event delivery | Preserve with allowlisted HTTPS origins and signed callbacks. |
| `/api/jobs` | Portal job board/rebuild flow; worker secret | Older executor | Adapt into canonical executor, then retire with telemetry. |
| `/api/apollo/submit` | Legacy intake | Older synchronous generation | Time-bounded adapter only. |
| `/api/intake/module` | Taxonomy-first LaunchPad | Catalog module lookup; production 404 observed | Replace with resolver/playbook registry contract. |
| `/api/delivery/preview?key=` | Review UI | Raw storage-key preview | Replace in Phase 2 with artifact-ID authorization. |
| `/api/stripe/checkout` | File/review UI | Checkout and redownload | Convert mutating operation to POST with idempotency. |
| `/api/stripe/webhook` | Stripe | Payment state/delivery | Preserve after idempotent event ledger remediation. |
| `/api/apollo/keepalive` | Vercel cron `0 9 * * *` | Supabase keepalive | Revalidate need, secret and ownership; do not silently recreate on Hostinger. |
| `apollomc.ai` assets | Portal shell, auth and landing pages | Cross-host logos/rocket | Internalize into portal-owned versioned assets before cPanel retirement. |
| `/apollo/` | Public users/search/direct links | Legacy taxonomy-first intake | Compatibility surface during transition; redirect only after canonical entry proof. |
| `/devdepot/` | Unknown historical callers | Portal-control notice | Prove callers, then explicit redirect or removal. |
| Render Orbit endpoints | Historical Zapier tasks | Historical media proxy | Treat as unretired until dashboard and Zapier evidence closes. |

## Discovery controls

- Search source for every `fetch`, callback, webhook, cron, storage and provider invocation.
- Capture platform logs before deleting a route or service.
- Require a measured zero-caller observation window and a tested rollback for retirement.
- New application capabilities integrate through mission/specification/executor contracts; no fifth generation path is permitted.
