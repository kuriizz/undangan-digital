alter table public.invitations
add column slug text
default ('draft-' || replace(gen_random_uuid()::text, '-', ''));

alter table public.invitations
alter column slug set not null;

alter table public.invitations
add constraint invitations_slug_format
check (slug ~ '^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$'),
add constraint invitations_slug_not_reserved
check (
  slug not in (
    'admin',
    'api',
    'dashboard',
    'help',
    'i',
    'login',
    'privacy',
    'register',
    'support',
    'terms',
    'www'
  )
),
add constraint invitations_slug_unique unique (slug);

comment on column public.invitations.slug is
  'Unique public identifier. Previous values remain permanently claimed.';

create table public.invitation_slug_claims (
  slug text primary key,
  invitation_id uuid references public.invitations (id) on delete set null,
  owner_id uuid not null,
  claimed_at timestamptz not null default now(),
  constraint invitation_slug_claims_slug_format
    check (slug ~ '^[a-z0-9][a-z0-9-]{1,58}[a-z0-9]$')
);

comment on table public.invitation_slug_claims is
  'Permanent slug ownership registry. Rows remain after invitations are deleted.';

insert into public.invitation_slug_claims (slug, invitation_id, owner_id)
select slug, id, owner_id
from public.invitations;

create function public.claim_invitation_slug()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed_rows integer;
begin
  insert into public.invitation_slug_claims (slug, invitation_id, owner_id)
  values (new.slug, new.id, new.owner_id)
  on conflict (slug) do update
  set invitation_id = excluded.invitation_id
  where public.invitation_slug_claims.invitation_id = excluded.invitation_id
    and public.invitation_slug_claims.owner_id = excluded.owner_id;

  get diagnostics claimed_rows = row_count;

  if claimed_rows = 0 then
    raise unique_violation using message = 'invitation slug has already been claimed';
  end if;

  return new;
end;
$$;

create trigger invitations_claim_slug
after insert or update of slug on public.invitations
for each row execute function public.claim_invitation_slug();

create table public.invitation_events (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  sort_order smallint not null default 0,
  event_name text not null,
  starts_at timestamptz not null,
  timezone text not null,
  venue_name text not null,
  address text not null,
  map_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitation_events_slot_unique unique (invitation_id, sort_order),
  constraint invitation_events_sort_order_valid check (sort_order >= 0),
  constraint invitation_events_name_length
    check (char_length(btrim(event_name)) between 1 and 100),
  constraint invitation_events_venue_length
    check (char_length(btrim(venue_name)) between 1 and 150),
  constraint invitation_events_address_length
    check (char_length(btrim(address)) between 1 and 500),
  constraint invitation_events_timezone_length
    check (char_length(btrim(timezone)) between 1 and 100),
  constraint invitation_events_map_url_length
    check (map_url is null or char_length(map_url) <= 2048)
);

create index invitation_events_invitation_id_idx
on public.invitation_events (invitation_id);

create trigger invitation_events_set_updated_at
before update on public.invitation_events
for each row execute function public.set_updated_at();

alter table public.invitation_slug_claims enable row level security;
alter table public.invitation_events enable row level security;

revoke all on table public.invitation_slug_claims from public, anon, authenticated;
revoke all on table public.invitation_events from public, anon, authenticated;

grant select on table public.invitation_events to authenticated;
grant insert (
  invitation_id,
  sort_order,
  event_name,
  starts_at,
  timezone,
  venue_name,
  address,
  map_url
) on table public.invitation_events to authenticated;
grant update (
  event_name,
  starts_at,
  timezone,
  venue_name,
  address,
  map_url
) on table public.invitation_events to authenticated;
grant delete on table public.invitation_events to authenticated;

grant all on table public.invitation_slug_claims to service_role;
grant all on table public.invitation_events to service_role;

grant insert (slug) on table public.invitations to authenticated;
grant update (slug) on table public.invitations to authenticated;

create policy invitation_events_select_own
on public.invitation_events
for select
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = invitation_events.invitation_id
      and invitations.owner_id = (select auth.uid())
  )
);

create policy invitation_events_insert_own
on public.invitation_events
for insert
to authenticated
with check (
  exists (
    select 1
    from public.invitations
    where invitations.id = invitation_events.invitation_id
      and invitations.owner_id = (select auth.uid())
  )
);

create policy invitation_events_update_own
on public.invitation_events
for update
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = invitation_events.invitation_id
      and invitations.owner_id = (select auth.uid())
  )
)
with check (
  exists (
    select 1
    from public.invitations
    where invitations.id = invitation_events.invitation_id
      and invitations.owner_id = (select auth.uid())
  )
);

create policy invitation_events_delete_own
on public.invitation_events
for delete
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = invitation_events.invitation_id
      and invitations.owner_id = (select auth.uid())
  )
);

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
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  invitation_uuid uuid;
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;

  insert into public.invitations (owner_id, slug, draft_content)
  values (auth.uid(), p_slug, p_draft_content)
  returning id into invitation_uuid;

  insert into public.invitation_events (
    invitation_id,
    sort_order,
    event_name,
    starts_at,
    timezone,
    venue_name,
    address,
    map_url
  )
  values (
    invitation_uuid,
    0,
    p_event_name,
    p_starts_at,
    p_timezone,
    p_venue_name,
    p_address,
    p_map_url
  );

  return invitation_uuid;
end;
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
returns void
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;

  update public.invitations
  set slug = p_slug,
      draft_content = p_draft_content
  where id = p_invitation_id
    and owner_id = auth.uid();

  if not found then
    raise insufficient_privilege using message = 'invitation is not owned by current user';
  end if;

  insert into public.invitation_events (
    invitation_id,
    sort_order,
    event_name,
    starts_at,
    timezone,
    venue_name,
    address,
    map_url
  )
  values (
    p_invitation_id,
    0,
    p_event_name,
    p_starts_at,
    p_timezone,
    p_venue_name,
    p_address,
    p_map_url
  )
  on conflict (invitation_id, sort_order) do update
  set event_name = excluded.event_name,
      starts_at = excluded.starts_at,
      timezone = excluded.timezone,
      venue_name = excluded.venue_name,
      address = excluded.address,
      map_url = excluded.map_url;
end;
$$;

revoke all on function public.claim_invitation_slug() from public, anon, authenticated;
revoke all on function public.create_invitation_draft(
  text,
  jsonb,
  text,
  timestamptz,
  text,
  text,
  text,
  text
) from public, anon;
revoke all on function public.save_invitation_draft(
  uuid,
  text,
  jsonb,
  text,
  timestamptz,
  text,
  text,
  text,
  text
) from public, anon;

grant execute on function public.create_invitation_draft(
  text,
  jsonb,
  text,
  timestamptz,
  text,
  text,
  text,
  text
) to authenticated, service_role;
grant execute on function public.save_invitation_draft(
  uuid,
  text,
  jsonb,
  text,
  timestamptz,
  text,
  text,
  text,
  text
) to authenticated, service_role;
