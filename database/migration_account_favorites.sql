-- Adds account-synced favorites for signed-in users.
-- Safe to run on a database created by database/schema.sql before this table
-- existed. Run once in the Supabase SQL Editor, then redeploy the API.
create extension if not exists pgcrypto;

create table if not exists public.favorites (
  user_id uuid not null references public.app_users (id) on delete cascade,
  animal_id uuid not null references public.animals (id) on delete cascade,
  note text not null default ''
    constraint favorites_note_length check (char_length(note) <= 500),
  saved_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, animal_id)
);

create index if not exists favorites_user_saved_at_idx on public.favorites (user_id, saved_at desc);

alter table public.favorites enable row level security;
revoke all on table public.favorites from public, anon, authenticated;

-- Favorites are read and written only through the Express API using the
-- service-role key, which also enforces the owner from the session cookie.
