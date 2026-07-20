-- Illuminate Department Management System
-- Run this entire script once in Supabase: SQL Editor > New query > Run.

create table if not exists public.app_modules (
  module text primary key check (module in (
    'members', 'contributionTypes', 'payments', 'activities',
    'schedules', 'rosters', 'designs'
  )),
  records jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

alter table public.app_modules enable row level security;

drop policy if exists "Department leaders can read modules" on public.app_modules;
drop policy if exists "Department leaders can create modules" on public.app_modules;
drop policy if exists "Department leaders can update modules" on public.app_modules;

create policy "Department leaders can read modules"
on public.app_modules for select
to authenticated
using (true);

create policy "Department leaders can create modules"
on public.app_modules for insert
to authenticated
with check ((select auth.uid()) = updated_by);

create policy "Department leaders can update modules"
on public.app_modules for update
to authenticated
using (true)
with check ((select auth.uid()) = updated_by);

grant select, insert, update on public.app_modules to authenticated;
revoke all on public.app_modules from anon;

-- Keep updated_at accurate even when a client omits it.
create or replace function public.set_illuminate_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_illuminate_updated_at on public.app_modules;
create trigger set_illuminate_updated_at
before update on public.app_modules
for each row execute function public.set_illuminate_updated_at();
