create table public.profiles (
  id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  display_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_length
    check (char_length(btrim(display_name)) between 1 and 100),
  constraint profiles_display_name_trimmed
    check (display_name = btrim(display_name))
);

comment on table public.profiles is
  'Owner profile data. Account email remains canonical in auth.users.';

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  status text not null default 'draft',
  draft_content jsonb not null default '{"schemaVersion": 1}'::jsonb,
  draft_revision bigint not null default 1,
  published_content jsonb,
  published_revision bigint,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint invitations_one_per_owner unique (owner_id),
  constraint invitations_status_valid
    check (status in ('draft', 'published', 'unpublished')),
  constraint invitations_draft_revision_positive
    check (draft_revision > 0),
  constraint invitations_draft_content_object
    check (jsonb_typeof(draft_content) = 'object'),
  constraint invitations_draft_schema_version
    check (
      draft_content ? 'schemaVersion'
      and jsonb_typeof(draft_content -> 'schemaVersion') = 'number'
    ),
  constraint invitations_published_snapshot_consistent
    check (
      (
        published_content is null
        and published_revision is null
        and published_at is null
      )
      or (
        published_content is not null
        and jsonb_typeof(published_content) = 'object'
        and published_content ? 'schemaVersion'
        and jsonb_typeof(published_content -> 'schemaVersion') = 'number'
        and published_revision is not null
        and published_revision > 0
        and published_revision <= draft_revision
        and published_at is not null
      )
    ),
  constraint invitations_published_status_has_snapshot
    check (status <> 'published' or published_content is not null)
);

comment on table public.invitations is
  'Tenant-owned invitation foundation. Slugs and publish operations are added in Phase 1.';

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.bump_invitation_draft_revision()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.draft_content is distinct from old.draft_content then
    new.draft_revision = old.draft_revision + 1;
  else
    new.draft_revision = old.draft_revision;
  end if;

  return new;
end;
$$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger invitations_bump_draft_revision
before update of draft_content on public.invitations
for each row execute function public.bump_invitation_draft_revision();

create trigger invitations_set_updated_at
before update on public.invitations
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.invitations enable row level security;

revoke all on table public.profiles from public, anon, authenticated;
revoke all on table public.invitations from public, anon, authenticated;

grant select on table public.profiles to authenticated;
grant insert (id, display_name) on table public.profiles to authenticated;
grant update (display_name) on table public.profiles to authenticated;

grant select on table public.invitations to authenticated;
grant insert (owner_id, draft_content) on table public.invitations to authenticated;
grant update (draft_content) on table public.invitations to authenticated;
grant delete on table public.invitations to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.invitations to service_role;

revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.bump_invitation_draft_revision() from public, anon, authenticated;

create policy profiles_select_own
on public.profiles
for select
to authenticated
using ((select auth.uid()) = id);

create policy profiles_insert_own
on public.profiles
for insert
to authenticated
with check ((select auth.uid()) = id);

create policy profiles_update_own
on public.profiles
for update
to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy invitations_select_own
on public.invitations
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy invitations_insert_own
on public.invitations
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy invitations_update_own
on public.invitations
for update
to authenticated
using ((select auth.uid()) = owner_id)
with check ((select auth.uid()) = owner_id);

create policy invitations_delete_own
on public.invitations
for delete
to authenticated
using ((select auth.uid()) = owner_id);
