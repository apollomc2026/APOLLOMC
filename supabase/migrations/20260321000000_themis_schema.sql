-- Migration-history alignment marker.
--
-- The APOLLO production database already records this migration version as
-- applied. Its existing THEMIS objects are intentionally left untouched.
-- Keeping this no-op marker in Git allows the Supabase integration to verify
-- migration history before applying later APOLLO-owned migrations.

select 1;
