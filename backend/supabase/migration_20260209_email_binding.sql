-- Incremental migration for existing projects (run once)
-- Adds email verification + binding request capability.

create extension if not exists pgcrypto;

alter table public.users add column if not exists invitation_code text null;
alter table public.users add column if not exists bound_invitation_code text null;
alter table public.users add column if not exists email_verified boolean not null default false;

create unique index if not exists idx_users_invitation_code_unique on public.users (invitation_code) where invitation_code is not null;
create index if not exists idx_users_partner_id on public.users (partner_id);
create index if not exists idx_users_bound_invitation_code on public.users (bound_invitation_code);

create table if not exists public.email_verifications (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  purpose text not null check (purpose in ('signup', 'reset_password')),
  code_hash text not null,
  password_hash text not null,
  expires_at timestamptz not null,
  attempts integer not null default 0,
  last_sent_at timestamptz not null default timezone('utc', now()),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (email, purpose)
);

create table if not exists public.binding_requests (
  id uuid primary key default gen_random_uuid(),
  requester_user_id uuid not null references public.users(id) on delete cascade,
  target_user_id uuid not null references public.users(id) on delete cascade,
  invite_code text not null,
  confirm_token text not null unique,
  status text not null default 'pending' check (status in ('pending', 'accepted', 'rejected', 'expired', 'cancelled')),
  expires_at timestamptz not null,
  confirmed_at timestamptz null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_email_verifications_expires_at on public.email_verifications (expires_at);
create index if not exists idx_binding_requests_target_pending on public.binding_requests (target_user_id) where status = 'pending';
create index if not exists idx_binding_requests_requester_pending on public.binding_requests (requester_user_id) where status = 'pending';

-- Upgrade existing check constraint for projects created with older migration.
alter table public.email_verifications drop constraint if exists email_verifications_purpose_check;
alter table public.email_verifications
  add constraint email_verifications_purpose_check
  check (purpose in ('signup', 'reset_password'));
