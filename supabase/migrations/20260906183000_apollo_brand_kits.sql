create table if not exists public.apollo_brand_kits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 2 and 120),
  source text not null default 'created' check (source in ('created','uploaded')),
  primary_color text,
  secondary_color text,
  accent_color text,
  heading_font text,
  body_font text,
  voice text,
  source_file_name text,
  source_storage_key text,
  source_sha256 text,
  source_mime_type text,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists apollo_brand_kits_user_idx on public.apollo_brand_kits(user_id, updated_at desc);
alter table public.apollo_brand_kits enable row level security;
revoke all on table public.apollo_brand_kits from anon, authenticated;
grant select, insert, update, delete on table public.apollo_brand_kits to authenticated;
create policy "brand_kits_select_own" on public.apollo_brand_kits for select to authenticated using ((select auth.uid()) = user_id);
create policy "brand_kits_insert_own" on public.apollo_brand_kits for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "brand_kits_update_own" on public.apollo_brand_kits for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "brand_kits_delete_own" on public.apollo_brand_kits for delete to authenticated using ((select auth.uid()) = user_id);
drop trigger if exists apollo_brand_kits_updated_at on public.apollo_brand_kits;
create trigger apollo_brand_kits_updated_at before update on public.apollo_brand_kits for each row execute function public.update_updated_at();
