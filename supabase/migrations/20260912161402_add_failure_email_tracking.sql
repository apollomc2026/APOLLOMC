alter table public.apollo_document_jobs
  add column if not exists failure_email_status text not null default 'pending',
  add column if not exists failure_email_sent_at timestamptz,
  add column if not exists failure_email_error text;

alter table public.apollo_document_jobs
  drop constraint if exists apollo_document_jobs_failure_email_status_check;

alter table public.apollo_document_jobs
  add constraint apollo_document_jobs_failure_email_status_check
  check (failure_email_status in ('pending', 'sending', 'sent', 'failed'));

comment on column public.apollo_document_jobs.failure_email_status is
  'Idempotent mission-failure notification state. Notification failure never changes the document job state.';
