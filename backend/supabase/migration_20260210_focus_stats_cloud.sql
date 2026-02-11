-- Incremental migration for focus timer stats cloud sync.
-- Run this in Supabase SQL Editor.

begin;

create table if not exists public.focus_stats (
  user_id uuid primary key references public.users(id) on delete cascade,
  today_focus_minutes integer not null default 0,
  today_sessions integer not null default 0,
  streak integer not null default 0,
  total_sessions integer not null default 0,
  last_focus_date date null,
  updated_at timestamptz not null default timezone('utc', now()),
  check (today_focus_minutes >= 0),
  check (today_sessions >= 0),
  check (streak >= 0),
  check (total_sessions >= 0)
);

create index if not exists idx_focus_stats_last_focus_date
  on public.focus_stats (last_focus_date desc nulls last);

commit;

