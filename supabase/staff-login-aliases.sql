-- Run in Supabase SQL Editor. Map staff IDs to existing Supabase Auth users.
-- Do NOT store passwords in this table.
create table if not exists public.staff_login_aliases (
  staff_id text primary key,
  auth_user_id uuid not null unique references auth.users(id) on delete cascade,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.staff_login_aliases enable row level security;
revoke all on public.staff_login_aliases from anon, authenticated;
-- The Edge Function uses the server-only service role to read this table.
