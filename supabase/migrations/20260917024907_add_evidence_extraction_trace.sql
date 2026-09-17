alter table public.apollo_conversation_evidence
  add column if not exists extraction_trace jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'apollo_evidence_extraction_trace_object'
      and conrelid = 'public.apollo_conversation_evidence'::regclass
  ) then
    alter table public.apollo_conversation_evidence
      add constraint apollo_evidence_extraction_trace_object
      check (extraction_trace is null or jsonb_typeof(extraction_trace) = 'object');
  end if;
end $$;

comment on column public.apollo_conversation_evidence.extraction_trace is
  'Durable audit record proving the planned, completed, and recovery passes used to extract this evidence source.';
