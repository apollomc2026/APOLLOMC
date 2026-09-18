-- Prevent any new APOLLO execution from bypassing the approved mission
-- specification. Historical foreign-project rows remain untouched for safe,
-- deliberate export; this gate applies to every future insert.

create or replace function public.apollo_enforce_job_specification_authority()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_spec public.apollo_specification_versions%rowtype;
  v_trace jsonb := new.work_order -> 'trace';
  v_brand text := new.work_order ->> 'brand_id';
  v_expected_brand text;
begin
  if v_trace is null or jsonb_typeof(v_trace) <> 'object' then
    raise exception 'APOLLO_SPEC_AUTHORITY: approved specification trace is required';
  end if;

  if new.project_id <> v_trace ->> 'specification_id' then
    raise exception 'APOLLO_SPEC_AUTHORITY: project_id must equal specification_id';
  end if;

  select * into v_spec
  from public.apollo_specification_versions
  where id::text = new.project_id;

  if not found then
    raise exception 'APOLLO_SPEC_AUTHORITY: specification not found';
  end if;
  if v_spec.status <> 'approved' or v_spec.specification #>> '{approval,status}' <> 'approved' then
    raise exception 'APOLLO_SPEC_AUTHORITY: specification is not approved';
  end if;
  if v_spec.content_hash <> v_trace ->> 'specification_hash' then
    raise exception 'APOLLO_SPEC_AUTHORITY: specification hash mismatch';
  end if;
  if v_spec.conversation_id <> new.conversation_id then
    raise exception 'APOLLO_SPEC_AUTHORITY: conversation mismatch';
  end if;
  if v_spec.approved_by is null or v_spec.approved_by::text <> new.requested_by then
    raise exception 'APOLLO_SPEC_AUTHORITY: approver mismatch';
  end if;
  if v_spec.specification #>> '{artifact,recommended_type}' <> new.deliverable_type then
    raise exception 'APOLLO_SPEC_AUTHORITY: deliverable type mismatch';
  end if;

  v_expected_brand := coalesce(v_spec.specification #>> '{presentation,brand_profile_id}', 'apollo');
  if v_brand is null
     or v_brand <> v_expected_brand
     or not (v_brand in ('apollo','on-spot-solutions') or v_brand ~* '^kit:[0-9a-f-]{36}$') then
    raise exception 'APOLLO_SPEC_AUTHORITY: brand mismatch';
  end if;

  if new.work_order ->> 'work_order_id' <> new.id::text
     or new.work_order ->> 'conversation_id' <> new.conversation_id::text
     or new.work_order ->> 'requested_by' <> new.requested_by
     or new.work_order ->> 'deliverable_type' <> new.deliverable_type then
    raise exception 'APOLLO_SPEC_AUTHORITY: work order envelope mismatch';
  end if;

  return new;
end;
$$;

drop trigger if exists apollo_document_jobs_specification_authority on public.apollo_document_jobs;
create trigger apollo_document_jobs_specification_authority
before insert on public.apollo_document_jobs
for each row execute function public.apollo_enforce_job_specification_authority();

revoke all on function public.apollo_enforce_job_specification_authority() from public, anon, authenticated;

comment on function public.apollo_enforce_job_specification_authority() is
  'Insert-only APOLLO boundary: every new job must match its approved specification, owner, mission, deliverable, brand, and immutable hash.';
