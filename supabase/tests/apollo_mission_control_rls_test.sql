begin;
select plan(12);

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

select * from finish();
rollback;
