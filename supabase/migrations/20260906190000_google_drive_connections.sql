create table if not exists public.apollo_google_drive_connections (
  user_id uuid primary key references auth.users(id) on delete cascade,
  encrypted_refresh_token text not null,
  token_iv text not null,
  token_tag text not null,
  google_email text,
  scope text,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.apollo_google_drive_connections enable row level security;
revoke all on table public.apollo_google_drive_connections from anon, authenticated;

-- OAuth credentials are deliberately service-role only. Authenticated users inspect
-- connection status through APOLLO's server route, which never returns token material.
drop trigger if exists apollo_google_drive_connections_updated_at on public.apollo_google_drive_connections;
create trigger apollo_google_drive_connections_updated_at
  before update on public.apollo_google_drive_connections
  for each row execute function public.update_updated_at();
