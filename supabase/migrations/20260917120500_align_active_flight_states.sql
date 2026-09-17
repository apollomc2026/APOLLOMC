-- Align the database race guard with the executor's canonical active states.
-- Also release historical executions that have reported no progress for more
-- than one hour so they cannot permanently block a safe retry.

with stale as (
  update public.apollo_document_jobs
  set state = 'failed',
      status_message = 'Mission execution stalled and was released for a safe retry',
      error_code = 'WORKFLOW_EXECUTION_STALE',
      error_message = 'The mission stopped reporting progress and exceeded the execution safety window.',
      completed_at = now(),
      updated_at = now()
  where state in ('queued','validating','generating','verifying','rendering','delivering')
    and updated_at < now() - interval '60 minutes'
  returning id, coalesce(progress_percent, 0) as progress_percent
)
insert into public.apollo_document_job_events
  (id, job_id, sequence, state, progress_percent, message, payload)
select gen_random_uuid(), stale.id,
       coalesce((select max(e.sequence) + 1 from public.apollo_document_job_events e where e.job_id = stale.id), 0),
       'failed', stale.progress_percent,
       'Mission execution stalled and was released for a safe retry',
       jsonb_build_object('error_code','WORKFLOW_EXECUTION_STALE','reconciled_by','20260917120500_align_active_flight_states')
from stale;

drop index if exists public.apollo_document_jobs_one_active_flight_idx;

create unique index apollo_document_jobs_one_active_flight_idx
  on public.apollo_document_jobs (requested_by, conversation_id)
  where state in ('accepted','queued','validating','generating','verifying','rendering','delivering');
