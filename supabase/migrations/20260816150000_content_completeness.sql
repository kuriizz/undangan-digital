create or replace function public.bump_invitation_draft_revision()
returns trigger language plpgsql set search_path = '' as $$
begin
  if new.draft_content is distinct from old.draft_content then
    new.draft_revision = old.draft_revision + 1;
  elsif new.draft_revision <= old.draft_revision then
    new.draft_revision = old.draft_revision;
  end if;
  return new;
end;
$$;

update public.invitations
set draft_content = jsonb_build_object(
  'schemaVersion', 2,
  'couple', draft_content -> 'couple',
  'content', jsonb_build_object(
    'story', '', 'giftBankName', '', 'giftAccountNumber', '',
    'giftAccountHolder', '', 'closingMessage', '',
    'contactName', '', 'contactPhone', ''
  ),
  'presentation', jsonb_build_object(
    'templateKey', coalesce(draft_content -> 'presentation' ->> 'templateKey', 'modern-minimal'),
    'accent', coalesce(draft_content -> 'presentation' ->> 'accent', 'rose'),
    'typography', coalesce(draft_content -> 'presentation' ->> 'typography', 'elegant'),
    'sections', jsonb_build_array('hero', 'events', 'story', 'gallery', 'map', 'gifts', 'closing')
  )
)
where draft_content ->> 'schemaVersion' = '1';

alter table public.invitations
add constraint invitations_id_owner_unique unique (id, owner_id);

create table public.invitation_media (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  owner_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  storage_path text not null unique,
  mime_type text not null,
  size_bytes integer not null,
  alt_text text not null default '',
  sort_order smallint not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitation_media_kind_valid check (kind in ('cover', 'gallery')),
  constraint invitation_media_type_valid check (mime_type in ('image/jpeg', 'image/png', 'image/webp')),
  constraint invitation_media_size_valid check (size_bytes between 1 and 5242880),
  constraint invitation_media_alt_length check (char_length(alt_text) <= 150),
  constraint invitation_media_sort_order_valid check (sort_order >= 0),
  constraint invitation_media_owner_matches_invitation
    foreign key (invitation_id, owner_id)
    references public.invitations (id, owner_id) on delete cascade
);

create unique index invitation_media_one_cover
on public.invitation_media (invitation_id) where kind = 'cover';
create unique index invitation_media_gallery_order
on public.invitation_media (invitation_id, sort_order) where kind = 'gallery';
create index invitation_media_invitation_id_idx
on public.invitation_media (invitation_id);

create trigger invitation_media_set_updated_at
before update on public.invitation_media
for each row execute function public.set_updated_at();

create function public.enforce_invitation_media_limit()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  perform 1 from public.invitations where id = new.invitation_id for update;
  if new.kind = 'gallery' and (
    select count(*) from public.invitation_media
    where invitation_id = new.invitation_id and kind = 'gallery'
  ) >= 10 then
    raise check_violation using message = 'gallery image limit reached';
  end if;
  return new;
end;
$$;

create trigger invitation_media_enforce_limit
before insert on public.invitation_media
for each row execute function public.enforce_invitation_media_limit();
revoke all on function public.enforce_invitation_media_limit() from public, anon, authenticated;

alter table public.invitation_media enable row level security;
revoke all on table public.invitation_media from public, anon, authenticated;
grant select on table public.invitation_media to authenticated;
grant insert (id, invitation_id, owner_id, kind, storage_path, mime_type, size_bytes, alt_text, sort_order)
on table public.invitation_media to authenticated;
grant update (alt_text, sort_order) on table public.invitation_media to authenticated;
grant delete on table public.invitation_media to authenticated;
grant all on table public.invitation_media to service_role;

create policy invitation_media_select_own on public.invitation_media
for select to authenticated using (owner_id = (select auth.uid()));
create policy invitation_media_insert_own on public.invitation_media
for insert to authenticated with check (
  owner_id = (select auth.uid())
  and exists (
    select 1 from public.invitations
    where invitations.id = invitation_media.invitation_id
      and invitations.owner_id = (select auth.uid())
  )
);
create policy invitation_media_update_own on public.invitation_media
for update to authenticated
using (owner_id = (select auth.uid()))
with check (owner_id = (select auth.uid()));
create policy invitation_media_delete_own on public.invitation_media
for delete to authenticated using (owner_id = (select auth.uid()));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'invitation-media', 'invitation-media', false, 5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

create function public.can_read_invitation_media(p_path text)
returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.invitation_media media
    join public.invitations on invitations.id = media.invitation_id
    where media.storage_path = p_path
      and (
        invitations.owner_id = auth.uid()
        or (
          invitations.status = 'published'
          and exists (
            select 1
            from jsonb_array_elements(invitations.published_content -> 'media') item
            where item ->> 'id' = media.id::text
              and item ->> 'path' = media.storage_path
          )
        )
      )
  );
$$;

revoke all on function public.can_read_invitation_media(text) from public;
grant execute on function public.can_read_invitation_media(text)
to anon, authenticated, service_role;

create function public.get_published_invitation_media(p_media_id uuid)
returns table (storage_path text, mime_type text)
language sql stable security definer set search_path = '' as $$
  select media.storage_path, media.mime_type
  from public.invitation_media media
  join public.invitations on invitations.id = media.invitation_id
  where media.id = p_media_id
    and invitations.status = 'published'
    and exists (
      select 1
      from jsonb_array_elements(invitations.published_content -> 'media') item
      where item ->> 'id' = media.id::text
        and item ->> 'path' = media.storage_path
    );
$$;

revoke all on function public.get_published_invitation_media(uuid) from public;
grant execute on function public.get_published_invitation_media(uuid)
to anon, authenticated, service_role;

create policy invitation_media_objects_authorized_read on storage.objects
for select to anon, authenticated
using (
  bucket_id = 'invitation-media'
  and public.can_read_invitation_media(name)
);
create policy invitation_media_objects_insert_own on storage.objects
for insert to authenticated with check (
  bucket_id = 'invitation-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.invitations
    where invitations.id::text = (storage.foldername(name))[2]
      and invitations.owner_id = (select auth.uid())
  )
);
create policy invitation_media_objects_delete_own on storage.objects
for delete to authenticated using (
  bucket_id = 'invitation-media'
  and (storage.foldername(name))[1] = (select auth.uid())::text
  and exists (
    select 1 from public.invitations
    where invitations.id::text = (storage.foldername(name))[2]
      and invitations.owner_id = (select auth.uid())
  )
);

create function public.touch_invitation_draft()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if tg_table_name = 'invitation_events'
    and current_setting('app.suppress_event_revision', true) = 'true' then
    if tg_op = 'DELETE' then
      return old;
    end if;
    return new;
  end if;
  update public.invitations
  set draft_revision = draft_revision + 1
  where id = case
    when tg_op = 'DELETE' then old.invitation_id
    else new.invitation_id
  end;
  if tg_op = 'DELETE' then
    return old;
  end if;
  return new;
end;
$$;

create trigger invitation_events_touch_draft
after insert or update or delete on public.invitation_events
for each row execute function public.touch_invitation_draft();
create trigger invitation_media_touch_draft
after insert or update or delete on public.invitation_media
for each row execute function public.touch_invitation_draft();
revoke all on function public.touch_invitation_draft() from public, anon, authenticated;

drop function public.create_invitation_draft(text, jsonb, text, timestamptz, text, text, text, text);
drop function public.save_invitation_draft(uuid, text, jsonb, text, timestamptz, text, text, text, text);

create function public.create_invitation_draft(
  p_slug text, p_draft_content jsonb, p_events jsonb
)
returns uuid language plpgsql set search_path = '' as $$
declare invitation_uuid uuid;
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) = 0 then
    raise check_violation using message = 'at least one invitation event is required';
  end if;

  insert into public.invitations (owner_id, slug, draft_content)
  values (auth.uid(), p_slug, p_draft_content)
  returning id into invitation_uuid;

  perform set_config('app.suppress_event_revision', 'true', true);

  insert into public.invitation_events (
    invitation_id, sort_order, event_name, starts_at,
    timezone, venue_name, address, map_url
  )
  select invitation_uuid, event."sortOrder", event.name, event."startsAt",
    event.timezone, event."venueName", event.address, event."mapUrl"
  from jsonb_to_recordset(p_events) as event(
    "sortOrder" smallint, name text, "startsAt" timestamptz,
    timezone text, "venueName" text, address text, "mapUrl" text
  );
  return invitation_uuid;
end;
$$;

create function public.save_invitation_draft(
  p_invitation_id uuid, p_slug text, p_draft_content jsonb, p_events jsonb
)
returns void language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;
  if jsonb_typeof(p_events) <> 'array' or jsonb_array_length(p_events) = 0 then
    raise check_violation using message = 'at least one invitation event is required';
  end if;

  update public.invitations
  set slug = p_slug,
      draft_content = p_draft_content,
      draft_revision = draft_revision + 1
  where id = p_invitation_id and owner_id = auth.uid();
  if not found then
    raise insufficient_privilege using message = 'invitation is not owned by current user';
  end if;

  perform set_config('app.suppress_event_revision', 'true', true);
  delete from public.invitation_events where invitation_id = p_invitation_id;
  insert into public.invitation_events (
    invitation_id, sort_order, event_name, starts_at,
    timezone, venue_name, address, map_url
  )
  select p_invitation_id, event."sortOrder", event.name, event."startsAt",
    event.timezone, event."venueName", event.address, event."mapUrl"
  from jsonb_to_recordset(p_events) as event(
    "sortOrder" smallint, name text, "startsAt" timestamptz,
    timezone text, "venueName" text, address text, "mapUrl" text
  );
end;
$$;

revoke all on function public.create_invitation_draft(text, jsonb, jsonb) from public, anon;
revoke all on function public.save_invitation_draft(uuid, text, jsonb, jsonb) from public, anon;
grant execute on function public.create_invitation_draft(text, jsonb, jsonb) to authenticated, service_role;
grant execute on function public.save_invitation_draft(uuid, text, jsonb, jsonb) to authenticated, service_role;

create function public.create_invitation_draft(
  p_slug text,
  p_draft_content jsonb,
  p_event_name text,
  p_starts_at timestamptz,
  p_timezone text,
  p_venue_name text,
  p_address text,
  p_map_url text
)
returns uuid language sql set search_path = '' as $$
  select public.create_invitation_draft(
    p_slug,
    jsonb_build_object(
      'schemaVersion', 2,
      'couple', p_draft_content -> 'couple',
      'content', jsonb_build_object(
        'story', '', 'giftBankName', '', 'giftAccountNumber', '',
        'giftAccountHolder', '', 'closingMessage', '',
        'contactName', '', 'contactPhone', ''
      ),
      'presentation', jsonb_build_object(
        'templateKey', 'modern-minimal', 'accent', 'rose',
        'typography', 'elegant',
        'sections', jsonb_build_array('hero', 'events')
      )
    ),
    jsonb_build_array(jsonb_build_object(
      'sortOrder', 0, 'name', p_event_name, 'startsAt', p_starts_at,
      'timezone', p_timezone, 'venueName', p_venue_name,
      'address', p_address, 'mapUrl', p_map_url
    ))
  );
$$;

create function public.save_invitation_draft(
  p_invitation_id uuid,
  p_slug text,
  p_draft_content jsonb,
  p_event_name text,
  p_starts_at timestamptz,
  p_timezone text,
  p_venue_name text,
  p_address text,
  p_map_url text
)
returns void language sql set search_path = '' as $$
  select public.save_invitation_draft(
    p_invitation_id,
    p_slug,
    jsonb_build_object(
      'schemaVersion', 2,
      'couple', p_draft_content -> 'couple',
      'content', jsonb_build_object(
        'story', '', 'giftBankName', '', 'giftAccountNumber', '',
        'giftAccountHolder', '', 'closingMessage', '',
        'contactName', '', 'contactPhone', ''
      ),
      'presentation', jsonb_build_object(
        'templateKey', 'modern-minimal', 'accent', 'rose',
        'typography', 'elegant',
        'sections', jsonb_build_array('hero', 'events')
      )
    ),
    jsonb_build_array(jsonb_build_object(
      'sortOrder', 0, 'name', p_event_name, 'startsAt', p_starts_at,
      'timezone', p_timezone, 'venueName', p_venue_name,
      'address', p_address, 'mapUrl', p_map_url
    ))
  );
$$;

revoke all on function public.create_invitation_draft(text, jsonb, text, timestamptz, text, text, text, text)
from public, anon;
revoke all on function public.save_invitation_draft(uuid, text, jsonb, text, timestamptz, text, text, text, text)
from public, anon;
grant execute on function public.create_invitation_draft(text, jsonb, text, timestamptz, text, text, text, text)
to authenticated, service_role;
grant execute on function public.save_invitation_draft(uuid, text, jsonb, text, timestamptz, text, text, text, text)
to authenticated, service_role;

create or replace function public.publish_invitation(
  p_invitation_id uuid, p_expected_revision bigint
)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  invitation_record public.invitations%rowtype;
  events_snapshot jsonb;
  media_snapshot jsonb;
  snapshot jsonb;
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;
  select * into invitation_record from public.invitations
  where id = p_invitation_id and owner_id = auth.uid() for update;
  if not found then
    raise insufficient_privilege using message = 'invitation is not owned by current user';
  end if;
  if invitation_record.draft_revision <> p_expected_revision then
    raise exception using errcode = '40001', message = 'draft revision changed before publish';
  end if;

  select jsonb_agg(jsonb_build_object(
    'name', event_name, 'startsAt', starts_at, 'timezone', timezone,
    'venueName', venue_name, 'address', address, 'mapUrl', map_url
  ) order by sort_order)
  into events_snapshot from public.invitation_events
  where invitation_id = p_invitation_id;
  if events_snapshot is null then
    raise check_violation using message = 'invitation event is required';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', id, 'kind', kind, 'path', storage_path,
    'altText', alt_text, 'sortOrder', sort_order
  ) order by kind, sort_order), '[]'::jsonb)
  into media_snapshot from public.invitation_media
  where invitation_id = p_invitation_id;

  snapshot := invitation_record.draft_content || jsonb_build_object(
    'events', events_snapshot, 'media', media_snapshot
  );
  update public.invitations
  set status = 'published', published_content = snapshot,
      published_revision = invitation_record.draft_revision, published_at = now()
  where id = p_invitation_id;
  return snapshot;
end;
$$;
