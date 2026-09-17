-- Replace early broad-role policies with explicit authenticated ownership.
drop policy if exists "users see own submissions" on public.apollo_submissions;
drop policy if exists "users insert own submissions" on public.apollo_submissions;
drop policy if exists "users update own submissions" on public.apollo_submissions;
drop policy if exists "users delete own submissions" on public.apollo_submissions;

create policy "users see own submissions" on public.apollo_submissions
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own submissions" on public.apollo_submissions
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own submissions" on public.apollo_submissions
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "users delete own submissions" on public.apollo_submissions
  for delete to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "users see own uploads" on public.apollo_uploads;
drop policy if exists "users insert own uploads" on public.apollo_uploads;
drop policy if exists "users update own uploads" on public.apollo_uploads;
drop policy if exists "users delete own uploads" on public.apollo_uploads;

create policy "users see own uploads" on public.apollo_uploads
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "users insert own uploads" on public.apollo_uploads
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users update own uploads" on public.apollo_uploads
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "users delete own uploads" on public.apollo_uploads
  for delete to authenticated using ((select auth.uid()) = user_id);

create index if not exists apollo_conversation_evidence_user_id_idx
  on public.apollo_conversation_evidence (user_id);
create index if not exists apollo_specification_versions_approved_by_idx
  on public.apollo_specification_versions (approved_by)
  where approved_by is not null;
