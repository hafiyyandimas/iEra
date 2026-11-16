create extension if not exists pgcrypto;

create table if not exists public.app_users (
  id uuid primary key default gen_random_uuid(),
  username text not null unique
    constraint app_users_username_check check (username ~ '^[a-z0-9_]{3,24}$'),
  password_hash text not null,
  role text not null default 'user'
    constraint app_users_role_check check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.auth_sessions (
  token_hash text primary key,
  user_id uuid not null references public.app_users (id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_sessions_user_id_idx on public.auth_sessions (user_id);
create index if not exists auth_sessions_expires_at_idx on public.auth_sessions (expires_at);

alter table public.app_users enable row level security;
alter table public.auth_sessions enable row level security;
revoke all on table public.app_users from public, anon, authenticated;
revoke all on table public.auth_sessions from public, anon, authenticated;

-- Existing Supabase Auth accounts and profiles are not migrated. Their
-- passwords are unavailable to this application and must be re-created.
-- Remove the legacy iEra profile trigger, but leave auth.users untouched.
drop trigger if exists iera_create_profile_on_signup on auth.users;
drop function if exists public.handle_new_auth_user();

-- Run manually after the target account has registered:
-- update public.app_users
-- set role = 'admin'
-- where username = lower('admin_username')
-- returning id, username, role;
