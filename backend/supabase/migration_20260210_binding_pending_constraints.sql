-- Incremental migration for binding pending constraints and performance.
-- Run this after migration_20260209_email_binding.sql in Supabase SQL Editor.

begin;

-- Convert stale pending rows to expired so they no longer block new requests.
update public.binding_requests
set
  status = 'expired',
  confirmed_at = coalesce(confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
where status = 'pending'
  and expires_at < timezone('utc', now());

-- Keep only the latest pending request per requester.
with requester_ranked as (
  select
    id,
    row_number() over (
      partition by requester_user_id
      order by created_at desc, id desc
    ) as rn
  from public.binding_requests
  where status = 'pending'
)
update public.binding_requests br
set
  status = 'cancelled',
  confirmed_at = coalesce(br.confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
from requester_ranked rr
where br.id = rr.id
  and rr.rn > 1;

-- Keep only the latest pending request per target.
with target_ranked as (
  select
    id,
    row_number() over (
      partition by target_user_id
      order by created_at desc, id desc
    ) as rn
  from public.binding_requests
  where status = 'pending'
)
update public.binding_requests br
set
  status = 'cancelled',
  confirmed_at = coalesce(br.confirmed_at, timezone('utc', now())),
  updated_at = timezone('utc', now())
from target_ranked tr
where br.id = tr.id
  and tr.rn > 1;

-- Replace older non-unique pending indexes with stricter/clearer indexes.
drop index if exists public.idx_binding_requests_target_pending;
drop index if exists public.idx_binding_requests_requester_pending;

create unique index if not exists idx_binding_requests_requester_pending_unique
  on public.binding_requests (requester_user_id)
  where status = 'pending';

create unique index if not exists idx_binding_requests_target_pending_unique
  on public.binding_requests (target_user_id)
  where status = 'pending';

create index if not exists idx_binding_requests_pending_expires_at
  on public.binding_requests (expires_at)
  where status = 'pending';

commit;
