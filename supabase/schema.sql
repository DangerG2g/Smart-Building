-- CampusShield schema for Supabase. Run this in Supabase Dashboard > SQL Editor.
-- New sign-ups always receive the 'student' role. Change staff/admin roles only as a trusted project owner.
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  role text not null default 'student' check (role in ('student','maintenance','security','admin')),
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name, role)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name',''), 'student')
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create table if not exists public.maintenance_requests (
  id text primary key default ('MNT-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,7))),
  title text not null,
  building_id text not null check (building_id in ('B1','B2','B3','B4','B5','B6')),
  area text not null,
  category text not null default 'Other',
  priority text not null default 'Medium' check (priority in ('Low','Medium','High')),
  status text not null default 'Pending' check (status in ('Pending','Assigned','In progress','Resolved','Completed')),
  description text not null,
  reporter_id uuid not null references public.profiles(id),
  reporter_name text not null default '',
  assigned_to text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.alerts (
  id text primary key default ('ALT-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,7))),
  title text not null,
  building_id text not null check (building_id in ('B1','B2','B3','B4','B5','B6')),
  area text not null,
  severity text not null default 'Medium' check (severity in ('Low','Medium','High')),
  status text not null default 'Open' check (status in ('Open','Acknowledged','Resolved')),
  detail text not null default '',
  audience text not null default 'All users' check (audience in ('All users','Staff only')),
  source text not null default 'SIMULATED',
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

-- Safe migration for projects that ran an earlier version of this schema.
alter table public.alerts add column if not exists audience text not null default 'All users';

create table if not exists public.assets (
  id text primary key default ('AST-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,7))),
  name text not null,
  building_id text not null check (building_id in ('B1','B2','B3','B4','B5','B6')),
  area text not null,
  category text not null default 'Equipment',
  status text not null default 'Operational',
  created_at timestamptz not null default now()
);

create table if not exists public.visitors (
  id text primary key default ('VIS-' || upper(substr(encode(gen_random_bytes(4),'hex'),1,7))),
  name text not null,
  organization text not null default '',
  building_id text not null check (building_id in ('B1','B2','B3','B4','B5','B6')),
  purpose text not null,
  checked_out boolean not null default false,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  checked_out_at timestamptz
);

-- Audit trail for official alert changes. Never stores passwords or secret credentials.
create table if not exists public.alert_audit_log (
  id bigint generated always as identity primary key,
  alert_id text not null,
  action text not null,
  changed_by uuid references auth.users(id) on delete set null,
  changed_at timestamptz not null default now(),
  old_status text,
  new_status text,
  alert_title text not null default ''
);

create or replace function public.log_alert_change()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if TG_OP = 'INSERT' then
    insert into public.alert_audit_log(alert_id, action, changed_by, new_status, alert_title)
    values (new.id, 'published', auth.uid(), new.status, new.title);
    return new;
  elsif TG_OP = 'UPDATE' then
    insert into public.alert_audit_log(alert_id, action, changed_by, old_status, new_status, alert_title)
    values (new.id, 'updated', auth.uid(), old.status, new.status, new.title);
    return new;
  end if;
  return new;
end;
$$;
drop trigger if exists alerts_audit_trigger on public.alerts;
create trigger alerts_audit_trigger after insert or update on public.alerts
for each row execute function public.log_alert_change();

create or replace function public.current_role()
returns text language sql stable security definer set search_path = '' as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.profiles enable row level security;
alter table public.maintenance_requests enable row level security;
alter table public.alerts enable row level security;
alter table public.assets enable row level security;
alter table public.visitors enable row level security;
alter table public.alert_audit_log enable row level security;

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile" on public.profiles for select to authenticated using (id = auth.uid() or public.current_role() in ('admin','security','maintenance'));
drop policy if exists "Users update own name only via profile" on public.profiles;
create policy "Users update own profile" on public.profiles for update to authenticated using (id = auth.uid() or public.current_role() = 'admin') with check (id = auth.uid() or public.current_role() = 'admin');
-- Prevent users from promoting themselves: profile role changes should be made only by project owner in SQL editor.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

drop policy if exists "Read maintenance requests by role" on public.maintenance_requests;
create policy "Read maintenance requests by role" on public.maintenance_requests for select to authenticated using (reporter_id = auth.uid() or public.current_role() in ('admin','maintenance','security'));
drop policy if exists "Students and staff create requests" on public.maintenance_requests;
create policy "Students and staff create requests" on public.maintenance_requests for insert to authenticated with check (reporter_id = auth.uid());
drop policy if exists "Staff update maintenance requests" on public.maintenance_requests;
create policy "Staff update maintenance requests" on public.maintenance_requests for update to authenticated using (public.current_role() in ('admin','maintenance')) with check (public.current_role() in ('admin','maintenance'));

drop policy if exists "Authenticated users read alerts" on public.alerts;
create policy "Authenticated users read alerts" on public.alerts for select to authenticated using (true);
drop policy if exists "Security and admins create alerts" on public.alerts;
create policy "Security and admins create alerts" on public.alerts for insert to authenticated with check (public.current_role() in ('admin','security'));
drop policy if exists "Security and admins update alerts" on public.alerts;
create policy "Security and admins update alerts" on public.alerts for update to authenticated using (public.current_role() in ('admin','security')) with check (public.current_role() in ('admin','security'));

drop policy if exists "Authorized staff read alert audit" on public.alert_audit_log;
create policy "Authorized staff read alert audit" on public.alert_audit_log for select to authenticated using (public.current_role() in ('admin','security'));
revoke all on public.alert_audit_log from anon, authenticated;
grant select on public.alert_audit_log to authenticated;

drop policy if exists "Authenticated users read assets" on public.assets;
create policy "Authenticated users read assets" on public.assets for select to authenticated using (true);
drop policy if exists "Admins and maintenance manage assets" on public.assets;
create policy "Admins and maintenance manage assets" on public.assets for all to authenticated using (public.current_role() in ('admin','maintenance')) with check (public.current_role() in ('admin','maintenance'));

drop policy if exists "Authorized staff read visitors" on public.visitors;
create policy "Authorized staff read visitors" on public.visitors for select to authenticated using (public.current_role() in ('admin','security'));
drop policy if exists "Authorized staff create visitors" on public.visitors;
create policy "Authorized staff create visitors" on public.visitors for insert to authenticated with check (public.current_role() in ('admin','security') and created_by = auth.uid());
drop policy if exists "Authorized staff update visitors" on public.visitors;
create policy "Authorized staff update visitors" on public.visitors for update to authenticated using (public.current_role() in ('admin','security')) with check (public.current_role() in ('admin','security'));

-- Optional starter assets (safe to re-run due to ON CONFLICT).
insert into public.assets (id,name,building_id,area,category,status) values
('AST-001','Science Lab ventilation unit','B3','Lab wing','HVAC','Operational'),
('AST-002','Library emergency light','B2','North exit','Safety','Needs inspection'),
('AST-003','Auditorium sound system','B6','Main hall','AV equipment','Operational'),
('AST-004','Hostel water pump','B4','Utility room','Plumbing','Operational')
on conflict (id) do nothing;
