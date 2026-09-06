-- APOLLO 3 conversational control plane.
-- Additive: legacy missions/intake tables remain available during measured cutover.

create table if not exists public.apollo_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'Untitled mission',
  status text not null default 'discovery'
    check (status in ('discovery', 'calibrating', 'brief_ready', 'approved', 'submitted', 'archived')),
  readiness smallint not null default 0 check (readiness between 0 and 100),
  current_spec_version integer not null default 0 check (current_spec_version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.apollo_conversation_turns (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.apollo_conversations(id) on delete cascade,
  role text not null check (role in ('user', 'apollo')),
  content text not null check (char_length(content) between 1 and 12000),
  rationale text,
  sequence integer not null check (sequence > 0),
  created_at timestamptz not null default now(),
  unique (conversation_id, sequence)
);

create table if not exists public.apollo_specification_versions (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.apollo_conversations(id) on delete cascade,
  version integer not null check (version > 0),
  schema_version text not null,
  specification jsonb not null,
  content_hash text not null,
  status text not null default 'draft' check (status in ('draft', 'ready', 'approved', 'superseded')),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  unique (conversation_id, version)
);

create table if not exists public.apollo_conversation_evidence (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.apollo_conversations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  original_name text not null,
  storage_key text,
  mime_type text,
  size_bytes bigint check (size_bytes is null or size_bytes >= 0),
  extraction_status text not null default 'pending'
    check (extraction_status in ('pending', 'processing', 'verified', 'conflict', 'failed')),
  extracted_facts jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists apollo_conversations_user_updated_idx
  on public.apollo_conversations (user_id, updated_at desc);
create index if not exists apollo_turns_conversation_sequence_idx
  on public.apollo_conversation_turns (conversation_id, sequence);
create index if not exists apollo_specs_conversation_version_idx
  on public.apollo_specification_versions (conversation_id, version desc);
create index if not exists apollo_evidence_conversation_idx
  on public.apollo_conversation_evidence (conversation_id, created_at);

alter table public.apollo_conversations enable row level security;
alter table public.apollo_conversation_turns enable row level security;
alter table public.apollo_specification_versions enable row level security;
alter table public.apollo_conversation_evidence enable row level security;

revoke all on table public.apollo_conversations from anon, authenticated;
revoke all on table public.apollo_conversation_turns from anon, authenticated;
revoke all on table public.apollo_specification_versions from anon, authenticated;
revoke all on table public.apollo_conversation_evidence from anon, authenticated;
grant select, insert, update on table public.apollo_conversations to authenticated;
grant select, insert on table public.apollo_conversation_turns to authenticated;
grant select, insert, update on table public.apollo_specification_versions to authenticated;
grant select, insert, update on table public.apollo_conversation_evidence to authenticated;

create policy "conversation_select_own" on public.apollo_conversations for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "conversation_insert_own" on public.apollo_conversations for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy "conversation_update_own" on public.apollo_conversations for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy "turn_select_own" on public.apollo_conversation_turns for select to authenticated
  using (exists (select 1 from public.apollo_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy "turn_insert_own" on public.apollo_conversation_turns for insert to authenticated
  with check (exists (select 1 from public.apollo_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

create policy "spec_select_own" on public.apollo_specification_versions for select to authenticated
  using (exists (select 1 from public.apollo_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy "spec_insert_own" on public.apollo_specification_versions for insert to authenticated
  with check (exists (select 1 from public.apollo_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy "spec_update_own" on public.apollo_specification_versions for update to authenticated
  using (exists (select 1 from public.apollo_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())))
  with check (exists (select 1 from public.apollo_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));

create policy "evidence_select_own" on public.apollo_conversation_evidence for select to authenticated
  using ((select auth.uid()) = user_id);
create policy "evidence_insert_own" on public.apollo_conversation_evidence for insert to authenticated
  with check ((select auth.uid()) = user_id and exists (select 1 from public.apollo_conversations c where c.id = conversation_id and c.user_id = (select auth.uid())));
create policy "evidence_update_own" on public.apollo_conversation_evidence for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

drop trigger if exists apollo_conversations_updated_at on public.apollo_conversations;
create trigger apollo_conversations_updated_at before update on public.apollo_conversations
  for each row execute function public.update_updated_at();

create or replace function public.apollo_commit_mission_turn(
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
  p_title text
) returns table(conversation_id uuid, specification_version integer)
language plpgsql security invoker set search_path = '' as $$
declare
  v_conversation_id uuid;
  v_version integer;
  v_user_id uuid := (select auth.uid());
begin
  if v_user_id is null then raise exception 'authentication required'; end if;
  if p_conversation_id is null then
    insert into public.apollo_conversations(user_id) values (v_user_id)
      returning id, current_spec_version into v_conversation_id, v_version;
  else
    select id, current_spec_version into v_conversation_id, v_version
      from public.apollo_conversations where id = p_conversation_id and user_id = v_user_id for update;
    if v_conversation_id is null then raise exception 'mission conversation was not found'; end if;
  end if;
  v_version := v_version + 1;
  insert into public.apollo_conversation_turns(conversation_id, role, content, sequence)
    values (v_conversation_id, 'user', p_user_content, v_version * 2 - 1);
  insert into public.apollo_specification_versions(conversation_id, version, schema_version, specification, content_hash, status)
    values (v_conversation_id, v_version, p_schema_version, p_specification, p_content_hash, p_spec_status);
  insert into public.apollo_conversation_turns(conversation_id, role, content, rationale, sequence)
    values (v_conversation_id, 'apollo', p_apollo_content, p_rationale, v_version * 2);
  update public.apollo_conversations set readiness = p_readiness, status = p_conversation_status,
    current_spec_version = v_version, title = p_title where id = v_conversation_id;
  return query select v_conversation_id, v_version;
end $$;

revoke all on function public.apollo_commit_mission_turn(uuid,text,text,text,jsonb,text,text,text,smallint,text,text) from public, anon;
grant execute on function public.apollo_commit_mission_turn(uuid,text,text,text,jsonb,text,text,text,smallint,text,text) to authenticated;
