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
| `/api/delivery/preview?output=` | Authenticated legacy review clients | RLS-bound output lookup with five-minute signed preview URL | Preserve as a compatibility adapter; the retired raw-key contract is rejected and cross-user output IDs resolve as not found. |
| `/api/billing/checkout` | Future commercial UI | Provider-neutral checkout boundary | Dormant in internal mode; provider adapter requires a later acceptance gate. |
| `/api/stripe/checkout` | No active UI caller | Legacy compatibility adapter | GET is disabled; POST delegates to dormant billing boundary. Retire after caller proof. |
| `/api/stripe/webhook` | Future Stripe configuration | Historical payment state/delivery | Returns unavailable before provider initialization in internal mode. Implement idempotent ledger only when billing is activated. |
| `/api/apollo/keepalive` | Vercel cron `0 9 * * *` | Supabase keepalive | Revalidate need, secret and ownership; do not silently recreate on Hostinger. |
| `apollomc.ai` assets | No active portal caller | Former cross-host logo dependency | APOLLO logo is now portal-owned at `/apollo-logo.png`; retain legacy hosting only for external callers until cPanel retirement evidence is complete. |
| `/apollo/` | Public users/search/direct links | Legacy taxonomy-first intake | Compatibility surface during transition; redirect only after canonical entry proof. |
| `/devdepot/` | Unknown historical callers | Portal-control notice | Prove callers, then explicit redirect or removal. |
| Render Orbit endpoints | Historical Zapier tasks | Historical media proxy | Treat as unretired until dashboard and Zapier evidence closes. |

## Discovery controls

- Search source for every `fetch`, callback, webhook, cron, storage and provider invocation.
- Capture platform logs before deleting a route or service.
- Require a measured zero-caller observation window and a tested rollback for retirement.
- New application capabilities integrate through mission/specification/executor contracts; no fifth generation path is permitted.
