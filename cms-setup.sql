-- TNCC CMS setup: editable page content + media library.
-- Run once in Supabase Dashboard -> SQL Editor (idempotent).

-- One row per editable page block. id looks like 'home:hero-title'.
create table if not exists public.site_content (
  id text primary key,
  page text not null,
  kind text not null default 'text' check (kind in ('text', 'html', 'image')),
  value text,
  updated_at timestamptz not null default now()
);

alter table public.site_content enable row level security;

drop policy if exists "Anyone can read site content" on public.site_content;
create policy "Anyone can read site content"
on public.site_content
for select
using (true);

-- Public media bucket for images, audio and video.
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "Public can view media" on storage.objects;
create policy "Public can view media"
on storage.objects
for select
using (bucket_id = 'media');

drop policy if exists "Admins can upload media" on storage.objects;
create policy "Admins can upload media"
on storage.objects
for insert to authenticated
with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins can update media" on storage.objects;
create policy "Admins can update media"
on storage.objects
for update to authenticated
using (bucket_id = 'media' and public.is_admin());

drop policy if exists "Admins can delete media" on storage.objects;
create policy "Admins can delete media"
on storage.objects
for delete to authenticated
using (bucket_id = 'media' and public.is_admin());

-- Verify: select * from public.site_content; and check Storage -> media bucket exists.
