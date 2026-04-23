-- Apollo MVP: single-table submission log.
-- Auth is API-key-based and handled at the Next.js route layer; the server
-- uses the Supabase service role, which bypasses RLS. Client-side reads
-- from the anon/authenticated roles are default-denied (RLS enabled, no
-- permissive policies).

CREATE TABLE IF NOT EXISTS apollo_submissions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_slug   TEXT NOT NULL,
  brand_slug      TEXT NOT NULL,
  inputs          JSONB NOT NULL,
  image_count     INT DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'processing',
    -- processing | generating | delivered | failed
  drive_folder_id TEXT,
  drive_file_id   TEXT,
  drive_file_url  TEXT,
  error_message   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_apollo_submissions_created
  ON apollo_submissions (created_at DESC);

ALTER TABLE apollo_submissions ENABLE ROW LEVEL SECURITY;
