alter table public.apollo_document_jobs
  add column if not exists financial_verification jsonb not null default '{}'::jsonb;

comment on column public.apollo_document_jobs.financial_verification is
  'Deterministic verification evidence recorded by the APOLLO document workflow.';
