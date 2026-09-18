create table if not exists public.apollo_pilot_canary_runs (
  id uuid primary key default gen_random_uuid(),
  deliverable_type text not null check (deliverable_type in (
    'fsr','final-qc-report','quote','proposal',
    'cash-flow-budget-package','contract-intelligence-review'
  )),
  deployment_id text not null,
  status text not null check (status in ('running','passed','failed')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  result jsonb not null default '{}'::jsonb check (jsonb_typeof(result) = 'object'),
  error_stage text,
  error_message text,
  created_at timestamptz not null default now()
);

create index if not exists apollo_pilot_canary_runs_class_time_idx
  on public.apollo_pilot_canary_runs (deliverable_type, started_at desc);

alter table public.apollo_pilot_canary_runs enable row level security;
revoke all on table public.apollo_pilot_canary_runs from public, anon, authenticated;
grant all on table public.apollo_pilot_canary_runs to service_role;

comment on table public.apollo_pilot_canary_runs is
  'Service-only immutable production pilot attestations. Never projected into user mission telemetry.';
