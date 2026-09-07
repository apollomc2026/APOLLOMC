create or replace function public.apollo_enforce_document_job_transition()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.state = old.state then
    return new;
  end if;

  if not (case old.state
    when 'accepted' then new.state in ('queued', 'failed', 'cancelled')
    when 'queued' then new.state in ('gathering-input', 'failed', 'cancelled')
    when 'gathering-input' then new.state in ('generating', 'blocked', 'failed', 'cancelled')
    when 'generating' then new.state in ('validating', 'blocked', 'failed', 'cancelled')
    when 'validating' then new.state in ('rendering', 'blocked', 'failed', 'cancelled')
    when 'rendering' then new.state in ('reviewing', 'blocked', 'failed', 'cancelled')
    when 'reviewing' then new.state in ('delivered', 'failed', 'cancelled')
    when 'blocked' then new.state = 'cancelled'
    else false
  end) then
    raise exception 'invalid APOLLO document job transition: % -> %', old.state, new.state
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function public.apollo_enforce_document_job_transition() from public, anon, authenticated;

drop trigger if exists apollo_document_job_transition_guard on public.apollo_document_jobs;
create trigger apollo_document_job_transition_guard
before update of state on public.apollo_document_jobs
for each row execute function public.apollo_enforce_document_job_transition();

comment on function public.apollo_enforce_document_job_transition() is
  'Rejects out-of-order, backward, and post-terminal APOLLO document job state changes.';

comment on table public.apollo_document_jobs is
  'Server-only durable ledger for APOLLO document work orders. Workflow execution is owned by APOLLO.';
