-- DESTRUCTIVE: run only when this Supabase project is dedicated to iEra.
-- Deletes the official catalog, legacy favorites table, profiles, all
-- Supabase Auth users, and policies/triggers attached to these tables.
-- Then recreates the current iEra schema.
-- This does not delete Supabase Storage objects, project settings, or API keys.

begin;

drop trigger if exists iera_create_profile_on_signup on auth.users;
drop table if exists public.favorites;
drop table if exists public.animals;
drop table if exists public.profiles;
drop function if exists public.set_animals_updated_at();
drop function if exists public.handle_new_auth_user();

delete from auth.users;

create extension if not exists pgcrypto;

create table public.animals (
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

create index idx_animals_extinction_year on public.animals (extinction_year);
create index idx_animals_common_name on public.animals (common_name);
create index idx_animals_scientific_name on public.animals (scientific_name);

create function public.set_animals_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger animals_set_updated_at
before update on public.animals
for each row execute function public.set_animals_updated_at();

alter table public.animals enable row level security;
revoke all on table public.animals from anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  role text not null default 'user'
    constraint profiles_role_check check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create unique index profiles_username_lower_idx
  on public.profiles (lower(username))
  where username is not null;

create function public.handle_new_auth_user()
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

create trigger iera_create_profile_on_signup
after insert on auth.users
for each row execute function public.handle_new_auth_user();

alter table public.profiles enable row level security;
revoke all on table public.profiles from anon, authenticated;
grant select on table public.profiles to authenticated;

create policy profiles_read_own_role
on public.profiles
for select to authenticated
using (id = (select auth.uid()));

commit;
