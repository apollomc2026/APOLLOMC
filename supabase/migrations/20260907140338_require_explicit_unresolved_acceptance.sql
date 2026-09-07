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
begin
  if jsonb_typeof(p_unresolved_items_accepted) is distinct from 'array' then
    raise exception 'accepted unresolved items must be an explicit array';
  end if;

  if not exists (
    select 1 from public.apollo_conversations
    where id = p_conversation_id
      and user_id = (select auth.uid())
      and current_spec_version = p_version
      and readiness >= 75
    for update
  ) then
    raise exception 'only the current ready specification can be approved';
  end if;

  select s.specification into v_source_specification
  from public.apollo_specification_versions s
  where s.conversation_id = p_conversation_id
    and s.version = p_version
    and s.status in ('ready', 'draft')
  for update;

  if v_source_specification is null then
    raise exception 'specification approval failed';
  end if;

  if exists (
    select 1
    from jsonb_array_elements_text(coalesce(v_source_specification #> '{content,open_questions}', '[]'::jsonb)) as open_question(value)
    where not p_unresolved_items_accepted @> jsonb_build_array(open_question.value)
  ) or exists (
    select 1
    from jsonb_array_elements_text(p_unresolved_items_accepted) as accepted(value)
    where not coalesce(v_source_specification #> '{content,open_questions}', '[]'::jsonb) @> jsonb_build_array(accepted.value)
  ) then
    raise exception 'every current open decision must be explicitly accepted, with no stale or additional items';
  end if;

  v_approved_specification := jsonb_set(
    jsonb_set(
      jsonb_set(
        jsonb_set(v_source_specification, '{approval,status}', '"approved"'),
        '{approval,approved_by}', to_jsonb((select auth.uid())::text)
      ),
      '{approval,approved_at}', to_jsonb(v_now::text)
    ),
    '{approval,unresolved_items_accepted}', p_unresolved_items_accepted
  );

  return query
    update public.apollo_specification_versions s set
      status = 'approved',
      approved_by = (select auth.uid()),
      approved_at = v_now,
      specification = v_approved_specification,
      content_hash = encode(extensions.digest(convert_to(v_approved_specification::text, 'UTF8'), 'sha256'), 'hex')
    where s.conversation_id = p_conversation_id
      and s.version = p_version
      and s.status in ('ready', 'draft')
    returning s.id, s.specification, s.content_hash, s.approved_at;

  if not found then
    raise exception 'specification approval failed';
  end if;

  update public.apollo_conversations set status = 'approved' where id = p_conversation_id;
end;
$$;

revoke all on function public.apollo_approve_specification(uuid, integer, jsonb) from public, anon;
grant execute on function public.apollo_approve_specification(uuid, integer, jsonb) to authenticated;

-- Disable the legacy signature so a caller cannot bypass unresolved-item consent.
revoke all on function public.apollo_approve_specification(uuid, integer) from authenticated;

comment on function public.apollo_approve_specification(uuid, integer, jsonb) is
  'Locks the current APOLLO specification only when every open decision is resolved or explicitly accepted.';
