begin;
select plan(19);

select has_table('public', 'guests', 'guests table exists');
select has_table('public', 'wishes', 'wishes table exists');
select ok((select relrowsecurity from pg_class where oid = 'public.guests'::regclass), 'guests has RLS');
select ok((select relrowsecurity from pg_class where oid = 'public.wishes'::regclass), 'wishes has RLS');
select ok(not has_table_privilege('anon', 'public.guests', 'select'), 'anon cannot list guests');
select ok(not has_table_privilege('anon', 'public.wishes', 'select'), 'anon cannot list wishes');

insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
('11111111-aaaa-4111-8111-111111111111','00000000-0000-0000-0000-000000000000','authenticated','authenticated','guest-owner@example.test','',now(),'{}','{}',now(),now()),
('22222222-bbbb-4222-8222-222222222222','00000000-0000-0000-0000-000000000000','authenticated','authenticated','guest-other@example.test','',now(),'{}','{}',now(),now());

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-aaaa-4111-8111-111111111111',true);
select lives_ok($$select public.create_invitation_draft('guest-test','{"schemaVersion":1,"couple":{"partnerOneName":"Ayu","partnerTwoName":"Bima"},"presentation":{"templateKey":"modern-minimal","accent":"rose","typography":"elegant","sections":["hero","event"]}}'::jsonb,'Akad','2027-01-10 02:30+00','Asia/Jakarta','Gedung','Jakarta',null)$$, 'owner creates invitation');
insert into public.guests (invitation_id, owner_id, name, party_limit, token_hash)
select id, owner_id, 'Tamu Personal', 2, encode(extensions.digest('secret-token','sha256'),'hex') from public.invitations where slug='guest-test';
select is((select count(*) from public.guests), 1::bigint, 'owner creates guest');
select lives_ok($$select public.publish_invitation((select id from public.invitations where slug='guest-test'),1)$$, 'invitation published');

reset role; set local role anon;
select is((select guest_name from public.get_personalized_guest('guest-test','secret-token')), 'Tamu Personal', 'valid token personalizes greeting');
select is((select count(*) from public.get_personalized_guest('guest-test','wrong')), 0::bigint, 'invalid token reveals nothing');
select is((select result from public.submit_public_rsvp('guest-test','ignored','attending',2::smallint,'','Selamat!','secret-token','aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid,repeat('d',64))), 'accepted', 'personal RSVP accepted');
select is((select result from public.submit_public_rsvp('guest-test','ignored','attending',3::smallint,'','','secret-token','bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::uuid,repeat('e',64))), 'party_limit_exceeded', 'personal party limit enforced');
reset role;
select is((select count(*) from public.rsvps where guest_id is not null), 1::bigint, 'personal guest has one RSVP');
select is((select status from public.wishes), 'pending', 'wish starts pending');

set local role authenticated;
select set_config('request.jwt.claim.sub','22222222-bbbb-4222-8222-222222222222',true);
select is((select count(*) from public.guests), 0::bigint, 'other owner cannot see guests');
select is((select count(*) from public.wishes), 0::bigint, 'other owner cannot see wishes');
reset role;
select is((select count(*) from public.get_public_wishes('guest-test')), 0::bigint, 'pending wish is not public');

set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-aaaa-4111-8111-111111111111',true);
update public.wishes set status='approved';
reset role; set local role anon;
select is((select message from public.get_public_wishes('guest-test')), 'Selamat!', 'approved wish is public');

select * from finish();
rollback;
