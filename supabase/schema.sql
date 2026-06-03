-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  event_date date not null,
  viewing_mode text not null check (viewing_mode in ('cinema')),
  created_at timestamptz not null default now()
);

alter table public.event_submissions enable row level security;

drop policy if exists "allow anonymous insert" on public.event_submissions;
create policy "allow anonymous insert"
  on public.event_submissions
  for insert
  to anon
  with check (true);

drop policy if exists "allow anonymous read" on public.event_submissions;
create policy "allow anonymous read"
  on public.event_submissions
  for select
  to anon
  using (true);
