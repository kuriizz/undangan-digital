create extension if not exists pgcrypto with schema extensions;

create table public.guests (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  party_limit smallint not null default 1,
  token_hash text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint guests_name_length check (char_length(btrim(name)) between 1 and 100),
  constraint guests_name_trimmed check (name = btrim(name)),
  constraint guests_party_limit_valid check (party_limit between 1 and 10),
  constraint guests_token_hash_format check (token_hash ~ '^[a-f0-9]{64}$'),
  constraint guests_owner_invitation_unique unique (id, invitation_id)
);

create index guests_invitation_name_idx on public.guests (invitation_id, name);
create trigger guests_set_updated_at before update on public.guests
for each row execute function public.set_updated_at();

alter table public.rsvps add column guest_id uuid references public.guests (id) on delete set null;
create unique index rsvps_guest_unique on public.rsvps (guest_id) where guest_id is not null;

create table public.wishes (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  rsvp_id uuid not null unique references public.rsvps (id) on delete cascade,
  guest_id uuid references public.guests (id) on delete set null,
  name text not null,
  message text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint wishes_name_length check (char_length(btrim(name)) between 1 and 100),
  constraint wishes_message_length check (char_length(btrim(message)) between 1 and 500),
  constraint wishes_status_valid check (status in ('pending', 'approved', 'hidden'))
);

create index wishes_invitation_status_idx on public.wishes (invitation_id, status, created_at desc);
create trigger wishes_set_updated_at before update on public.wishes
for each row execute function public.set_updated_at();

alter table public.guests enable row level security;
alter table public.wishes enable row level security;
revoke all on table public.guests from public, anon, authenticated;
revoke all on table public.wishes from public, anon, authenticated;
grant select, insert, update, delete on table public.guests to authenticated;
grant select, update, delete on table public.wishes to authenticated;
grant all on table public.guests, public.wishes to service_role;

create policy guests_own_all on public.guests for all to authenticated
using (owner_id = (select auth.uid()))
with check (
  owner_id = (select auth.uid()) and exists (
    select 1 from public.invitations i
    where i.id = invitation_id and i.owner_id = (select auth.uid())
  )
);

create policy wishes_select_own on public.wishes for select to authenticated
using (exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = (select auth.uid())));
create policy wishes_update_own on public.wishes for update to authenticated
using (exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = (select auth.uid())))
with check (exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = (select auth.uid())));
create policy wishes_delete_own on public.wishes for delete to authenticated
using (exists (select 1 from public.invitations i where i.id = invitation_id and i.owner_id = (select auth.uid())));

drop function public.submit_public_rsvp(text,text,text,smallint,text,uuid,text);

create function public.get_personalized_guest(p_slug text, p_token text)
returns table (guest_id uuid, guest_name text, party_limit smallint)
language sql security definer set search_path = '' stable
as $$
  select g.id, g.name, g.party_limit
  from public.guests g join public.invitations i on i.id = g.invitation_id
  where i.slug = p_slug and i.status = 'published'
    and g.token_hash = encode(extensions.digest(p_token, 'sha256'), 'hex')
  limit 1
$$;

create function public.get_public_wishes(p_slug text)
returns table (name text, message text, created_at timestamptz)
language sql security definer set search_path = '' stable
as $$
  select w.name, w.message, w.created_at
  from public.wishes w join public.invitations i on i.id = w.invitation_id
  where i.slug = p_slug and i.status = 'published' and w.status = 'approved'
  order by w.created_at desc limit 100
$$;

create function public.submit_public_rsvp(
  p_slug text, p_name text, p_attendance text, p_party_size smallint,
  p_note text, p_wish text, p_guest_token text, p_idempotency_key uuid,
  p_fingerprint_hash text
)
returns table (rsvp_id uuid, result text)
language plpgsql security definer set search_path = ''
as $$
declare
  invitation_uuid uuid; personalized_guest public.guests%rowtype;
  current_window timestamptz; current_attempts smallint; response_id uuid;
begin
  select id into invitation_uuid from public.invitations where slug = p_slug and status = 'published';
  if invitation_uuid is null then return query select null::uuid, 'unavailable'::text; return; end if;

  if nullif(p_guest_token, '') is not null then
    select * into personalized_guest from public.guests
    where invitation_id = invitation_uuid
      and token_hash = encode(extensions.digest(p_guest_token, 'sha256'), 'hex');
    if personalized_guest.id is null then return query select null::uuid, 'unavailable'::text; return; end if;
    if p_party_size > personalized_guest.party_limit then
      return query select null::uuid, 'party_limit_exceeded'::text; return;
    end if;
  end if;

  if exists (select 1 from public.rsvps where invitation_id = invitation_uuid and idempotency_key = p_idempotency_key) then
    return query select id, 'accepted'::text from public.rsvps
    where invitation_id = invitation_uuid and idempotency_key = p_idempotency_key;
    return;
  end if;

  current_window := date_bin('10 minutes', now(), '2001-01-01'::timestamptz);
  delete from public.rsvp_rate_limits
  where invitation_id = invitation_uuid
    and fingerprint_hash = p_fingerprint_hash
    and window_started_at < current_window - interval '1 day';

  insert into public.rsvp_rate_limits values (invitation_uuid, p_fingerprint_hash, current_window, 1)
  on conflict (invitation_id, fingerprint_hash, window_started_at) do update set attempts = public.rsvp_rate_limits.attempts + 1
  returning attempts into current_attempts;
  if current_attempts > 5 then return query select null::uuid, 'rate_limited'::text; return; end if;

  if personalized_guest.id is not null then
    insert into public.rsvps (invitation_id, guest_id, name, attendance, party_size, note, idempotency_key)
    values (invitation_uuid, personalized_guest.id, personalized_guest.name, p_attendance, p_party_size, nullif(btrim(p_note), ''), p_idempotency_key)
    on conflict (guest_id) where guest_id is not null do update set
      attendance = excluded.attendance, party_size = excluded.party_size,
      note = excluded.note, idempotency_key = excluded.idempotency_key, updated_at = now()
    returning id into response_id;
  else
    insert into public.rsvps (invitation_id, name, attendance, party_size, note, idempotency_key)
    values (invitation_uuid, btrim(p_name), p_attendance, p_party_size, nullif(btrim(p_note), ''), p_idempotency_key)
    returning id into response_id;
  end if;

  if nullif(btrim(p_wish), '') is not null then
    insert into public.wishes (invitation_id, rsvp_id, guest_id, name, message)
    values (invitation_uuid, response_id, personalized_guest.id,
      case when personalized_guest.id is null then btrim(p_name) else personalized_guest.name end, btrim(p_wish))
    on conflict on constraint wishes_rsvp_id_key do update
    set message = excluded.message, status = 'pending', updated_at = now();
  end if;
  return query select response_id, 'accepted'::text;
end;
$$;

create function public.submit_public_rsvp(
  p_slug text, p_name text, p_attendance text, p_party_size smallint,
  p_note text, p_idempotency_key uuid, p_fingerprint_hash text
)
returns table (rsvp_id uuid, result text)
language sql security definer set search_path = ''
as $$
  select * from public.submit_public_rsvp(
    p_slug, p_name, p_attendance, p_party_size, p_note, '', '',
    p_idempotency_key, p_fingerprint_hash
  )
$$;

revoke all on function public.get_personalized_guest(text,text), public.get_public_wishes(text),
  public.submit_public_rsvp(text,text,text,smallint,text,text,text,uuid,text),
  public.submit_public_rsvp(text,text,text,smallint,text,uuid,text) from public;
grant execute on function public.get_personalized_guest(text,text), public.get_public_wishes(text),
  public.submit_public_rsvp(text,text,text,smallint,text,text,text,uuid,text) to anon, authenticated, service_role;
grant execute on function public.submit_public_rsvp(text,text,text,smallint,text,uuid,text)
to anon, authenticated, service_role;
