-- TNCC production data model for Supabase.
-- Run this in Supabase SQL Editor, then enable Email and Google providers.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'reader' check (role in ('reader', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  county text not null,
  sub_county text not null,
  ward text not null,
  guardian text,
  education text,
  age integer not null check (age between 5 and 120),
  race_categories text[] not null,
  interest text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

alter table public.submissions add column if not exists county text;
alter table public.submissions add column if not exists sub_county text;
alter table public.submissions add column if not exists ward text;
alter table public.submissions add column if not exists guardian text;
alter table public.submissions add column if not exists education text;
alter table public.submissions add column if not exists age integer;
alter table public.submissions add column if not exists race_categories text[];

-- Event registration fields (backward-compatible, additive)
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

create table if not exists public.volunteers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  role text not null,
  message text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  article_id text not null,
  user_id uuid references auth.users(id) on delete set null,
  author_name text not null,
  body text not null check (char_length(body) between 1 and 2000),
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  donor_name text,
  email text,
  amount_kes integer not null check (amount_kes > 0),
  stripe_session_id text unique,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.submissions enable row level security;
alter table public.volunteers enable row level security;
alter table public.contact_messages enable row level security;
alter table public.comments enable row level security;
alter table public.donations enable row level security;

drop policy if exists "Anyone can submit registration" on public.submissions;
create policy "Anyone can submit registration"
on public.submissions
for insert
with check (true);

drop policy if exists "Anyone can submit volunteer application" on public.volunteers;
create policy "Anyone can submit volunteer application"
on public.volunteers
for insert
with check (true);

drop policy if exists "Anyone can submit contact message" on public.contact_messages;
create policy "Anyone can submit contact message"
on public.contact_messages
for insert
with check (true);

drop policy if exists "Anyone can read approved comments" on public.comments;
create policy "Anyone can read approved comments"
on public.comments
for select
using (approved = true);

drop policy if exists "Authenticated users can create comments" on public.comments;
create policy "Authenticated users can create comments"
on public.comments
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can read their own profile" on public.profiles;
create policy "Users can read their own profile"
on public.profiles
for select
using (auth.uid() = id);
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create table if not exists public.content_items (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default 'Community',
  excerpt text not null default '',
  body text not null default '',
  image_url text,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.content_items enable row level security;

create or replace function public.is_admin()
returns boolean language sql security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

drop policy if exists "Anyone can read published content" on public.content_items;
create policy "Anyone can read published content" on public.content_items
  for select using (published = true or public.is_admin());

drop policy if exists "Admins manage content" on public.content_items;
create policy "Admins manage content" on public.content_items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read submissions" on public.submissions;
create policy "Admins read submissions" on public.submissions
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins update submissions" on public.submissions;
create policy "Admins update submissions" on public.submissions
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read volunteers" on public.volunteers;
create policy "Admins read volunteers" on public.volunteers
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins update volunteers" on public.volunteers;
create policy "Admins update volunteers" on public.volunteers
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins read contact messages" on public.contact_messages;
create policy "Admins read contact messages" on public.contact_messages
  for select to authenticated using (public.is_admin());

drop policy if exists "Admins read donations" on public.donations;
create policy "Admins read donations" on public.donations
  for select to authenticated using (public.is_admin());

-- Migrate existing comment rows so article_id can reference uuid story ids.
alter table public.comments alter column article_id type text using article_id::text;

drop policy if exists "Anyone can record a pending donation" on public.donations;
create policy "Anyone can record a pending donation"
on public.donations
for insert
with check (status = 'pending');

drop policy if exists "Admins update comments" on public.comments;
create policy "Admins update comments"
on public.comments
for update to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "Admins delete comments" on public.comments;
create policy "Admins delete comments" on public.comments
for delete to authenticated using (public.is_admin());

-- Prevent event registrations after the deadline (server-side enforcement)
drop policy if exists "Chepsaita Run registration deadline" on public.submissions;
create policy "Chepsaita Run registration deadline"
on public.submissions
for insert
with check (
  event_id IS DISTINCT FROM 'great-chepsaita-run'
  OR created_at <= '2026-11-20T23:59:59+03:00'::timestamptz
);

-- Promote the first admin.
-- Step 1: Create the auth user via Supabase Dashboard > Authentication > Users
--         (email: tesonorthcrosscountrycbo@gmail.com, or invite via email)
-- Step 2: Promote to admin:
update public.profiles
set role = 'admin'
where id = (select id from auth.users where email = 'tesonorthcrosscountrycbo@gmail.com');

-- Admin password is set through the Supabase Dashboard (Authentication > Users >
-- tesonorthcrosscountrycbo@gmail.com > "Set password") or via the invite email flow.
-- The first admin registers normally on login.html with email/password, then is promoted.
