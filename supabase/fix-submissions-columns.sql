-- TNCC event registration fix for public.submissions.
-- Run this once in Supabase Dashboard -> SQL Editor.
-- It adds the event-registration columns the website writes on
-- /teso-north-cross-country.html, which currently do not exist in the live
-- database (they cause HTTP 400 "column submissions.event_id does not exist"
-- errors on both the registration form submission and the category counts).

alter table public.submissions add column if not exists event_id text;
alter table public.submissions add column if not exists event_name text;
alter table public.submissions add column if not exists event_date text;
alter table public.submissions add column if not exists selected_category text;
alter table public.submissions add column if not exists race_distance text;
alter table public.submissions add column if not exists registration_fee integer;
alter table public.submissions add column if not exists payment_method text;
alter table public.submissions add column if not exists payment_status text;
alter table public.submissions add column if not exists mpesa_reference text;
alter table public.submissions add column if not exists guardian_phone text;
alter table public.submissions add column if not exists gender text;
alter table public.submissions add column if not exists bib_number text;

create index if not exists submissions_event_id_idx on public.submissions (event_id);

-- Keep the server-side registration deadline enforcement (idempotent).
drop policy if exists "Chepsaita Run registration deadline" on public.submissions;
drop policy if exists "Teso North Cross Country registration deadline" on public.submissions;
create policy "Teso North Cross Country registration deadline"
on public.submissions
for insert
with check (
  event_id IS DISTINCT FROM 'teso-north-cross-country'
  OR created_at <= '2026-11-15T23:59:59+03:00'::timestamptz
);

-- Verify: this should list the new columns.
-- select column_name from information_schema.columns
--   where table_schema = 'public' and table_name = 'submissions'
--   order by ordinal_position;
