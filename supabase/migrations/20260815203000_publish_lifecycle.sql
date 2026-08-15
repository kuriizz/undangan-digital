create function public.publish_invitation(
  p_invitation_id uuid,
  p_expected_revision bigint
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  invitation_record public.invitations%rowtype;
  event_record public.invitation_events%rowtype;
  snapshot jsonb;
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;

  select *
  into invitation_record
  from public.invitations
  where id = p_invitation_id
    and owner_id = auth.uid()
  for update;

  if not found then
    raise insufficient_privilege using message = 'invitation is not owned by current user';
  end if;

  if invitation_record.draft_revision <> p_expected_revision then
    raise exception using
      errcode = '40001',
      message = 'draft revision changed before publish';
  end if;

  select *
  into event_record
  from public.invitation_events
  where invitation_id = p_invitation_id
    and sort_order = 0;

  if not found then
    raise check_violation using message = 'invitation event is required';
  end if;

  snapshot := invitation_record.draft_content || jsonb_build_object(
    'event',
    jsonb_build_object(
      'name', event_record.event_name,
      'startsAt', event_record.starts_at,
      'timezone', event_record.timezone,
      'venueName', event_record.venue_name,
      'address', event_record.address,
      'mapUrl', event_record.map_url
    )
  );

  update public.invitations
  set status = 'published',
      published_content = snapshot,
      published_revision = invitation_record.draft_revision,
      published_at = now()
  where id = p_invitation_id;

  return snapshot;
end;
$$;

create function public.unpublish_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise insufficient_privilege using message = 'authentication required';
  end if;

  update public.invitations
  set status = 'unpublished'
  where id = p_invitation_id
    and owner_id = auth.uid()
    and status = 'published';

  if not found then
    raise insufficient_privilege using message = 'published invitation is not owned by current user';
  end if;
end;
$$;

create function public.get_published_invitation(p_slug text)
returns table (
  slug text,
  published_content jsonb,
  published_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select invitations.slug, invitations.published_content, invitations.published_at
  from public.invitations
  where invitations.slug = p_slug
    and invitations.status = 'published'
    and invitations.published_content is not null;
$$;

revoke all on function public.publish_invitation(uuid, bigint)
from public, anon;
revoke all on function public.unpublish_invitation(uuid)
from public, anon;
revoke all on function public.get_published_invitation(text)
from public;

grant execute on function public.publish_invitation(uuid, bigint)
to authenticated;
grant execute on function public.unpublish_invitation(uuid)
to authenticated;
grant execute on function public.get_published_invitation(text)
to anon, authenticated, service_role;
