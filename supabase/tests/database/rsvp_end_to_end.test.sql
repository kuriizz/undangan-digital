begin;

select plan(22);

select has_table('public', 'rsvps', 'RSVP table exists');
select has_table('public', 'rsvp_rate_limits', 'RSVP rate-limit table exists');
select is(
  (select relrowsecurity from pg_class where oid = 'public.rsvps'::regclass),
  true,
  'RSVP table has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.rsvp_rate_limits'::regclass),
  true,
  'rate-limit table has RLS enabled'
);
select ok(
  not has_table_privilege('anon', 'public.rsvps', 'select'),
  'anonymous cannot select RSVP rows directly'
);
select ok(
  has_table_privilege('authenticated', 'public.rsvps', 'select'),
  'owners can select RSVP rows through RLS'
);
select ok(
  has_function_privilege(
    'anon',
    'public.submit_public_rsvp(text,text,text,smallint,text,uuid,text)',
    'execute'
  ),
  'anonymous can execute the constrained RSVP function'
);

insert into auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
values
  (
    'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rsvp-owner@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"RSVP Owner"}',
    now(),
    now()
  ),
  (
    'ffffffff-ffff-4fff-8fff-ffffffffffff',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'rsvp-other@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"RSVP Other"}',
    now(),
    now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', true);
select lives_ok(
  $$
    select public.create_invitation_draft(
      'rsvp-test',
      '{"schemaVersion":1,"couple":{"partnerOneName":"Ayu","partnerTwoName":"Bima"},"presentation":{"templateKey":"modern-minimal","accent":"rose","typography":"elegant","sections":["hero","event"]}}'::jsonb,
      'Akad nikah',
      '2027-01-10 02:30:00+00'::timestamptz,
      'Asia/Jakarta',
      'Gedung Bahagia',
      'Jakarta Selatan',
      null
    )
  $$,
  'owner creates the RSVP invitation'
);
select lives_ok(
  $$
    select public.publish_invitation(
      (select id from public.invitations where slug = 'rsvp-test'),
      1
    )
  $$,
  'owner publishes before accepting RSVP'
);

reset role;
set local role anon;
select is(
  (
    select result
    from public.submit_public_rsvp(
      'rsvp-test', 'Tamu Satu', 'attending', 2::smallint, 'Hadir',
      '10000000-0000-4000-8000-000000000001', repeat('a', 64)
    )
  ),
  'accepted',
  'anonymous submits a valid RSVP'
);
reset role;
select is(
  (
    select count(*)
    from public.rsvps
    where invitation_id = (select id from public.invitations where slug = 'rsvp-test')
  ),
  1::bigint,
  'valid RSVP is stored once'
);

set local role anon;
select is(
  (
    select result
    from public.submit_public_rsvp(
      'rsvp-test', 'Nama Berubah', 'attending', 4::smallint, '',
      '10000000-0000-4000-8000-000000000001', repeat('a', 64)
    )
  ),
  'accepted',
  'an idempotent retry returns success'
);
reset role;
select is(
  (
    select count(*)
    from public.rsvps
    where invitation_id = (select id from public.invitations where slug = 'rsvp-test')
  ),
  1::bigint,
  'idempotent retry creates no duplicate'
);

set local role anon;
select is(
  (
    select result
    from public.submit_public_rsvp(
      'rsvp-test', 'Tamu Dua', 'not_attending', 0::smallint, null,
      '10000000-0000-4000-8000-000000000002', repeat('a', 64)
    )
  ),
  'accepted',
  'not-attending RSVP is accepted with zero party size'
);
reset role;
select is(
  (select party_size from public.rsvps where name = 'Tamu Dua'),
  0::smallint,
  'not-attending response stores zero party size'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', true);
select is((select count(*) from public.rsvps), 2::bigint, 'owner sees their RSVP rows');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', 'ffffffff-ffff-4fff-8fff-ffffffffffff', true);
select is((select count(*) from public.rsvps), 0::bigint, 'another owner sees no RSVP rows');

reset role;
set local role anon;
select is(
  (
    with submissions(idempotency_key) as (
      values
        ('20000000-0000-4000-8000-000000000001'::uuid),
        ('20000000-0000-4000-8000-000000000002'::uuid),
        ('20000000-0000-4000-8000-000000000003'::uuid),
        ('20000000-0000-4000-8000-000000000004'::uuid),
        ('20000000-0000-4000-8000-000000000005'::uuid),
        ('20000000-0000-4000-8000-000000000006'::uuid)
    )
    select array_agg(response.result)
    from submissions
    cross join lateral public.submit_public_rsvp(
      'rsvp-test', 'Rate Test', 'attending', 1::smallint, '',
      submissions.idempotency_key, repeat('b', 64)
    ) response
  ),
  array['accepted', 'accepted', 'accepted', 'accepted', 'accepted', 'rate_limited']::text[],
  'sixth request in a ten-minute window is rate limited'
);
reset role;
select is(
  (
    select count(*)
    from public.rsvps
    where invitation_id = (select id from public.invitations where slug = 'rsvp-test')
  ),
  7::bigint,
  'rate-limited request is not stored'
);

set local role authenticated;
select set_config('request.jwt.claim.sub', 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', true);
select lives_ok(
  $$
    select public.unpublish_invitation(
      (select id from public.invitations where slug = 'rsvp-test')
    )
  $$,
  'owner unpublishes the invitation'
);

reset role;
set local role anon;
select is(
  (
    select result
    from public.submit_public_rsvp(
      'rsvp-test', 'Terlambat', 'attending', 1::smallint, '',
      '30000000-0000-4000-8000-000000000001', repeat('c', 64)
    )
  ),
  'unavailable',
  'unpublished invitation rejects RSVP'
);
reset role;
select is(
  (
    select count(*)
    from public.rsvps
    where invitation_id = (select id from public.invitations where slug = 'rsvp-test')
  ),
  7::bigint,
  'rejected RSVP is not stored'
);

select * from finish();
rollback;
