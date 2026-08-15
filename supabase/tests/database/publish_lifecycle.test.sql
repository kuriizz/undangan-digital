begin;

select plan(18);

select has_function(
  'public',
  'publish_invitation',
  array['uuid', 'bigint'],
  'atomic publish function exists'
);
select has_function(
  'public',
  'unpublish_invitation',
  array['uuid'],
  'unpublish function exists'
);
select has_function(
  'public',
  'get_published_invitation',
  array['text'],
  'constrained public lookup exists'
);
select ok(
  has_function_privilege(
    'anon',
    'public.get_published_invitation(text)',
    'execute'
  ),
  'anonymous can execute only the published lookup'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.publish_invitation(uuid,bigint)',
    'execute'
  ),
  'anonymous cannot publish'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.unpublish_invitation(uuid)',
    'execute'
  ),
  'anonymous cannot unpublish'
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
    'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'publisher@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Publisher"}',
    now(),
    now()
  ),
  (
    'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'other-publisher@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Other Publisher"}',
    now(),
    now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  true
);
select lives_ok(
  $$
    select public.create_invitation_draft(
      'publish-test',
      '{"schemaVersion":1,"couple":{"partnerOneName":"Ayu","partnerTwoName":"Bima"},"presentation":{"templateKey":"modern-minimal","accent":"rose","typography":"elegant","sections":["hero","event"]}}'::jsonb,
      'Akad nikah',
      '2027-01-10 02:30:00+00'::timestamptz,
      'Asia/Jakarta',
      'Gedung Bahagia',
      'Jakarta Selatan',
      null
    )
  $$,
  'owner creates a complete draft'
);

reset role;
set local role anon;
select is_empty(
  $$ select * from public.get_published_invitation('publish-test') $$,
  'draft invitation is unavailable through the public lookup'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  true
);
select lives_ok(
  $$
    select public.publish_invitation(
      (select id from public.invitations where slug = 'publish-test'),
      1
    )
  $$,
  'owner publishes the validated revision atomically'
);

reset role;
select is(
  (select status from public.invitations where slug = 'publish-test'),
  'published',
  'publish changes lifecycle status'
);
select is(
  (
    select published_content -> 'event' ->> 'venueName'
    from public.invitations
    where slug = 'publish-test'
  ),
  'Gedung Bahagia',
  'snapshot includes the relational event'
);
select is(
  (select published_revision from public.invitations where slug = 'publish-test'),
  1::bigint,
  'snapshot records the expected draft revision'
);

set local role anon;
select isnt_empty(
  $$ select * from public.get_published_invitation('publish-test') $$,
  'anonymous can read a published snapshot'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  true
);
select throws_ok(
  $$
    select public.publish_invitation(
      (select id from public.invitations where slug = 'publish-test'),
      1
    )
  $$,
  '42501',
  'invitation is not owned by current user',
  'another owner cannot publish the invitation'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  true
);
select lives_ok(
  $$
    select public.unpublish_invitation(
      (select id from public.invitations where slug = 'publish-test')
    )
  $$,
  'owner can unpublish the invitation'
);

reset role;
select is(
  (
    select published_content -> 'couple' ->> 'partnerOneName'
    from public.invitations
    where slug = 'publish-test'
  ),
  'Ayu',
  'unpublishing retains the last snapshot'
);
select is(
  (select status from public.invitations where slug = 'publish-test'),
  'unpublished',
  'unpublish changes lifecycle status'
);

set local role anon;
select is_empty(
  $$ select * from public.get_published_invitation('publish-test') $$,
  'unpublished invitation is no longer publicly available'
);

select * from finish();
rollback;
