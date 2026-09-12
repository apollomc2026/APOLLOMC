alter table public.apollo_document_jobs
  add column if not exists workmanship jsonb not null default '{}'::jsonb;

comment on column public.apollo_document_jobs.workmanship is
  'APOLLO schema and workmanship validation metrics captured during controlled document execution.';
