begin;
select plan(31);

select ok(relrowsecurity, 'conversations has RLS enabled') from pg_class where oid = 'public.apollo_conversations'::regclass;
select ok(relrowsecurity, 'turns has RLS enabled') from pg_class where oid = 'public.apollo_conversation_turns'::regclass;
select ok(relrowsecurity, 'specifications has RLS enabled') from pg_class where oid = 'public.apollo_specification_versions'::regclass;
select ok(relrowsecurity, 'evidence has RLS enabled') from pg_class where oid = 'public.apollo_conversation_evidence'::regclass;

select is(count(*)::integer, 3, 'conversations has explicit operation policies') from pg_policies where schemaname = 'public' and tablename = 'apollo_conversations';
select is(count(*)::integer, 2, 'turns has read and append policies') from pg_policies where schemaname = 'public' and tablename = 'apollo_conversation_turns';
select is(count(*)::integer, 3, 'specifications has explicit operation policies') from pg_policies where schemaname = 'public' and tablename = 'apollo_specification_versions';
select is(count(*)::integer, 3, 'evidence has explicit operation policies') from pg_policies where schemaname = 'public' and tablename = 'apollo_conversation_evidence';

select ok(not has_table_privilege('anon', 'public.apollo_conversations', 'SELECT'), 'anonymous role cannot read conversations');
select ok(not has_table_privilege('anon', 'public.apollo_conversation_turns', 'INSERT'), 'anonymous role cannot append turns');
select ok(has_table_privilege('authenticated', 'public.apollo_conversations', 'SELECT'), 'authenticated role has conversation Data API grant');
select ok(has_table_privilege('authenticated', 'public.apollo_specification_versions', 'UPDATE'), 'authenticated role can approve an owned specification');

select ok(not has_function_privilege('anon', 'public.apollo_commit_mission_turn(uuid,text,text,text,jsonb,text,text,text,smallint,text,text)', 'EXECUTE'), 'anonymous role cannot commit mission turns');
select ok(has_function_privilege('authenticated', 'public.apollo_commit_mission_turn(uuid,text,text,text,jsonb,text,text,text,smallint,text,text)', 'EXECUTE'), 'authenticated role can atomically commit mission turns');
select ok(not has_function_privilege('anon', 'public.apollo_approve_specification(uuid,integer)', 'EXECUTE'), 'anonymous role cannot approve specifications');
select ok(has_function_privilege('authenticated', 'public.apollo_approve_specification(uuid,integer)', 'EXECUTE'), 'authenticated role can atomically approve owned specifications');
select ok(not has_function_privilege('anon', 'public.apollo_commit_evidence_specification(uuid,jsonb,text,smallint,text)', 'EXECUTE'), 'anonymous role cannot commit evidence specifications');
select ok(has_function_privilege('authenticated', 'public.apollo_commit_evidence_specification(uuid,jsonb,text,smallint,text)', 'EXECUTE'), 'authenticated role can commit evidence-derived versions');

select ok(exists (select 1 from pg_extension where extname = 'pgcrypto'), 'pgcrypto is available for approved-specification hashing');
select ok(not prosecdef, 'approval function runs with caller privileges') from pg_proc where oid = 'public.apollo_approve_specification(uuid,integer)'::regprocedure;
select like(pg_get_functiondef('public.apollo_approve_specification(uuid,integer)'::regprocedure), '%content_hash = encode(extensions.digest%', 'approval re-hashes the exact approved specification');

select ok(relrowsecurity, 'brand kits has RLS enabled') from pg_class where oid = 'public.apollo_brand_kits'::regclass;
select is(count(*)::integer, 4, 'brand kits has complete CRUD ownership policies') from pg_policies where schemaname = 'public' and tablename = 'apollo_brand_kits';
select ok(not has_table_privilege('anon', 'public.apollo_brand_kits', 'SELECT'), 'anonymous role cannot read brand kits');
select ok(has_table_privilege('authenticated', 'public.apollo_brand_kits', 'SELECT'), 'authenticated role has brand-kit Data API access');

select like(pg_get_functiondef('public.update_updated_at()'::regprocedure), '%SET search_path TO ''''%', 'updated-at trigger has an immutable search path');
select like(pg_get_functiondef('public.themis_update_ts()'::regprocedure), '%SET search_path TO ''''%', 'THEMIS trigger has an immutable search path');
select like(pg_get_functiondef('public.handle_new_user()'::regprocedure), '%SET search_path TO ''''%', 'signup trigger has an immutable search path');
select like(pg_get_functiondef('public.apollo_rate_limit_hit(text,timestamp with time zone,integer)'::regprocedure), '%SET search_path TO ''''%', 'rate limiter has an immutable search path');
select ok(not has_function_privilege('anon', 'public.apollo_rate_limit_hit(text,timestamp with time zone,integer)', 'EXECUTE'), 'anonymous role cannot invoke the privileged rate limiter');
select ok(not has_function_privilege('authenticated', 'public.handle_new_user()', 'EXECUTE'), 'signed-in users cannot invoke the privileged signup trigger');

select * from finish();
rollback;
