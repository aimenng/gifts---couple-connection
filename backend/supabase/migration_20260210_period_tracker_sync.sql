-- Incremental migration for period + mood cloud sync between couples.
-- Run this in Supabase SQL Editor.

begin;

create table if not exists public.period_tracker_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  entry_date date not null,
  is_period boolean not null default false,
  mood text null,
  flow text null check (flow in ('light', 'medium', 'heavy')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (user_id, entry_date)
);

create index if not exists idx_period_tracker_user_date
  on public.period_tracker_entries (user_id, entry_date desc);

create index if not exists idx_period_tracker_entry_date
  on public.period_tracker_entries (entry_date desc);

commit;
