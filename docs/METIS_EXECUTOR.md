# APOLLO as the METIS document executor

APOLLO accepts signed METIS work orders, returns `202 Accepted` immediately, and executes document production through Vercel Workflow. Supabase is the server-only job ledger. S3 retains an internal recovery copy, while a job may report `delivered` only after the draft PDF completes an exact-folder Google Drive round trip. DOCX and XLSX remain disabled until their implementations pass the executor conformance suite.

## API

- `GET /api/v1/capabilities`
- `POST /api/v1/document-jobs`
- `GET /api/v1/document-jobs/{job_id}`
- `POST /api/v1/document-jobs/{job_id}/cancel`

All job requests use:

- `X-Metis-Timestamp`: current ISO-8601 timestamp
- `X-Metis-Signature`: lowercase SHA-256 HMAC of `timestamp + "\\n" + method + "\\n" + pathname + "\\n" + rawBody`

The shared secret is `METIS_EXECUTOR_SHARED_SECRET`. Requests older than five minutes fail. Callback and source origins are explicit allowlists.

Google Drive custody uses a server-side OAuth refresh token for the Drive owner:

- `GOOGLE_DRIVE_CLIENT_ID`
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN`

The authorized account must have write access to the work order's exact `drive_destination.folder_id`. Uploads carry private Drive `appProperties` for the METIS work order, content hash, and draft lifecycle. Repeated execution updates or reuses the same Drive file instead of creating duplicates.

## Current activation state

This release is staging-only. It truthfully advertises PDF support and a confidential sensitivity ceiling. APOLLO must not be enabled in METIS production until:

1. The migration is applied to the APOLLO Supabase project through its normal reviewed deployment path.
2. Workflow and callback secrets are configured in APOLLO and METIS staging.
3. METIS implements the signed executor-event receiver.
4. Disconnect, duplicate, cancellation, provider failure, S3 failure, callback retry, and artifact round-trip tests pass.
5. Google Drive draft delivery is configured and verified against the authorized destination.
6. DOCX/XLSX are implemented and separately advertised before METIS requests them.

The METIS staging callback receiver and expiring operational event store were provisioned on 2026-07-20. Staging activation still requires this APOLLO branch's schema deployment and the full unattended ATLAS acceptance run; this note does not authorize production activation.

## Safety

- No APOLLO worker receives METIS database credentials.
- Job tables use RLS and explicitly revoke `anon` and `authenticated` access.
- APOLLO writes only draft artifacts and cannot approve or publish.
- Restricted work orders fail closed.
- Source URLs must be HTTPS, short-lived, allowlisted, size-bounded, redirect-disabled, and SHA-256 verified.
- Financial gates are deterministic. Unsupported financial verification fails closed.
