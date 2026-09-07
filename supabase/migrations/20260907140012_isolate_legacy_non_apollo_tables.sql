-- APOLLO, THEMIS, and the historical command-center project are separate
-- products. Preserve legacy rows for controlled extraction, but remove every
-- browser-role privilege from their tables inside APOLLO's database.

revoke all privileges on table
  public.cmd_activity,
  public.cmd_alerts,
  public.cmd_chat,
  public.cmd_milestones,
  public.cmd_projects,
  public.themis_activity,
  public.themis_alerts,
  public.themis_contacts,
  public.themis_conversations,
  public.themis_entities,
  public.themis_events,
  public.themis_files,
  public.themis_milestones,
  public.themis_platforms
from anon, authenticated;

comment on table public.themis_entities is
  'Legacy non-APOLLO data retained solely for controlled export and removal; browser access revoked.';

comment on table public.cmd_projects is
  'Legacy non-APOLLO data retained solely for controlled export and removal; browser access revoked.';
