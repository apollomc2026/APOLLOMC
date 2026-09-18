-- Keep the database race guard aligned with the executor's canonical state
-- machine. The prior predicate named states that do not exist and omitted
-- gathering-input/reviewing, allowing overlapping flights at those stages.

drop index if exists public.apollo_document_jobs_one_active_flight_idx;

create unique index apollo_document_jobs_one_active_flight_idx
  on public.apollo_document_jobs (requested_by, conversation_id)
  where state in (
    'accepted', 'queued', 'gathering-input', 'generating',
    'validating', 'rendering', 'reviewing'
  );
