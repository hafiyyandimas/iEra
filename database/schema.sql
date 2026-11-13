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
