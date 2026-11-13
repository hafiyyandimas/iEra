-- Run once on an existing Module 5 database to preserve catalog rows while
-- converting extinction dates/slots to the year-only Tugas Besar schema.
begin;

alter table public.animals
  add column if not exists year_is_estimated boolean not null default false,
  add column if not exists region text,
  add column if not exists image_credit text,
  add column if not exists updated_at timestamptz not null default now();

update public.animals
set year_is_estimated = (date_precision = 'estimated')
where year_is_estimated = false;

alter table public.animals
  drop constraint if exists animals_year_slot_unique,
  drop constraint if exists animals_date_matches_year,
  drop constraint if exists animals_exact_date_required;

alter table public.animals
  alter column extinction_year type integer using extinction_year::integer,
  alter column description set default '',
  alter column image_url drop not null,
  alter column image_alt drop not null,
  drop column if exists extinction_date,
  drop column if exists date_precision,
  drop column if exists slot;

alter table public.animals
  add constraint animals_extinction_year_range
  check (extinction_year between 2001 and 2025);

create index if not exists idx_animals_extinction_year on public.animals (extinction_year);
create index if not exists idx_animals_common_name on public.animals (common_name);
create index if not exists idx_animals_scientific_name on public.animals (scientific_name);

create or replace function public.set_animals_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists animals_set_updated_at on public.animals;
create trigger animals_set_updated_at before update on public.animals
for each row execute function public.set_animals_updated_at();

commit;
