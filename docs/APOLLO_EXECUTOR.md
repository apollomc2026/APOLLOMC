# APOLLO document execution

APOLLO executes its own approved Deliverable Specifications through Vercel Workflow. Supabase is the server-only job ledger. S3 retains an encrypted recovery copy, while a job may report `delivered` only after the draft PDF completes an exact-folder Google Drive round trip for the authenticated APOLLO user.

## Internal execution path

Mission approval compiles an immutable specification version into an idempotent work order and starts the workflow directly. Progress, checkpoints, failures, and artifact manifests are written to APOLLO's own ledger. No other product, database, identity, callback, or credential is required.

## Optional signed API

- `GET /api/v1/capabilities`
- `POST /api/v1/document-jobs`
- `GET /api/v1/document-jobs/{job_id}`
- `POST /api/v1/document-jobs/{job_id}/cancel`

Signed requests use:

- `X-Apollo-Timestamp`: current ISO-8601 timestamp
- `X-Apollo-Signature`: lowercase SHA-256 HMAC of `timestamp + "\\n" + method + "\\n" + pathname + "\\n" + rawBody`

The key is `APOLLO_EXECUTOR_SHARED_SECRET`, falling back to APOLLO's server-only `WORKER_SECRET_KEY`. Requests older than five minutes fail.

## Google Drive custody

Every user authorizes their own Google account with the narrow `drive.file` scope. APOLLO creates a dedicated custody folder visible in Settings and stores its identifier with the encrypted per-user refresh token. Work orders cannot select another user's credential or the former deployment-wide folder.

## Safety

- APOLLO has no dependency on THEMIS, METIS, HABI, AEGIS, or ATLAS infrastructure.
- Job and OAuth tables are service-role-only.
- APOLLO writes draft artifacts and cannot publish without human approval.
- Restricted work orders fail closed.
- Source URLs are HTTPS-only, short-lived, allowlisted, bounded, redirect-disabled, and SHA-256 verified.
- Unsupported deterministic financial verification fails closed.
