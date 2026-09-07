-- Bind Google Drive custody to the authorizing APOLLO user. The OAuth token
-- table remains service-role-only; clients receive status through server routes.
alter table public.apollo_google_drive_connections
  add column if not exists provider_subject text,
  add column if not exists custody_folder_id text,
  add column if not exists custody_folder_name text,
  add column if not exists revoked_at timestamptz;

create unique index if not exists apollo_google_drive_provider_subject_idx
  on public.apollo_google_drive_connections(provider_subject)
  where provider_subject is not null and revoked_at is null;

create index if not exists apollo_google_drive_active_user_idx
  on public.apollo_google_drive_connections(user_id)
  where revoked_at is null;

comment on column public.apollo_google_drive_connections.custody_folder_id is
  'Folder created by APOLLO under drive.file scope for this connection only.';
