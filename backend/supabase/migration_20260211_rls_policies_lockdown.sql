-- Lock down direct client access for backend-only architecture.
-- This project uses backend service-role access, so anon/authenticated client access
-- should be explicitly denied on application tables.
-- Run in Supabase SQL Editor.

begin;

do $$
declare
  tbl text;
  policy_name text;
begin
  foreach tbl in array array[
    'users',
    'user_settings',
    'memories',
    'events',
    'period_tracker_entries',
    'focus_stats',
    'notifications',
    'email_verifications',
    'binding_requests'
  ]
  loop
    if to_regclass(format('public.%I', tbl)) is not null then
      policy_name := format('deny_client_access_%s', tbl);

      execute format('alter table public.%I enable row level security', tbl);
      execute format('drop policy if exists %I on public.%I', policy_name, tbl);
      execute format(
        'create policy %I on public.%I for all to anon, authenticated using (false) with check (false)',
        policy_name,
        tbl
      );
    end if;
  end loop;
end $$;

commit;

