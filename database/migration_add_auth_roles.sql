create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  role text not null default 'user'
    constraint profiles_role_check check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists username text;
create unique index if not exists profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_username text;
begin
  new_username := lower(trim(new.raw_user_meta_data ->> 'username'));
  if new_username is null or new_username !~ '^[a-z0-9_]{3,24}$' then
    raise exception 'A valid username is required.';
  end if;

  insert into public.profiles (id, username, role)
  values (new.id, new_username, 'user')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists iera_create_profile_on_signup on auth.users;
create trigger iera_create_profile_on_signup
after insert on auth.users
for each row execute function public.handle_new_auth_user();

insert into public.profiles (id, role)
select id, 'user' from auth.users
on conflict (id) do nothing;

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

drop policy if exists profiles_read_own_role on public.profiles;
create policy profiles_read_own_role
on public.profiles
for select to authenticated
using (id = (select auth.uid()));

-- Run manually after the target account has registered:
-- update public.profiles
-- set role = 'admin'
-- where lower(username) = lower('admin_username')
-- returning id, username, role;
