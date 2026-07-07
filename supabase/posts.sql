-- ============================================================
--  Community feed: posts from businesses and clients
--  Posts can carry text, an image link, a video link, and a link.
--  Run once in Supabase → SQL Editor.
-- ============================================================

create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_kind text default 'client',   -- 'helper' or 'client'
  body        text,
  image_url   text,
  video_url   text,
  link_url    text,
  created_at  timestamptz default now()
);

create index if not exists posts_created_idx on posts (created_at desc);

alter table posts enable row level security;

-- Everyone can read the feed.
drop policy if exists "anyone can read posts" on posts;
create policy "anyone can read posts" on posts for select using (true);

-- Anyone can post (we keep it open for now; add auth/moderation later).
drop policy if exists "anyone can write posts" on posts;
create policy "anyone can write posts" on posts for insert with check (true);
