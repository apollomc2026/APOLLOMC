# ADR 0003: Defer hybrid hosting and PWA work until mechanics acceptance

- Status: Accepted
- Date: 2026-09-12

## Decision

APOLLO will retain its current application architecture while the mission-to-artifact mechanics are completed and tested. Vercel remains the Next.js Mission Control host, Supabase remains the application data plane, and the existing evidence, workflow, delivery and notification services remain in place during this acceptance phase.

The following work is approved as a future architecture phase but is explicitly out of scope until the mechanics gate is passed:

- use WordPress only for the public marketing, publishing and product-education surface;
- retain the Next.js Mission Control application on Vercel;
- add installable PWA capabilities to the existing application;
- strengthen long-running document generation through a durable worker boundary;
- add secure offline drafting, queued upload, synchronization state and completion notifications;
- migrate the legacy public WordPress hosting from GoDaddy to Hostinger under the existing migration manifest.

WordPress will not become APOLLO's mission engine, tenant data store, evidence vault, authentication authority, workflow runtime or document-generation backend.

## Mechanics acceptance gate

The future phase may begin only after evidence shows that representative deliverable families complete the end-to-end journey reliably:

1. intake and evidence ingestion;
2. extraction and provenance preservation;
3. clarification or autonomous approval;
4. durable execution and safe retry;
5. deterministic validation;
6. correct brand application;
7. artifact delivery, telemetry and completion notification;
8. regression coverage for the accepted paths.

The gate also requires explicit owner approval. Passing isolated UI, generation or deployment checks does not open the gate.

## Consequences

- Current engineering stays focused on reliable mechanics and deliverable quality.
- PWA, WordPress integration and hosting migration cannot silently expand the active scope.
- The future architecture is preserved without forcing a rewrite: WordPress serves public content, Vercel serves Mission Control, Supabase serves application data, and durable workers serve heavy execution.
- GoDaddy or Hostinger capabilities may be evaluated for the public WordPress surface, but neither becomes the APOLLO application platform by default.
