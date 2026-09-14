create or replace function public.apollo_commit_evidence_specification_v2(
  p_conversation_id uuid,
  p_expected_version integer,
  p_specification jsonb,
  p_content_hash text,
  p_readiness smallint,
  p_status text
) returns integer
language plpgsql security invoker set search_path = '' as $$
declare v_version integer;
begin
  select current_spec_version into v_version from public.apollo_conversations
    where id = p_conversation_id and user_id = (select auth.uid()) for update;
  if v_version is null then raise exception 'mission conversation was not found'; end if;
  if v_version <> p_expected_version then
    raise exception using errcode = '40001', message = 'mission specification changed; retry against the current version';
  end if;
  v_version := v_version + 1;
  insert into public.apollo_specification_versions(conversation_id, version, schema_version, specification, content_hash, status)
    values (p_conversation_id, v_version, p_specification->>'schema_version', p_specification, p_content_hash, p_status);
  update public.apollo_conversations set current_spec_version = v_version, readiness = p_readiness,
    status = case when p_readiness >= 75 then 'brief_ready' else 'calibrating' end
    where id = p_conversation_id and user_id = (select auth.uid());
  return v_version;
end $$;

revoke all on function public.apollo_commit_evidence_specification_v2(uuid,integer,jsonb,text,smallint,text) from public, anon;
grant execute on function public.apollo_commit_evidence_specification_v2(uuid,integer,jsonb,text,smallint,text) to authenticated;
