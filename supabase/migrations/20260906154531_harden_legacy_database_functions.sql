-- Keep trigger helpers out of the Data API and make every object reference
-- independent of the caller's search_path.

create or replace function public.update_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.update_updated_at() from public, anon, authenticated;

create or replace function public.themis_update_ts()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.themis_update_ts() from public, anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;

-- This RPC is called only by APOLLO's server-side service client. Retaining
-- SECURITY DEFINER preserves the existing atomic limiter semantics while the
-- explicit grants prevent browser roles from invoking it through PostgREST.
create or replace function public.apollo_rate_limit_hit(
  p_key text,
  p_window_start timestamptz,
  p_limit integer
)
returns table(allowed boolean, current_count integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_count integer;
begin
  insert into public.apollo_rate_limits(key, window_start, count)
  values (p_key, p_window_start, 1)
  on conflict (key, window_start)
  do update set count = public.apollo_rate_limits.count + 1
  returning public.apollo_rate_limits.count into v_count;

  return query select (v_count <= p_limit), v_count;
end;
$$;

revoke all on function public.apollo_rate_limit_hit(text, timestamptz, integer)
  from public, anon, authenticated;
grant execute on function public.apollo_rate_limit_hit(text, timestamptz, integer)
  to service_role;
