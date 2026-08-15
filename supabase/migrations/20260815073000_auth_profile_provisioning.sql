create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  profile_name text;
begin
  profile_name := left(
    btrim(coalesce(new.raw_user_meta_data ->> 'display_name', '')),
    100
  );

  if char_length(profile_name) = 0 then
    profile_name := 'Pengguna';
  end if;

  insert into public.profiles (id, display_name)
  values (new.id, profile_name)
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'Creates the tenant profile required by AUTH-03 after Supabase Auth signup.';

revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();
