-- Run in Supabase SQL Editor after the existing schema.sql.
-- Adds an admin-only role assignment RPC and an admin verification state.
alter table public.maintenance_requests drop constraint if exists maintenance_requests_status_check;
alter table public.maintenance_requests add constraint maintenance_requests_status_check
  check (status in ('Pending','Assigned','In progress','Awaiting verification','Resolved','Completed'));

create or replace function public.admin_set_user_role(target_user_id uuid, next_role text)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if public.current_role() <> 'admin' then
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

create or replace function public.enforce_admin_completion_verification()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.status = 'Completed' and public.current_role() <> 'admin' then
    raise exception 'Only an administrator can verify and complete a task';
  end if;
  return new;
end;
$$;
drop trigger if exists maintenance_admin_completion_check on public.maintenance_requests;
create trigger maintenance_admin_completion_check
before insert or update of status on public.maintenance_requests
for each row execute function public.enforce_admin_completion_verification();
