-- Incremental migration: add token_version for JWT revocation after sensitive account changes.
-- Run this in Supabase SQL Editor before deploying the new auth middleware.

begin;

alter table public.users
  add column if not exists token_version integer not null default 0;

update public.users
set token_version = 0
where token_version is null;

alter table public.users
  drop constraint if exists users_token_version_non_negative;

alter table public.users
  add constraint users_token_version_non_negative
  check (token_version >= 0);

commit;
