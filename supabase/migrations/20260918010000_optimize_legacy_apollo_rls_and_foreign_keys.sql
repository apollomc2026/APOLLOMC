-- Preserve existing ownership semantics while allowing PostgreSQL to evaluate
-- auth.uid() once per statement instead of once per candidate row.
drop policy if exists profiles_own on public.profiles;
create policy profiles_own on public.profiles
for all
using ((select auth.uid()) = id);

drop policy if exists missions_own on public.missions;
create policy missions_own on public.missions
for all
using ((select auth.uid()) = user_id);

drop policy if exists intake_own on public.intake_sessions;
create policy intake_own on public.intake_sessions
for all
using (mission_id in (
  select missions.id from public.missions
  where missions.user_id = (select auth.uid())
));

drop policy if exists files_own on public.uploaded_files;
create policy files_own on public.uploaded_files
for all
using (mission_id in (
  select missions.id from public.missions
  where missions.user_id = (select auth.uid())
));

drop policy if exists tasks_read_own on public.tasks;
create policy tasks_read_own on public.tasks
for select
using (mission_id in (
  select missions.id from public.missions
  where missions.user_id = (select auth.uid())
));

drop policy if exists outputs_own on public.outputs;
create policy outputs_own on public.outputs
for select
using (mission_id in (
  select missions.id from public.missions
  where missions.user_id = (select auth.uid())
));

-- Cover APOLLO-owned foreign keys that the hosted advisor identified. These
-- are additive indexes; historical THEMIS/CMD tables remain isolated and are
-- deliberately outside this migration's scope.
create index if not exists delivery_tokens_mission_id_idx
  on public.delivery_tokens (mission_id);
create index if not exists delivery_tokens_output_id_idx
  on public.delivery_tokens (output_id);
create index if not exists events_user_id_idx
  on public.events (user_id);
create index if not exists intake_sessions_mission_id_idx
  on public.intake_sessions (mission_id);
create index if not exists missions_deliverable_type_id_idx
  on public.missions (deliverable_type_id);
create index if not exists missions_industry_id_idx
  on public.missions (industry_id);
create index if not exists missions_style_template_id_idx
  on public.missions (style_template_id);
create index if not exists prompt_runs_task_id_idx
  on public.prompt_runs (task_id);
