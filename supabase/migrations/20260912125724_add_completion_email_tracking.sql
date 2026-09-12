alter table public.apollo_document_jobs
  add column if not exists completion_email_status text not null default 'pending',
  add column if not exists completion_email_sent_at timestamptz,
  add column if not exists completion_email_error text;

alter table public.apollo_document_jobs
  drop constraint if exists apollo_document_jobs_completion_email_status_check;

alter table public.apollo_document_jobs
  add constraint apollo_document_jobs_completion_email_status_check
  check (completion_email_status in ('pending', 'sending', 'sent', 'failed'));

comment on column public.apollo_document_jobs.completion_email_status is
  'Idempotent delivery-notification state. Notification failure never changes document delivery state.';
