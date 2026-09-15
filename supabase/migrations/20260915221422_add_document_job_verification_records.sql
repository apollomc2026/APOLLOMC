alter table public.apollo_document_jobs
  add column if not exists agreement_verification jsonb not null default '{}'::jsonb,
  add column if not exists federal_verification jsonb not null default '{}'::jsonb,
  add column if not exists field_record_verification jsonb not null default '{}'::jsonb,
  add column if not exists commercial_verification jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'apollo_document_jobs_agreement_verification_object' and conrelid = 'public.apollo_document_jobs'::regclass) then
    alter table public.apollo_document_jobs add constraint apollo_document_jobs_agreement_verification_object check (jsonb_typeof(agreement_verification) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'apollo_document_jobs_federal_verification_object' and conrelid = 'public.apollo_document_jobs'::regclass) then
    alter table public.apollo_document_jobs add constraint apollo_document_jobs_federal_verification_object check (jsonb_typeof(federal_verification) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'apollo_document_jobs_field_record_verification_object' and conrelid = 'public.apollo_document_jobs'::regclass) then
    alter table public.apollo_document_jobs add constraint apollo_document_jobs_field_record_verification_object check (jsonb_typeof(field_record_verification) = 'object');
  end if;
  if not exists (select 1 from pg_constraint where conname = 'apollo_document_jobs_commercial_verification_object' and conrelid = 'public.apollo_document_jobs'::regclass) then
    alter table public.apollo_document_jobs add constraint apollo_document_jobs_commercial_verification_object check (jsonb_typeof(commercial_verification) = 'object');
  end if;
end
$$;

comment on column public.apollo_document_jobs.agreement_verification is 'Deterministic agreement-integrity report captured before publication.';
comment on column public.apollo_document_jobs.federal_verification is 'Deterministic federal-response identity and requirement report captured before publication.';
comment on column public.apollo_document_jobs.field_record_verification is 'Deterministic field-record identity, row, and acceptance report captured before publication.';
comment on column public.apollo_document_jobs.commercial_verification is 'Deterministic commercial line-item and arithmetic report captured before publication.';
