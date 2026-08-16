begin;

select plan(29);

select has_table('public', 'invitation_media', 'invitation media table exists');
select has_function(
  'public', 'create_invitation_draft', array['text', 'jsonb', 'jsonb'],
  'multi-event draft creation function exists'
);
select has_function(
  'public', 'save_invitation_draft', array['uuid', 'text', 'jsonb', 'jsonb'],
  'multi-event draft save function exists'
);
select has_function(
  'public', 'get_published_invitation_media', array['uuid'],
  'constrained published media lookup exists'
);
select is(
  (select relrowsecurity from pg_class where oid = 'public.invitation_media'::regclass),
  true,
  'invitation media has RLS enabled'
);
select ok(
  not has_table_privilege('anon', 'public.invitation_media', 'select'),
  'anonymous cannot select media metadata'
);
select ok(
  has_table_privilege('authenticated', 'public.invitation_media', 'select'),
  'authenticated owners can select media metadata through RLS'
);
select ok(
  has_column_privilege('authenticated', 'public.invitation_media', 'id', 'insert'),
  'authenticated owners can insert media metadata through RLS'
);
select ok(
  has_table_privilege('authenticated', 'public.invitation_media', 'delete'),
  'authenticated owners can delete media metadata through RLS'
);
select is(
  (select public from storage.buckets where id = 'invitation-media'),
  false,
  'invitation media bucket remains private'
);
select is(
  (select file_size_limit from storage.buckets where id = 'invitation-media'),
  5242880::bigint,
  'bucket enforces the 5 MB limit'
);
select is(
  (select cardinality(allowed_mime_types) from storage.buckets where id = 'invitation-media'),
  3,
  'bucket allows only the three approved image MIME types'
);
select is(
  (select count(*)::integer from pg_policies where schemaname = 'storage'
    and tablename = 'objects' and policyname like 'invitation_media_objects_%'),
  3,
  'storage objects have explicit read, insert, and delete policies'
);

insert into auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
)
values
  (
    '11111111-1111-4111-8111-111111111111',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'content-a@example.test', '', now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Content Owner A"}', now(), now()
  ),
  (
    '22222222-2222-4222-8222-222222222222',
    '00000000-0000-0000-0000-000000000000',
    'authenticated', 'authenticated', 'content-b@example.test', '', now(),
    '{"provider":"email","providers":["email"]}',
    '{"display_name":"Content Owner B"}', now(), now()
  );

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select lives_ok(
  $$
    select public.create_invitation_draft(
      'content-owner-a',
      '{"schemaVersion":2,"couple":{"partnerOneName":"Ayu","partnerTwoName":"Bima"},"content":{"story":"Cerita","giftBankName":"Bank","giftAccountNumber":"123","giftAccountHolder":"Ayu","closingMessage":"Terima kasih","contactName":"Bima","contactPhone":"+62812"},"presentation":{"templateKey":"modern-minimal","accent":"rose","typography":"elegant","sections":["hero","events","story"]}}'::jsonb,
      '[{"sortOrder":0,"name":"Akad","startsAt":"2027-01-10T02:00:00Z","timezone":"Asia/Jakarta","venueName":"Gedung","address":"Jakarta","mapUrl":null},{"sortOrder":1,"name":"Resepsi","startsAt":"2027-01-10T05:00:00Z","timezone":"Asia/Jakarta","venueName":"Gedung","address":"Jakarta","mapUrl":null}]'::jsonb
    )
  $$,
  'owner A creates a draft with two events'
);
select is(
  (select count(*) from public.invitation_events),
  2::bigint,
  'both relational events are stored'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select lives_ok(
  $$
    select public.create_invitation_draft(
      'content-owner-b',
      '{"schemaVersion":2,"couple":{"partnerOneName":"Citra","partnerTwoName":"Dani"},"content":{"story":"","giftBankName":"","giftAccountNumber":"","giftAccountHolder":"","closingMessage":"","contactName":"","contactPhone":""},"presentation":{"templateKey":"modern-minimal","accent":"sage","typography":"modern","sections":["hero","events"]}}'::jsonb,
      '[{"sortOrder":0,"name":"Akad","startsAt":"2027-02-10T02:00:00Z","timezone":"Asia/Jakarta","venueName":"Aula","address":"Bandung","mapUrl":null}]'::jsonb
    )
  $$,
  'owner B creates a separate draft'
);

reset role;
create temporary table content_test_ids as
select slug, id from public.invitations where slug like 'content-owner-%';
grant select on table content_test_ids to authenticated;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select lives_ok(
  $$
    insert into public.invitation_media (
      invitation_id, owner_id, kind, storage_path, mime_type,
      size_bytes, alt_text, sort_order
    )
    values
      ((select id from pg_temp.content_test_ids where slug = 'content-owner-a'),
       '11111111-1111-4111-8111-111111111111', 'cover',
       '11111111-1111-4111-8111-111111111111/cover.jpg', 'image/jpeg', 1000, 'Sampul', 0),
      ((select id from pg_temp.content_test_ids where slug = 'content-owner-a'),
       '11111111-1111-4111-8111-111111111111', 'gallery',
       '11111111-1111-4111-8111-111111111111/gallery-0.jpg', 'image/jpeg', 1000, 'Galeri', 0)
  $$,
  'owner A stores cover and gallery metadata'
);
select is(
  (select count(*) from public.invitation_media),
  2::bigint,
  'owner A sees their two media rows'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '22222222-2222-4222-8222-222222222222', true);
select is(
  (select count(*) from public.invitation_media),
  0::bigint,
  'owner B cannot see owner A media'
);
select throws_ok(
  $$
    insert into public.invitation_media (
      invitation_id, owner_id, kind, storage_path, mime_type, size_bytes, sort_order
    ) values (
      (select id from pg_temp.content_test_ids where slug = 'content-owner-a'),
      '22222222-2222-4222-8222-222222222222', 'gallery',
      '22222222-2222-4222-8222-222222222222/foreign.jpg', 'image/jpeg', 1000, 1
    )
  $$,
  '42501',
  'new row violates row-level security policy for table "invitation_media"',
  'owner B cannot attach media to owner A invitation'
);

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select throws_ok(
  $$
    insert into public.invitation_media (
      invitation_id, owner_id, kind, storage_path, mime_type, size_bytes, sort_order
    ) values (
      (select id from pg_temp.content_test_ids where slug = 'content-owner-a'),
      '11111111-1111-4111-8111-111111111111', 'cover',
      '11111111-1111-4111-8111-111111111111/cover-2.jpg', 'image/jpeg', 1000, 0
    )
  $$,
  '23505',
  null,
  'only one cover image is allowed'
);
select lives_ok(
  $$
    insert into public.invitation_media (
      invitation_id, owner_id, kind, storage_path, mime_type, size_bytes, sort_order
    )
    select
      (select id from pg_temp.content_test_ids where slug = 'content-owner-a'),
      '11111111-1111-4111-8111-111111111111', 'gallery',
      '11111111-1111-4111-8111-111111111111/gallery-' || series || '.jpg',
      'image/jpeg', 1000, series
    from generate_series(1, 9) as series
  $$,
  'owner can fill the gallery to ten images'
);
select throws_ok(
  $$
    insert into public.invitation_media (
      invitation_id, owner_id, kind, storage_path, mime_type, size_bytes, sort_order
    ) values (
      (select id from pg_temp.content_test_ids where slug = 'content-owner-a'),
      '11111111-1111-4111-8111-111111111111', 'gallery',
      '11111111-1111-4111-8111-111111111111/gallery-10.jpg', 'image/jpeg', 1000, 10
    )
  $$,
  '23514',
  'gallery image limit reached',
  'an eleventh gallery image is rejected'
);
select lives_ok(
  $$
    delete from public.invitation_media
    where invitation_id = (select id from pg_temp.content_test_ids where slug = 'content-owner-a')
      and kind = 'cover'
  $$,
  'owner can delete their cover metadata'
);
select is(
  (select draft_revision from public.invitations where slug = 'content-owner-a'),
  13::bigint,
  'media insertions and deletion advance the draft revision'
);
select is(
  (
    select count(*)
    from public.get_published_invitation_media(
      (select id from public.invitation_media where kind = 'gallery' limit 1)
    )
  ),
  0::bigint,
  'draft media is unavailable through the public lookup'
);
select lives_ok(
  $$
    select public.publish_invitation(
      (select id from pg_temp.content_test_ids where slug = 'content-owner-a'),
      13
    )
  $$,
  'owner publishes the snapshot containing gallery media'
);
select is(
  (
    select count(*)
    from public.get_published_invitation_media(
      (select id from public.invitation_media where kind = 'gallery' limit 1)
    )
  ),
  1::bigint,
  'published media is available through the constrained lookup'
);

reset role;
set local role anon;
select throws_ok(
  'select * from public.invitation_media',
  '42501',
  'permission denied for table invitation_media',
  'anonymous cannot read tenant media metadata'
);

select * from finish();
rollback;
