-- A mission may have many immutable flights, but only one flight may execute
-- at a time. Close any historical duplicate-active condition before adding
-- the invariant so deployment cannot fail on legacy rows.
with ranked_active as (
  select id,
         row_number() over (
           partition by requested_by, conversation_id
           order by created_at desc, id desc
         ) as active_rank
  from public.apollo_document_jobs
  where state in ('accepted','queued','validating','generating','verifying','rendering','delivering')
)
update public.apollo_document_jobs as jobs
set state = 'failed',
    progress_percent = 0,
    status_message = 'Superseded duplicate active flight closed by execution safety migration',
    error_code = 'DUPLICATE_ACTIVE_FLIGHT',
    error_message = 'A newer flight for this mission is the controlling execution.',
    completed_at = coalesce(jobs.completed_at, now()),
    updated_at = now()
from ranked_active
where jobs.id = ranked_active.id
  and ranked_active.active_rank > 1;

create unique index if not exists apollo_document_jobs_one_active_flight_idx
  on public.apollo_document_jobs (requested_by, conversation_id)
  where state in ('accepted','queued','validating','generating','verifying','rendering','delivering');

comment on index public.apollo_document_jobs_one_active_flight_idx is
  'Prevents concurrent launches, retries, and reflights from executing the same mission simultaneously.';
