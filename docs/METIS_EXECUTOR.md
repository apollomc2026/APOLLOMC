# APOLLO as the METIS document executor

APOLLO accepts signed METIS work orders, returns `202 Accepted` immediately, and executes document production through Vercel Workflow. Supabase is the server-only job ledger; S3 is the current draft artifact store. Google Drive delivery, DOCX, and XLSX remain disabled until their implementations pass the executor conformance suite.

## API

- `GET /api/v1/capabilities`
- `POST /api/v1/document-jobs`
- `GET /api/v1/document-jobs/{job_id}`
- `POST /api/v1/document-jobs/{job_id}/cancel`

All job requests use:

- `X-Metis-Timestamp`: current ISO-8601 timestamp
- `X-Metis-Signature`: lowercase SHA-256 HMAC of `timestamp + "\\n" + method + "\\n" + pathname + "\\n" + rawBody`

The shared secret is `METIS_EXECUTOR_SHARED_SECRET`. Requests older than five minutes fail. Callback and source origins are explicit allowlists.

## Current activation state

This release is staging-only. It truthfully advertises PDF support and a confidential sensitivity ceiling. APOLLO must not be enabled in METIS production until:

1. The migration is applied to the APOLLO Supabase project through its normal reviewed deployment path.
2. Workflow and callback secrets are configured in APOLLO and METIS staging.
3. METIS implements the signed executor-event receiver.
4. Disconnect, duplicate, cancellation, provider failure, S3 failure, callback retry, and artifact round-trip tests pass.
5. Google Drive draft delivery is implemented and verified if Drive is required for activation.
6. DOCX/XLSX are implemented and separately advertised before METIS requests them.

## Safety

- No APOLLO worker receives METIS database credentials.
- Job tables use RLS and explicitly revoke `anon` and `authenticated` access.
- APOLLO writes only draft artifacts and cannot approve or publish.
- Restricted work orders fail closed.
- Source URLs must be HTTPS, short-lived, allowlisted, size-bounded, redirect-disabled, and SHA-256 verified.
- Financial gates are deterministic. Unsupported financial verification fails closed.
