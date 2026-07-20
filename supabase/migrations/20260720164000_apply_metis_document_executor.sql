-- Re-declare the executor ledger after enabling the Supabase GitHub integration.
-- Every statement is idempotent so environments that already applied the
-- original migration remain unchanged.

create table if not exists public.apollo_document_jobs (
  id uuid primary key,
  idempotency_key text not null unique,
  protocol_version text not null check (protocol_version = '1.0'),
  project_id text not null,
  conversation_id uuid not null,
  task_id uuid not null,
  requested_by text not null,
  capability text not null,
  deliverable_type text not null,
  work_order jsonb not null,
  state text not null default 'accepted' check (state in (
    'accepted','queued','gathering-input','generating','validating','rendering',
    'reviewing','blocked','delivered','failed','cancelled'
  )),
  progress_percent integer not null default 0 check (progress_percent between 0 and 100),
  status_message text not null default 'Accepted',
  workflow_run_id text,
  retry_count integer not null default 0 check (retry_count >= 0),
  checkpoint_ref text,
  missing_inputs jsonb not null default '[]'::jsonb,
  artifacts jsonb not null default '[]'::jsonb,
  error_code text,
  error_message text,
  cancel_requested_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.apollo_document_job_events (
  id uuid primary key,
  job_id uuid not null references public.apollo_document_jobs(id) on delete cascade,
  sequence integer not null check (sequence >= 0),
  state text not null,
  progress_percent integer not null check (progress_percent between 0 and 100),
  message text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (job_id, sequence)
);

create index if not exists apollo_document_jobs_state_created_idx
  on public.apollo_document_jobs (state, created_at);
create index if not exists apollo_document_job_events_job_created_idx
  on public.apollo_document_job_events (job_id, created_at);

alter table public.apollo_document_jobs enable row level security;
alter table public.apollo_document_job_events enable row level security;

revoke all on table public.apollo_document_jobs from anon, authenticated;
revoke all on table public.apollo_document_job_events from anon, authenticated;

comment on table public.apollo_document_jobs is
  'Server-only durable ledger for METIS document work orders. Workflow execution is owned by APOLLO.';
comment on table public.apollo_document_job_events is
  'Ordered, append-only lifecycle events for APOLLO document jobs.';
