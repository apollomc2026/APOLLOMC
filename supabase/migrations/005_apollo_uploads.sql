-- Apollo file uploads
-- Each row is one uploaded file. Linked to a user; optionally linked to a
-- submission once the user submits the deliverable.

create table if not exists apollo_uploads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  submission_id uuid null references apollo_submissions(id) on delete set null,

  -- The typed slot this upload fills (e.g. 'brand_guide', 'site_photo',
  -- 'receipt'). Free-form string, not a closed enum, so modules can
  -- introduce new kinds.
  upload_kind text not null,

  -- Original filename as the user uploaded it (display only — never trust)
  original_filename text not null,

  -- Path in the Supabase Storage bucket (apollo-uploads). Format:
  --   "<user_id>/<upload_id>/<sanitized_filename>"
  storage_path text not null,

  content_type text not null,
  size_bytes bigint not null,

  -- Optional caption the user entered (e.g. for site photos).
  caption text,

  -- For images: extracted dimensions when computable server-side.
  width int,
  height int,

  -- For documents: extracted text (cached) so we don't re-extract per
  -- submission. Null for images and for files we can't extract.
  extracted_text text,

  created_at timestamptz not null default now()
);

create index if not exists idx_apollo_uploads_user
  on apollo_uploads(user_id, created_at desc);
create index if not exists idx_apollo_uploads_submission
  on apollo_uploads(submission_id) where submission_id is not null;

-- RLS: user can only see/manage their own uploads
alter table apollo_uploads enable row level security;

drop policy if exists "users see own uploads" on apollo_uploads;
create policy "users see own uploads" on apollo_uploads
  for select using (auth.uid() = user_id);

drop policy if exists "users insert own uploads" on apollo_uploads;
create policy "users insert own uploads" on apollo_uploads
  for insert with check (auth.uid() = user_id);

drop policy if exists "users update own uploads" on apollo_uploads;
create policy "users update own uploads" on apollo_uploads
  for update using (auth.uid() = user_id);

drop policy if exists "users delete own uploads" on apollo_uploads;
create policy "users delete own uploads" on apollo_uploads
  for delete using (auth.uid() = user_id);

-- Storage RLS for the apollo-uploads bucket. Users can read/write only
-- objects whose path starts with their own user_id (the storage path
-- convention is "<user_id>/<upload_id>/<filename>").
drop policy if exists "users access own uploads in storage" on storage.objects;
create policy "users access own uploads in storage" on storage.objects
  for all using (
    bucket_id = 'apollo-uploads'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
