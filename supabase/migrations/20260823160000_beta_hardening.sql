create table public.public_request_rate_limits (
  surface text not null,
  fingerprint_hash text not null,
  window_started_at timestamptz not null,
  attempts smallint not null default 1,
  primary key (surface, fingerprint_hash, window_started_at),
  constraint public_request_rate_limits_surface_valid
    check (surface ~ '^[a-z0-9-]{1,40}$'),
  constraint public_request_rate_limits_fingerprint_valid
    check (fingerprint_hash ~ '^[a-f0-9]{64}$'),
  constraint public_request_rate_limits_attempts_positive check (attempts > 0)
);

alter table public.public_request_rate_limits enable row level security;
revoke all on table public.public_request_rate_limits from public, anon, authenticated;
grant all on table public.public_request_rate_limits to service_role;

create function public.consume_public_rate_limit(
  p_surface text,
  p_fingerprint_hash text,
  p_window interval,
  p_limit smallint
)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  current_window timestamptz;
  current_attempts smallint;
begin
  if p_surface !~ '^[a-z0-9-]{1,40}$'
    or p_fingerprint_hash !~ '^[a-f0-9]{64}$'
    or p_window < interval '1 minute'
    or p_window > interval '1 day'
    or p_limit < 1
    or p_limit > 100 then
    return false;
  end if;

  current_window := date_bin(p_window, now(), '2001-01-01'::timestamptz);
  delete from public.public_request_rate_limits
  where window_started_at < current_window - interval '1 day';

  insert into public.public_request_rate_limits (
    surface, fingerprint_hash, window_started_at, attempts
  ) values (p_surface, p_fingerprint_hash, current_window, 1)
  on conflict (surface, fingerprint_hash, window_started_at) do update
  set attempts = public.public_request_rate_limits.attempts + 1
  returning attempts into current_attempts;

  return current_attempts <= p_limit;
end;
$$;

revoke all on function public.consume_public_rate_limit(text, text, interval, smallint)
from public, anon, authenticated;
grant execute on function public.consume_public_rate_limit(text, text, interval, smallint)
to service_role;

create table public.abuse_reports (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid references public.invitations (id) on delete set null,
  invitation_slug text not null,
  category text not null,
  details text not null,
  contact_email text,
  status text not null default 'open',
  fingerprint_hash text not null,
  idempotency_key uuid not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint abuse_reports_category_valid
    check (category in ('privacy', 'fraud', 'harassment', 'copyright', 'other')),
  constraint abuse_reports_slug_valid
    check (invitation_slug ~ '^[a-z0-9-]{3,60}$'),
  constraint abuse_reports_details_length
    check (char_length(btrim(details)) between 10 and 1000),
  constraint abuse_reports_contact_length
    check (contact_email is null or char_length(contact_email) <= 254),
  constraint abuse_reports_status_valid
    check (status in ('open', 'reviewed', 'dismissed')),
  constraint abuse_reports_fingerprint_valid
    check (fingerprint_hash ~ '^[a-f0-9]{64}$')
);

create index abuse_reports_status_created_idx
on public.abuse_reports (status, created_at desc);
create trigger abuse_reports_set_updated_at before update on public.abuse_reports
for each row execute function public.set_updated_at();

alter table public.abuse_reports enable row level security;
revoke all on table public.abuse_reports from public, anon, authenticated;
grant all on table public.abuse_reports to service_role;

create function public.purge_expired_beta_data()
returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  rate_limit_count integer;
  rsvp_rate_limit_count integer;
  abuse_report_count integer;
begin
  delete from public.public_request_rate_limits
  where window_started_at < now() - interval '1 day';
  get diagnostics rate_limit_count = row_count;

  delete from public.rsvp_rate_limits
  where window_started_at < now() - interval '1 day';
  get diagnostics rsvp_rate_limit_count = row_count;

  delete from public.abuse_reports
  where (status <> 'open' and updated_at < now() - interval '90 days')
     or created_at < now() - interval '1 year';
  get diagnostics abuse_report_count = row_count;

  return jsonb_build_object(
    'publicRateLimits', rate_limit_count,
    'rsvpRateLimits', rsvp_rate_limit_count,
    'abuseReports', abuse_report_count
  );
end;
$$;

revoke all on function public.purge_expired_beta_data()
from public, anon, authenticated;
grant execute on function public.purge_expired_beta_data() to service_role;

create function public.submit_abuse_report(
  p_slug text,
  p_category text,
  p_details text,
  p_contact_email text,
  p_fingerprint_hash text,
  p_idempotency_key uuid
)
returns table (report_id uuid, result text)
language plpgsql security definer set search_path = ''
as $$
declare
  invitation_uuid uuid;
  created_report_id uuid;
begin
  perform public.purge_expired_beta_data();

  select id into invitation_uuid
  from public.invitations
  where slug = p_slug and status = 'published';
  if invitation_uuid is null then
    return query select null::uuid, 'unavailable'::text;
    return;
  end if;

  select id into created_report_id from public.abuse_reports
  where idempotency_key = p_idempotency_key;
  if created_report_id is not null then
    return query select created_report_id, 'accepted'::text;
    return;
  end if;

  if not public.consume_public_rate_limit(
    'abuse-report', p_fingerprint_hash, interval '1 hour', 3::smallint
  ) then
    return query select null::uuid, 'rate_limited'::text;
    return;
  end if;

  insert into public.abuse_reports (
    invitation_id, invitation_slug, category, details, contact_email,
    fingerprint_hash, idempotency_key
  ) values (
    invitation_uuid, p_slug, p_category, btrim(p_details),
    nullif(lower(btrim(p_contact_email)), ''),
    p_fingerprint_hash, p_idempotency_key
  ) returning id into created_report_id;

  return query select created_report_id, 'accepted'::text;
end;
$$;

revoke all on function public.submit_abuse_report(text, text, text, text, text, uuid)
from public, anon, authenticated;
grant execute on function public.submit_abuse_report(text, text, text, text, text, uuid)
to service_role;

create function public.delete_own_account()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;
  delete from auth.users where id = auth.uid();
  if not found then
    raise insufficient_privilege using message = 'account not found';
  end if;
end;
$$;

revoke all on function public.delete_own_account() from public, anon;
grant execute on function public.delete_own_account() to authenticated, service_role;

revoke execute on function public.get_personalized_guest(text, text)
from anon, authenticated;
revoke execute on function public.get_published_invitation(text)
from anon, authenticated;
revoke execute on function public.get_public_wishes(text)
from anon, authenticated;
revoke execute on function public.get_published_invitation_media(uuid)
from anon, authenticated;
revoke execute on function public.submit_public_rsvp(
  text, text, text, smallint, text, text, text, uuid, text
) from anon, authenticated;
revoke execute on function public.submit_public_rsvp(
  text, text, text, smallint, text, uuid, text
) from anon, authenticated;

grant execute on function public.get_personalized_guest(text, text)
to service_role;
grant execute on function public.get_published_invitation(text) to service_role;
grant execute on function public.get_public_wishes(text) to service_role;
grant execute on function public.get_published_invitation_media(uuid) to service_role;
grant execute on function public.submit_public_rsvp(
  text, text, text, smallint, text, text, text, uuid, text
) to service_role;
grant execute on function public.submit_public_rsvp(
  text, text, text, smallint, text, uuid, text
) to service_role;
