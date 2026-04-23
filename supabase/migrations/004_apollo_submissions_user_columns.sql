-- Add user_id (uuid) and user_email (text) columns to apollo_submissions so the
-- submit route can attribute every row to the Google-OAuth'd user that created
-- it. Both nullable to preserve existing rows created before Apollo moved from
-- API-key auth to session auth.
--
-- The Apollo /api/apollo/submit handler writes with the Supabase service role,
-- which bypasses RLS — we don't add permissive policies here.

ALTER TABLE apollo_submissions
  ADD COLUMN IF NOT EXISTS user_id    UUID,
  ADD COLUMN IF NOT EXISTS user_email TEXT;

CREATE INDEX IF NOT EXISTS idx_apollo_submissions_user_id
  ON apollo_submissions (user_id);
