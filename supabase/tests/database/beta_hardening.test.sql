begin;
select plan(32);

select has_table('public', 'public_request_rate_limits', 'shared public rate-limit table exists');
select has_table('public', 'abuse_reports', 'abuse report table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.public_request_rate_limits'::regclass), 'public rate limits have RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.abuse_reports'::regclass), 'abuse reports have RLS');
select ok(not has_table_privilege('anon', 'public.public_request_rate_limits', 'select'), 'anon cannot read rate limits');
select ok(not has_table_privilege('anon', 'public.abuse_reports', 'select'), 'anon cannot read abuse reports');
select ok(not has_function_privilege('anon', 'public.submit_public_rsvp(text,text,text,smallint,text,uuid,text)', 'execute'), 'anon cannot call RSVP RPC directly');
select ok(not has_function_privilege('anon', 'public.get_personalized_guest(text,text)', 'execute'), 'anon cannot call personalized lookup directly');
select ok(not has_function_privilege('anon', 'public.get_published_invitation(text)', 'execute'), 'anon cannot call invitation lookup directly');
select ok(not has_function_privilege('anon', 'public.get_public_wishes(text)', 'execute'), 'anon cannot call wishes lookup directly');
select ok(not has_function_privilege('anon', 'public.get_published_invitation_media(uuid)', 'execute'), 'anon cannot call media lookup directly');
select ok(not has_function_privilege('authenticated', 'public.submit_public_rsvp(text,text,text,smallint,text,uuid,text)', 'execute'), 'authenticated cannot call RSVP RPC directly');
select ok(not has_function_privilege('authenticated', 'public.get_personalized_guest(text,text)', 'execute'), 'authenticated cannot call personalized lookup directly');
select ok(not has_function_privilege('authenticated', 'public.get_published_invitation(text)', 'execute'), 'authenticated cannot call invitation lookup directly');
select ok(not has_function_privilege('authenticated', 'public.get_public_wishes(text)', 'execute'), 'authenticated cannot call wishes lookup directly');
select ok(not has_function_privilege('authenticated', 'public.get_published_invitation_media(uuid)', 'execute'), 'authenticated cannot call media lookup directly');
select ok(not has_function_privilege('anon', 'public.submit_abuse_report(text,text,text,text,text,uuid)', 'execute'), 'anon cannot call abuse RPC directly');
select ok(has_function_privilege('service_role', 'public.submit_abuse_report(text,text,text,text,text,uuid)', 'execute'), 'trusted server can submit abuse reports');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('33333333-aaaa-4333-8333-333333333333','00000000-0000-0000-0000-000000000000','authenticated','authenticated','delete-owner@example.test','',now(),'{}','{}',now(),now()),
('44444444-bbbb-4444-8444-444444444444','00000000-0000-0000-0000-000000000000','authenticated','authenticated','keep-owner@example.test','',now(),'{}','{}',now(),now());

set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-aaaa-4333-8333-333333333333',true);
select lives_ok($$select public.create_invitation_draft('report-test','{"schemaVersion":1,"couple":{"partnerOneName":"Ayu","partnerTwoName":"Bima"},"presentation":{"templateKey":"modern-minimal","accent":"rose","typography":"elegant","sections":["hero","event"]}}'::jsonb,'Akad','2027-01-10 02:30+00','Asia/Jakarta','Gedung','Jakarta',null)$$, 'owner creates invitation');
select lives_ok($$select public.publish_invitation((select id from public.invitations where slug='report-test'),1)$$, 'owner publishes invitation');

reset role; set local role service_role;
select is((select result from public.submit_abuse_report('report-test','privacy','Laporan privasi yang valid.','',repeat('a',64),'10000000-0000-4000-8000-000000000001')), 'accepted', 'trusted report accepted');
select is((select count(*) from public.abuse_reports), 1::bigint, 'report stored once');
select is((select result from public.submit_abuse_report('report-test','privacy','Laporan privasi yang valid.','',repeat('a',64),'10000000-0000-4000-8000-000000000001')), 'accepted', 'duplicate report is idempotent');
select is((select count(*) from public.abuse_reports), 1::bigint, 'idempotency prevents duplicate row');
select is((select result from public.submit_abuse_report('report-test','other','Laporan kedua yang valid.','',repeat('a',64),'20000000-0000-4000-8000-000000000002')), 'accepted', 'second attempt accepted');
select is((select result from public.submit_abuse_report('report-test','other','Laporan ketiga yang valid.','',repeat('a',64),'30000000-0000-4000-8000-000000000003')), 'accepted', 'third attempt accepted');
select is((select result from public.submit_abuse_report('report-test','other','Laporan keempat yang valid.','',repeat('a',64),'40000000-0000-4000-8000-000000000004')), 'rate_limited', 'fourth attempt is rate limited');

reset role; set local role authenticated;
select set_config('request.jwt.claim.sub','33333333-aaaa-4333-8333-333333333333',true);
select lives_ok($$select public.delete_own_account()$$, 'owner can delete own account');
reset role;
select is((select count(*) from auth.users where id='33333333-aaaa-4333-8333-333333333333'), 0::bigint, 'deleted owner is removed');
select is((select count(*) from public.invitations where slug='report-test'), 0::bigint, 'owned invitation cascades on deletion');
select is((select count(*) from public.abuse_reports where invitation_slug='report-test'), 3::bigint, 'abuse evidence survives invitation deletion');
select is((select count(*) from auth.users where id='44444444-bbbb-4444-8444-444444444444'), 1::bigint, 'other owner remains');

select * from finish();
rollback;
