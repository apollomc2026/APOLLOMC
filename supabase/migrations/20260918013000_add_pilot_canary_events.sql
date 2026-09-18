create table if not exists public.apollo_pilot_canary_events (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.apollo_pilot_canary_runs(id) on delete cascade,
  sequence integer not null check (sequence > 0),
  stage text not null check (stage in (
    'accepted',
    'evidence-inventoried',
    'specification-approved',
    'generation-verified',
    'artifact-picked-up',
    'controlled-failure-rejected',
    'refight-picked-up',
    'passed',
    'failed'
  )),
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object'),
  created_at timestamptz not null default now(),
  unique (run_id, sequence)
);

create index if not exists apollo_pilot_canary_events_run_idx
  on public.apollo_pilot_canary_events (run_id, sequence);

alter table public.apollo_pilot_canary_events enable row level security;
revoke all on table public.apollo_pilot_canary_events from public, anon, authenticated;
grant all on table public.apollo_pilot_canary_events to service_role;
