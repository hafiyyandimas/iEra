-- iEra official catalog. Store an extinction year only; never a date or time.
create extension if not exists pgcrypto;

create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  common_name text not null,
  scientific_name text not null,
  extinction_year integer not null
    constraint animals_extinction_year_range check (extinction_year between 2001 and 2025),
  year_is_estimated boolean not null default false,
  description text not null,
  image_url text,
  image_alt text,
  habitat text,
  region text,
  source_url text not null,
  image_credit text,
  image_license text,
  source_name text,
  image_source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_animals_extinction_year on public.animals (extinction_year);
create index if not exists idx_animals_common_name on public.animals (common_name);
create index if not exists idx_animals_scientific_name on public.animals (scientific_name);

create or replace function public.set_animals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists animals_set_updated_at on public.animals;
create trigger animals_set_updated_at
before update on public.animals
for each row execute function public.set_animals_updated_at();

alter table public.animals enable row level security;

-- Catalog reads are performed by the server-side API using its server key.
-- Do not grant public write access or put a service-role key in the frontend.

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

-- Promote a registered account manually in the Supabase SQL Editor:
-- update public.profiles p
-- set role = 'admin'
-- from auth.users u
-- where p.id = u.id and lower(u.email) = lower('admin@example.com');
