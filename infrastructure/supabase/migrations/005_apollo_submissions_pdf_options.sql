-- Apollo PDF pipeline — per-submission visual option columns.
--
-- The submit route accepts optional `font_preset`, `logo_placement`, and
-- `palette_override` form fields. This migration adds columns for the
-- submission row so the history is fully reproducible.
--
-- Applied via `Supabase:apply_migration` during Session A2. If this
-- migration failed to apply automatically, paste into the Supabase SQL
-- editor before the first real PDF submission — otherwise the insert
-- will fail with "column font_preset does not exist".

ALTER TABLE apollo_submissions
  ADD COLUMN IF NOT EXISTS font_preset TEXT,
  ADD COLUMN IF NOT EXISTS logo_placement TEXT,
  ADD COLUMN IF NOT EXISTS palette_override JSONB;
