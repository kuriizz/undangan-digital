begin;

select plan(27);

select has_table(
  'public',
  'invitation_events',
  'invitation events table exists'
);
select has_table(
  'public',
  'invitation_slug_claims',
  'permanent slug registry exists'
);
select has_function(
  'public',
  'create_invitation_draft',
  array['text', 'jsonb', 'text', 'timestamp with time zone', 'text', 'text', 'text', 'text'],
  'atomic draft creation function exists'
);
select has_function(
  'public',
  'save_invitation_draft',
  array['uuid', 'text', 'jsonb', 'text', 'timestamp with time zone', 'text', 'text', 'text', 'text'],
  'atomic draft save function exists'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.invitation_events'::regclass),
  true,
  'invitation events has RLS enabled'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.invitation_slug_claims'::regclass),
  true,
  'slug registry has RLS enabled'
);
select ok(
  not has_table_privilege('anon', 'public.invitation_events', 'select'),
  'anonymous cannot select draft events'
);
select ok(
  has_table_privilege('authenticated', 'public.invitation_events', 'select'),
  'authenticated owners can select draft events through RLS'
);
select ok(
  not has_table_privilege('authenticated', 'public.invitation_slug_claims', 'select'),
  'owners cannot inspect the slug registry'
);
select ok(
  not has_function_privilege(
    'anon',
    'public.create_invitation_draft(text,jsonb,text,timestamptz,text,text,text,text)',
    'execute'
  ),
  'anonymous cannot execute draft creation'
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
    'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'draft-a@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Draft Owner A"}',
    now(),
    now()
  ),
  (
    'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'draft-b@example.test',
    '',
    now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Draft Owner B"}',
    now(),
    now()
  );

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  true
);

select lives_ok(
  $$
    select public.create_invitation_draft(
      'ayu-bima',
      '{"schemaVersion":1,"couple":{"partnerOneName":"Ayu","partnerTwoName":"Bima"}}'::jsonb,
      'Akad nikah',
      '2027-01-10 02:00:00+00'::timestamptz,
      'Asia/Jakarta',
      'Gedung Bahagia',
      'Jakarta',
      null
    )
  $$,
  'owner A can create an atomic invitation draft'
);
select is(
  (select count(*) from public.invitations),
  1::bigint,
  'owner A sees the one invitation they created'
);
select is(
  (select slug from public.invitations),
  'ayu-bima',
  'draft stores the selected slug'
);
select is(
  (select count(*) from public.invitation_events),
  1::bigint,
  'draft creation stores the first event'
);
select throws_ok(
  $$
    select public.create_invitation_draft(
      'ayu-bima-lagi',
      '{"schemaVersion":1,"couple":{"partnerOneName":"Ayu","partnerTwoName":"Bima"}}'::jsonb,
      'Resepsi',
      '2027-01-10 05:00:00+00'::timestamptz,
      'Asia/Jakarta',
      'Gedung Bahagia',
      'Jakarta',
      null
    )
  $$,
  '23505',
  'duplicate key value violates unique constraint "invitations_one_per_owner"',
  'one invitation per owner remains enforced through the RPC'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  true
);
select lives_ok(
  $$
    select public.create_invitation_draft(
      'citra-dani',
      '{"schemaVersion":1,"couple":{"partnerOneName":"Citra","partnerTwoName":"Dani"}}'::jsonb,
      'Pemberkatan',
      '2027-02-20 01:00:00+00'::timestamptz,
      'Asia/Makassar',
      'Aula Damai',
      'Makassar',
      'https://maps.example.test/aula'
    )
  $$,
  'owner B can create a separate draft'
);

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  true
);
select is(
  (select count(*) from public.invitation_events),
  1::bigint,
  'owner A sees only their own event'
);
select is_empty(
  $$
    update public.invitation_events
    set venue_name = 'Lokasi disusupi'
    where invitation_id = (
      select id from public.invitations where slug = 'citra-dani'
    )
    returning id
  $$,
  'owner A cannot update owner B event'
);
select throws_ok(
  $$
    insert into public.invitation_events (
      invitation_id,
      sort_order,
      event_name,
      starts_at,
      timezone,
      venue_name,
      address
    )
    values (
      (select id from public.invitations where slug = 'citra-dani'),
      1,
      'Acara asing',
      now(),
      'Asia/Jakarta',
      'Lokasi asing',
      'Alamat asing'
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "invitation_events"',
  'owner A cannot insert an event into owner B invitation'
);
select lives_ok(
  $$
    select public.save_invitation_draft(
      (select id from public.invitations where slug = 'ayu-bima'),
      'ayu-bima-baru',
      '{"schemaVersion":1,"couple":{"partnerOneName":"Ayu","partnerTwoName":"Bima Baru"}}'::jsonb,
      'Akad dan resepsi',
      '2027-01-10 03:00:00+00'::timestamptz,
      'Asia/Jakarta',
      'Gedung Bahagia Baru',
      'Jakarta Selatan',
      null
    )
  $$,
  'owner A can update their invitation and event atomically'
);
select is(
  (select draft_revision from public.invitations),
  2::bigint,
  'saving changed content increments the draft revision'
);
select is(
  (select venue_name from public.invitation_events),
  'Gedung Bahagia Baru',
  'saving updates the owner event'
);

reset role;
select is(
  (select count(*) from public.invitation_slug_claims where slug in ('ayu-bima', 'ayu-bima-baru')),
  2::bigint,
  'both current and former slugs remain claimed'
);

set local role authenticated;
select set_config(
  'request.jwt.claim.sub',
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  true
);
select throws_ok(
  $$
    select public.save_invitation_draft(
      (select id from public.invitations where slug = 'citra-dani'),
      'ayu-bima',
      '{"schemaVersion":1,"couple":{"partnerOneName":"Citra","partnerTwoName":"Dani"}}'::jsonb,
      'Pemberkatan',
      '2027-02-20 01:00:00+00'::timestamptz,
      'Asia/Makassar',
      'Aula Damai',
      'Makassar',
      null
    )
  $$,
  '23505',
  'invitation slug has already been claimed',
  'a former slug cannot be claimed by another invitation'
);

reset role;
select throws_ok(
  $$
    insert into public.invitations (owner_id, slug)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'admin')
  $$,
  '23514',
  null,
  'reserved slugs are rejected by the database'
);
select throws_ok(
  $$
    insert into public.invitations (owner_id, slug)
    values ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'Tidak Valid')
  $$,
  '23514',
  null,
  'malformed slugs are rejected by the database'
);

set local role anon;
select throws_ok(
  'select * from public.invitation_events',
  '42501',
  'permission denied for table invitation_events',
  'anonymous cannot read event rows'
);

select * from finish();
rollback;
