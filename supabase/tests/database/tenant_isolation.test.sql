begin;

select plan(23);

select has_table('public', 'profiles', 'profiles table exists');
select has_table('public', 'invitations', 'invitations table exists');
select has_function(
  'public',
  'handle_new_user',
  array[]::text[],
  'profile provisioning function exists'
);
select has_trigger(
  'auth',
  'users',
  'on_auth_user_created',
  'auth signup provisions a profile'
);

select is(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  true,
  'profiles has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.invitations'::regclass),
  true,
  'invitations has RLS enabled'
);

select ok(
  not has_table_privilege('anon', 'public.profiles', 'select'),
  'anon cannot select profiles'
);
select ok(
  not has_table_privilege('anon', 'public.invitations', 'select'),
  'anon cannot select invitations'
);
select ok(
  has_table_privilege('authenticated', 'public.profiles', 'select'),
  'authenticated can select profiles through RLS'
);
select ok(
  has_table_privilege('authenticated', 'public.invitations', 'select'),
  'authenticated can select invitations through RLS'
);
select ok(
  has_table_privilege('service_role', 'public.profiles', 'select'),
  'service_role can select profiles'
);
select ok(
  has_table_privilege('service_role', 'public.invitations', 'select'),
  'service_role can select invitations'
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
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner-a@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Owner A"}',
    now(),
    now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'owner-b@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Owner B"}',
    now(),
    now()
  );

select is(
  (
    select count(*)
    from public.profiles
    where id in (
      '11111111-1111-4111-8111-111111111111',
      '22222222-2222-4222-8222-222222222222'
    )
  ),
  2::bigint,
  'auth users automatically receive profiles'
);
select is(
  (
    select display_name
    from public.profiles
    where id = '11111111-1111-4111-8111-111111111111'
  ),
  'Owner A',
  'profile uses the validated signup display name'
);

insert into public.invitations (owner_id)
values ('11111111-1111-4111-8111-111111111111');

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111',
  true
);

select is(
  (select count(*) from public.profiles),
  1::bigint,
  'owner A sees only their profile'
);
select is(
  (select count(*) from public.invitations),
  1::bigint,
  'owner A sees only their invitation'
);

select throws_ok(
  $$
    insert into public.invitations (owner_id)
    values ('22222222-2222-4222-8222-222222222222')
  $$,
  '42501',
  'new row violates row-level security policy for table "invitations"',
  'owner A cannot create an invitation for owner B'
);

reset role;
insert into public.invitations (owner_id)
values ('22222222-2222-4222-8222-222222222222');

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  '11111111-1111-4111-8111-111111111111',
  true
);

select is_empty(
  $$
    update public.invitations
    set draft_content = '{"schemaVersion": 1, "changed": true}'::jsonb
    where owner_id = '22222222-2222-4222-8222-222222222222'
    returning id
  $$,
  'owner A cannot update owner B invitation'
);

select is_empty(
  $$
    delete from public.invitations
    where owner_id = '22222222-2222-4222-8222-222222222222'
    returning id
  $$,
  'owner A cannot delete owner B invitation'
);

select isnt_empty(
  $$
    update public.invitations
    set draft_content = '{"schemaVersion": 1, "changed": true}'::jsonb
    where owner_id = '11111111-1111-4111-8111-111111111111'
    returning id
  $$,
  'owner A can update their own draft'
);

select is(
  (
    select draft_revision
    from public.invitations
    where owner_id = '11111111-1111-4111-8111-111111111111'
  ),
  2::bigint,
  'draft revision increments in the database'
);

select throws_ok(
  $$
    insert into public.invitations (owner_id)
    values ('11111111-1111-4111-8111-111111111111')
  $$,
  '23505',
  'duplicate key value violates unique constraint "invitations_one_per_owner"',
  'one invitation per owner is enforced'
);

select throws_ok(
  $$
    update public.invitations
    set status = 'published'
    where owner_id = '11111111-1111-4111-8111-111111111111'
  $$,
  '42501',
  'permission denied for table invitations',
  'authenticated owners cannot bypass the future publish operation'
);

select * from finish();
rollback;
