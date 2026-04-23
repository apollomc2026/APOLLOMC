-- Rename Drive columns to generic S3-backed download columns.
-- Migration 002 is already applied; this is an additive/rename migration.
--
-- After this migration:
--   download_url stores a presigned S3 GET URL (7-day expiry max per AWS SigV4).
--   s3_prefix   stores the submission-scoped prefix, e.g. "apollo/<submission_id>/".
--   s3_key      stores the full S3 key of the primary DOCX output.

ALTER TABLE apollo_submissions RENAME COLUMN drive_folder_id TO s3_prefix;
ALTER TABLE apollo_submissions RENAME COLUMN drive_file_id   TO s3_key;
ALTER TABLE apollo_submissions RENAME COLUMN drive_file_url  TO download_url;
