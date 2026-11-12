-- Salin dan jalankan di Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.animals (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  common_name text not null,
  scientific_name text not null,
  extinction_year smallint not null check (extinction_year between 2001 and 2025),
  slot smallint not null check (slot between 1 and 3),
  extinction_date date,
  date_precision text not null default 'year_only'
    check (date_precision in ('exact', 'year_only', 'estimated')),
  description text not null default '',
  habitat text,
  image_url text not null,
  image_alt text not null,
  source_name text not null,
  source_url text not null,
  image_source_url text,
  image_license text,
  created_at timestamptz not null default now(),
  constraint animals_year_slot_unique unique (extinction_year, slot),
  constraint animals_date_matches_year check (
    extinction_date is null or extract(year from extinction_date)::smallint = extinction_year
  ),
  constraint animals_exact_date_required check (
    date_precision <> 'exact' or extinction_date is not null
  )
);

create table if not exists public.favorites (
  user_id uuid not null references auth.users (id) on delete cascade,
  animal_id uuid not null references public.animals (id) on delete cascade,
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, animal_id)
);

create index if not exists animals_extinction_year_idx on public.animals (extinction_year, slot);
create index if not exists favorites_user_created_idx on public.favorites (user_id, created_at desc);

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists favorites_set_updated_at on public.favorites;
create trigger favorites_set_updated_at before update on public.favorites
for each row execute function public.set_updated_at();

alter table public.animals enable row level security;
alter table public.favorites enable row level security;
drop policy if exists "animals_read_public" on public.animals;
drop policy if exists "favorites_read_own" on public.favorites;
drop policy if exists "favorites_insert_own" on public.favorites;
drop policy if exists "favorites_update_own" on public.favorites;
drop policy if exists "favorites_delete_own" on public.favorites;

create policy "animals_read_public" on public.animals for select to anon, authenticated using (true);
create policy "favorites_read_own" on public.favorites for select to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "favorites_insert_own" on public.favorites for insert to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "favorites_update_own" on public.favorites for update to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id)
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);
create policy "favorites_delete_own" on public.favorites for delete to authenticated
  using ((select auth.uid()) is not null and (select auth.uid()) = user_id);

grant usage on schema public to anon, authenticated;
grant select on public.animals to anon, authenticated;
grant select, insert, update, delete on public.favorites to authenticated;
