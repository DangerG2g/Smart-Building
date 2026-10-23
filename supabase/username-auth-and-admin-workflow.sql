-- SurakshaHub username login + role assignment + completion verification.
-- Run AFTER supabase/schema.sql in Supabase SQL Editor.
-- IMPORTANT: In Supabase Dashboard > Authentication > Providers > Email, disable
-- "Confirm email" for this username-only workflow. The UI never asks for an email;
-- internally, Supabase Auth receives username@login.surakshahub.invalid to verify passwords.

create extension if not exists pgcrypto;

alter table public.profiles add column if not exists username text;
-- Backfill existing profiles with a username based on auth metadata or their old email prefix.
update public.profiles p
set username = left(lower(regexp_replace(coalesce(nullif(split_part(u.email,'@',1),''),'user'), '[^a-z0-9._-]', '_', 'g')), 24)
               || '_' || left(replace(p.id::text,'-',''), 6)
from auth.users u
where u.id = p.id and (p.username is null or btrim(p.username) = '');

-- Keep usernames unique and normalized. NULL is allowed for any legacy row that could not be backfilled.
create unique index if not exists profiles_username_lower_uidx
  on public.profiles (lower(username)) where username is not null;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
declare
  requested_username text;
begin
  requested_username := lower(btrim(coalesce(new.raw_user_meta_data ->> 'username', split_part(coalesce(new.email,''),'@',1))));
  if requested_username !~ '^[a-z0-9._-]{3,32}$' then
    raise exception 'Username must be 3–32 characters using letters, numbers, dots, underscores, or hyphens';
  end if;
  insert into public.profiles (id, full_name, role, username)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name',''), 'student', requested_username)
  on conflict (id) do update set username = coalesce(public.profiles.username, excluded.username);
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Role changes must go through this RPC; users cannot promote themselves.
create or replace function public.admin_set_user_role(target_user_id uuid, next_role text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if coalesce(public.current_role(),'') <> 'admin' then
    raise exception 'Only administrators can assign roles';
  end if;
  if next_role not in ('student','maintenance','security','admin') then
    raise exception 'Invalid role';
  end if;
  update public.profiles set role = next_role where id = target_user_id;
  if not found then raise exception 'User profile not found'; end if;
  return true;
end;
$$;
revoke all on function public.admin_set_user_role(uuid,text) from public, anon;
grant execute on function public.admin_set_user_role(uuid,text) to authenticated;

-- Permit admins to see all profiles; ordinary users see only their own profile.
drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated
  using (id = auth.uid() or public.current_role() in ('admin','security','maintenance'));
-- Prevent self-editing role or username through direct table updates.
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "Users update own name only via profile" on public.profiles;
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;
create policy "Users update own name only via profile" on public.profiles for update to authenticated
  using (id = auth.uid() or public.current_role() = 'admin')
  with check (id = auth.uid() or public.current_role() = 'admin');

-- Staff must submit work for admin verification. Only an admin can mark it Completed.
alter table public.maintenance_requests drop constraint if exists maintenance_requests_status_check;
alter table public.maintenance_requests add constraint maintenance_requests_status_check
  check (status in ('Pending','Assigned','In progress','Awaiting verification','Resolved','Completed'));
create or replace function public.enforce_admin_completion_verification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'Completed' and coalesce(public.current_role(),'') <> 'admin' then
    raise exception 'Only an administrator can verify and complete a task';
  end if;
  return new;
end;
$$;
drop trigger if exists maintenance_admin_completion_check on public.maintenance_requests;
create trigger maintenance_admin_completion_check
before insert or update of status on public.maintenance_requests
for each row execute function public.enforce_admin_completion_verification();

-- Make username column readable for the authenticated app and never publicly writable.
grant select (id, full_name, role, username, created_at) on public.profiles to authenticated;
