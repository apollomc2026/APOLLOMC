alter table public.apollo_conversation_turns
  add column if not exists input_channel text not null default 'text'
    check (input_channel in ('text', 'voice')),
  add column if not exists transcription_confidence real
    check (transcription_confidence is null or transcription_confidence between 0 and 1),
  add column if not exists critical_review_required boolean not null default false,
  add column if not exists critical_review_confirmed boolean not null default false,
  add constraint apollo_voice_review_confirmation_required
    check (not critical_review_required or critical_review_confirmed);

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
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
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
    title = p_title
  where id = v_conversation_id;

  return query select v_conversation_id, v_version;
end;
$$;

revoke all on function public.apollo_commit_mission_turn_v2(uuid,text,text,text,jsonb,text,text,text,smallint,text,text,text,real,boolean,boolean) from public, anon;
grant execute on function public.apollo_commit_mission_turn_v2(uuid,text,text,text,jsonb,text,text,text,smallint,text,text,text,real,boolean,boolean) to authenticated;

comment on function public.apollo_commit_mission_turn_v2(uuid,text,text,text,jsonb,text,text,text,smallint,text,text,text,real,boolean,boolean) is
  'Atomically commits an APOLLO mission turn and preserves reviewed voice-transcription provenance.';
