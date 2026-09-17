-- The current Deliverable Specification is APOLLO's sole mission identity.
-- Conversation rows are projections for fast listing; jobs are immutable
-- execution history and must never rename the mission.

create or replace function public.apollo_commit_mission_turn_v2(
  p_conversation_id uuid,
  p_user_content text,
  p_apollo_content text,
  p_rationale text,
  p_specification jsonb,
  p_schema_version text,
  p_content_hash text,
  p_spec_status text,
  p_readiness smallint,
  p_conversation_status text,
  p_title text,
  p_input_channel text,
  p_transcription_confidence real,
  p_critical_review_required boolean,
  p_critical_review_confirmed boolean
) returns table(conversation_id uuid, specification_version integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_conversation_id uuid;
  v_version integer;
  v_user_id uuid := (select auth.uid());
  v_specification_title text := nullif(btrim(p_specification #>> '{mission,title}'), '');
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if v_specification_title is null then raise exception 'specification mission title is required'; end if;
  if nullif(btrim(p_title), '') is distinct from v_specification_title then
    raise exception 'conversation title must match the authoritative specification identity';
  end if;
  if p_input_channel not in ('text', 'voice') then raise exception 'invalid input channel'; end if;
  if p_transcription_confidence is not null and (p_input_channel <> 'voice' or p_transcription_confidence < 0 or p_transcription_confidence > 1) then
    raise exception 'invalid transcription confidence';
  end if;
  if p_critical_review_required and not p_critical_review_confirmed then
    raise exception 'critical voice transcript values require confirmation';
  end if;
  if p_input_channel = 'text' and (p_critical_review_required or p_critical_review_confirmed) then
    raise exception 'text turns cannot carry voice review state';
  end if;

  if p_conversation_id is null then
    insert into public.apollo_conversations(user_id) values (v_user_id)
      returning id, current_spec_version into v_conversation_id, v_version;
  else
    select id, current_spec_version into v_conversation_id, v_version
      from public.apollo_conversations
      where id = p_conversation_id and user_id = v_user_id
      for update;
    if v_conversation_id is null then raise exception 'mission conversation was not found'; end if;
  end if;

  v_version := v_version + 1;
  insert into public.apollo_conversation_turns(
    conversation_id, role, content, sequence, input_channel,
    transcription_confidence, critical_review_required, critical_review_confirmed
  ) values (
    v_conversation_id, 'user', p_user_content, v_version * 2 - 1, p_input_channel,
    p_transcription_confidence, p_critical_review_required, p_critical_review_confirmed
  );
  insert into public.apollo_specification_versions(
    conversation_id, version, schema_version, specification, content_hash, status
  ) values (
    v_conversation_id, v_version, p_schema_version, p_specification, p_content_hash, p_spec_status
  );
  insert into public.apollo_conversation_turns(conversation_id, role, content, rationale, sequence)
    values (v_conversation_id, 'apollo', p_apollo_content, p_rationale, v_version * 2);
  update public.apollo_conversations set
    readiness = p_readiness,
    status = p_conversation_status,
    current_spec_version = v_version,
    title = v_specification_title
  where id = v_conversation_id;

  return query select v_conversation_id, v_version;
end;
$$;

create or replace function public.apollo_commit_evidence_specification_v2(
  p_conversation_id uuid,
  p_expected_version integer,
  p_specification jsonb,
  p_content_hash text,
  p_readiness smallint,
  p_status text
) returns integer
language plpgsql security invoker set search_path = '' as $$
declare
  v_version integer;
  v_specification_title text := nullif(btrim(p_specification #>> '{mission,title}'), '');
begin
  if v_specification_title is null then raise exception 'specification mission title is required'; end if;
  select current_spec_version into v_version from public.apollo_conversations
    where id = p_conversation_id and user_id = (select auth.uid()) for update;
  if v_version is null then raise exception 'mission conversation was not found'; end if;
  if v_version <> p_expected_version then
    raise exception using errcode = '40001', message = 'mission specification changed; retry against the current version';
  end if;
  v_version := v_version + 1;
  insert into public.apollo_specification_versions(conversation_id, version, schema_version, specification, content_hash, status)
    values (p_conversation_id, v_version, p_specification->>'schema_version', p_specification, p_content_hash, p_status);
  update public.apollo_conversations set
    current_spec_version = v_version,
    readiness = p_readiness,
    status = case when p_readiness >= 75 then 'brief_ready' else 'calibrating' end,
    title = v_specification_title
  where id = p_conversation_id and user_id = (select auth.uid());
  return v_version;
end $$;

create or replace function public.apollo_approve_specification(
  p_conversation_id uuid,
  p_version integer,
  p_unresolved_items_accepted jsonb
)
returns table(specification_id uuid, specification jsonb, content_hash text, approved_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_now timestamptz := now();
  v_source_specification jsonb;
  v_approved_specification jsonb;
  v_specification_title text;
begin
  if jsonb_typeof(p_unresolved_items_accepted) is distinct from 'array' then raise exception 'accepted unresolved items must be an explicit array'; end if;
  if not exists (
    select 1 from public.apollo_conversations where id = p_conversation_id
      and user_id = (select auth.uid()) and current_spec_version = p_version and readiness >= 75 for update
  ) then raise exception 'only the current ready specification can be approved'; end if;

  select s.specification into v_source_specification from public.apollo_specification_versions s
    where s.conversation_id = p_conversation_id and s.version = p_version and s.status in ('ready', 'draft') for update;
  if v_source_specification is null then raise exception 'specification approval failed'; end if;
  v_specification_title := nullif(btrim(v_source_specification #>> '{mission,title}'), '');
  if v_specification_title is null then raise exception 'specification mission title is required'; end if;

  if exists (
    select 1 from jsonb_array_elements_text(coalesce(v_source_specification #> '{content,open_questions}', '[]'::jsonb)) as open_question(value)
    where not p_unresolved_items_accepted @> jsonb_build_array(open_question.value)
  ) or exists (
    select 1 from jsonb_array_elements_text(p_unresolved_items_accepted) as accepted(value)
    where not coalesce(v_source_specification #> '{content,open_questions}', '[]'::jsonb) @> jsonb_build_array(accepted.value)
  ) then raise exception 'every current open decision must be explicitly accepted, with no stale or additional items'; end if;

  v_approved_specification := jsonb_set(jsonb_set(jsonb_set(jsonb_set(
    v_source_specification, '{approval,status}', '"approved"'),
    '{approval,approved_by}', to_jsonb((select auth.uid())::text)),
    '{approval,approved_at}', to_jsonb(v_now::text)),
    '{approval,unresolved_items_accepted}', p_unresolved_items_accepted);

  return query update public.apollo_specification_versions s set
    status = 'approved', approved_by = (select auth.uid()), approved_at = v_now,
    specification = v_approved_specification,
    content_hash = encode(extensions.digest(convert_to(v_approved_specification::text, 'UTF8'), 'sha256'), 'hex')
  where s.conversation_id = p_conversation_id and s.version = p_version and s.status in ('ready', 'draft')
  returning s.id, s.specification, s.content_hash, s.approved_at;
  if not found then raise exception 'specification approval failed'; end if;

  update public.apollo_conversations set status = 'approved', readiness = 100, title = v_specification_title
    where id = p_conversation_id and user_id = (select auth.uid());
end;
$$;

-- Repair only current, unapproved specifications. Approved history remains
-- immutable; future revisions are normalized by the application before commit.
with current_specs as (
  select s.id, s.conversation_id, s.specification,
    case s.specification #>> '{artifact,recommended_type}'
      when 'fsr' then 'Field Service Report'
      when 'final-qc-report' then 'Final Quality Control Report'
      when 'quote' then 'Quote'
      when 'proposal' then 'Consulting Proposal'
      when 'cash-flow-budget-package' then 'Cash Flow Forecast & Budget Package'
      when 'contract-intelligence-review' then 'Contract Intelligence Review'
      else initcap(replace(s.specification #>> '{artifact,recommended_type}', '-', ' '))
    end as canonical_title
  from public.apollo_specification_versions s
  join public.apollo_conversations c on c.id = s.conversation_id and c.current_spec_version = s.version
  where s.status in ('draft', 'ready')
), repaired as (
  update public.apollo_specification_versions s set
    specification = jsonb_set(s.specification, '{mission,title}', to_jsonb(cs.canonical_title)),
    content_hash = encode(extensions.digest(convert_to(jsonb_set(s.specification, '{mission,title}', to_jsonb(cs.canonical_title))::text, 'UTF8'), 'sha256'), 'hex')
  from current_specs cs where s.id = cs.id
  returning s.conversation_id, cs.canonical_title
)
update public.apollo_conversations c set title = r.canonical_title
from repaired r where c.id = r.conversation_id;

revoke all on function public.apollo_commit_mission_turn_v2(uuid,text,text,text,jsonb,text,text,text,smallint,text,text,text,real,boolean,boolean) from public, anon;
grant execute on function public.apollo_commit_mission_turn_v2(uuid,text,text,text,jsonb,text,text,text,smallint,text,text,text,real,boolean,boolean) to authenticated;
revoke all on function public.apollo_commit_evidence_specification_v2(uuid,integer,jsonb,text,smallint,text) from public, anon;
grant execute on function public.apollo_commit_evidence_specification_v2(uuid,integer,jsonb,text,smallint,text) to authenticated;
revoke all on function public.apollo_approve_specification(uuid,integer,jsonb) from public, anon;
grant execute on function public.apollo_approve_specification(uuid,integer,jsonb) to authenticated;
