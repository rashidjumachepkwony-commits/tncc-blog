-- TNCC Gallery CMS: database-driven gallery for images, video and audio.
-- Run once in Supabase Dashboard -> SQL Editor (idempotent, safe to re-run).

create table if not exists public.gallery_items (
  id uuid primary key default gen_random_uuid(),
  media_url text not null,
  media_type text not null default 'image' check (media_type in ('image', 'video', 'audio')),
  caption text not null default '',
  alt_text text not null default '',
  category text not null default 'Community',
  sort_order integer not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gallery_items_sort_idx on public.gallery_items (sort_order, created_at);

alter table public.gallery_items enable row level security;

-- Everyone can read published items (the public gallery page).
drop policy if exists "Anyone can read published gallery" on public.gallery_items;
create policy "Anyone can read published gallery"
on public.gallery_items
  for select
  using (published = true or public.is_admin());

-- Admins manage everything through the admin workspace.
drop policy if exists "Admins manage gallery" on public.gallery_items;
create policy "Admins manage gallery"
on public.gallery_items
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Seed the existing hard-coded gallery so it is editable from the admin
-- straight away. Existing rows are never overwritten.
-- sort_order preserves the order the photos already appear in.
insert into public.gallery_items (media_url, media_type, caption, alt_text, category, sort_order, published)
select v.media_url, v.media_type, v.caption, v.caption, v.category, v.sort_order, true
from (values
  ('hero-event.jpg.jpeg',    'image', 'Community gathers for the event', 'Events',      1),
  ('community-talk.jpg.jpeg','image', 'Let us talk',                      'Community',  2),
  ('runners (1).jpeg',       'image', 'Ready for the starting line',      'Events',      3),
  ('runners (2).jpeg',       'image', 'Running together',                 'Events',      4),
  ('runners (3).jpeg',       'image', 'Community in motion',              'Community',  5),
  ('runners (4).jpeg',       'image', 'Race day energy',                  'Events',      6),
  ('runners (5).jpeg',       'image', 'Momentum building',                'Events',      7),
  ('runners (6).jpeg',       'image', 'Strength in participation',        'Events',      8),
  ('runners (7).jpeg',       'image', 'Young runners leading the way',    'Youth',       9),
  ('runners (8).jpeg',       'image', 'Together on the course',           'Events',     10),
  ('runners (9).jpeg',       'image', 'A shared finish line',             'Events',     11),
  ('runners (10).jpeg',      'image', 'Celebrating the movement',          'Community', 12),
  ('runners (11).jpeg',      'image', 'The joy of running',               'Youth',      13),
  ('runners (12).jpeg',      'image', 'Focused and fearless',              'Events',     14),
  ('runners (13).jpeg',      'image', 'Support & solidarity',              'Community', 15),
  ('run.jpg.jpeg',           'image', 'Run. Unite. Transform.',           'Events',     16),
  ('running.jpg.jpeg',       'image', 'On the road together',             'Events',     17),
  ('community.jpg.jpeg',     'image', 'Building community through sport', 'Community', 18),
  ('partners.jpg.jpeg',      'image', 'Partners making it possible',      'Partnerships',19),
  ('partners2.jpg.jpeg',     'image', 'Working together for impact',      'Partnerships',20),
  ('images.jpg.jpeg',        'image', 'Moments that connect us',          'Community', 21),
  ('images2.jpg.jpeg',       'image', 'Participation for everyone',       'Community', 22),
  ('images3.jpg.jpeg',       'image', 'A movement with purpose',          'Events',     23)
) as v(media_url, media_type, caption, category, sort_order)
where not exists (
  select 1 from public.gallery_items g where g.media_url = v.media_url
);

-- Verify: select count(*) from public.gallery_items;  -- expect 23
