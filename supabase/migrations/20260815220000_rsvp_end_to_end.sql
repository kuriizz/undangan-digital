create table public.rsvps (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  name text not null,
  attendance text not null,
  party_size smallint not null,
  note text,
  idempotency_key uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rsvps_idempotency_unique unique (invitation_id, idempotency_key),
  constraint rsvps_name_length check (char_length(btrim(name)) between 1 and 100),
  constraint rsvps_name_trimmed check (name = btrim(name)),
  constraint rsvps_attendance_valid
    check (attendance in ('attending', 'not_attending')),
  constraint rsvps_party_size_valid
    check (
      (attendance = 'attending' and party_size between 1 and 10)
      or (attendance = 'not_attending' and party_size = 0)
    ),
  constraint rsvps_note_length check (note is null or char_length(note) <= 500)
);

create index rsvps_invitation_created_idx
on public.rsvps (invitation_id, created_at desc);

create trigger rsvps_set_updated_at
before update on public.rsvps
for each row execute function public.set_updated_at();

create table public.rsvp_rate_limits (
  invitation_id uuid not null references public.invitations (id) on delete cascade,
  fingerprint_hash text not null,
  window_started_at timestamptz not null,
  attempts smallint not null default 1,
  primary key (invitation_id, fingerprint_hash, window_started_at),
  constraint rsvp_rate_limits_fingerprint_format
    check (fingerprint_hash ~ '^[a-f0-9]{64}$'),
  constraint rsvp_rate_limits_attempts_positive check (attempts > 0)
);

alter table public.rsvps enable row level security;
alter table public.rsvp_rate_limits enable row level security;

revoke all on table public.rsvps from public, anon, authenticated;
revoke all on table public.rsvp_rate_limits from public, anon, authenticated;

grant select on table public.rsvps to authenticated;
grant all on table public.rsvps to service_role;
grant all on table public.rsvp_rate_limits to service_role;

create policy rsvps_select_own
on public.rsvps
for select
to authenticated
using (
  exists (
    select 1
    from public.invitations
    where invitations.id = rsvps.invitation_id
      and invitations.owner_id = (select auth.uid())
  )
);

create function public.submit_public_rsvp(
  p_slug text,
  p_name text,
  p_attendance text,
  p_party_size smallint,
  p_note text,
  p_idempotency_key uuid,
  p_fingerprint_hash text
)
returns table (rsvp_id uuid, result text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_uuid uuid;
  existing_rsvp_id uuid;
  current_window timestamptz;
  current_attempts smallint;
  created_rsvp_id uuid;
begin
  select id
  into invitation_uuid
  from public.invitations
  where slug = p_slug
    and status = 'published';

  if invitation_uuid is null then
    return query select null::uuid, 'unavailable'::text;
    return;
  end if;

  select id
  into existing_rsvp_id
  from public.rsvps
  where invitation_id = invitation_uuid
    and idempotency_key = p_idempotency_key;

  if existing_rsvp_id is not null then
    return query select existing_rsvp_id, 'accepted'::text;
    return;
  end if;

  current_window := date_bin('10 minutes', now(), '2001-01-01'::timestamptz);

  delete from public.rsvp_rate_limits
  where invitation_id = invitation_uuid
    and fingerprint_hash = p_fingerprint_hash
    and window_started_at < current_window - interval '1 day';

  insert into public.rsvp_rate_limits (
    invitation_id,
    fingerprint_hash,
    window_started_at,
    attempts
  )
  values (invitation_uuid, p_fingerprint_hash, current_window, 1)
  on conflict (invitation_id, fingerprint_hash, window_started_at) do update
  set attempts = public.rsvp_rate_limits.attempts + 1
  returning attempts into current_attempts;

  if current_attempts > 5 then
    return query select null::uuid, 'rate_limited'::text;
    return;
  end if;

  insert into public.rsvps (
    invitation_id,
    name,
    attendance,
    party_size,
    note,
    idempotency_key
  )
  values (
    invitation_uuid,
    btrim(p_name),
    p_attendance,
    p_party_size,
    nullif(btrim(p_note), ''),
    p_idempotency_key
  )
  returning id into created_rsvp_id;

  return query select created_rsvp_id, 'accepted'::text;
end;
$$;

revoke all on function public.submit_public_rsvp(
  text,
  text,
  text,
  smallint,
  text,
  uuid,
  text
) from public;

grant execute on function public.submit_public_rsvp(
  text,
  text,
  text,
  smallint,
  text,
  uuid,
  text
) to anon, authenticated, service_role;
