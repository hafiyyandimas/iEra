create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role text not null default 'user'
    constraint profiles_role_check check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'user')
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
-- update public.profiles p
-- set role = 'admin'
-- from auth.users u
-- where p.id = u.id and lower(u.email) = lower('admin@example.com');
