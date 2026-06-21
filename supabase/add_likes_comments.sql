-- ============================================================
--  Community: likes + comments
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

create table if not exists post_likes (
  post_id    uuid not null,
  user_id    uuid not null,
  created_at timestamptz default now(),
  primary key (post_id, user_id)
);
alter table post_likes enable row level security;
drop policy if exists "read likes" on post_likes;
create policy "read likes" on post_likes for select using (true);
drop policy if exists "write likes" on post_likes;
create policy "write likes" on post_likes for insert with check (true);
drop policy if exists "remove likes" on post_likes;
create policy "remove likes" on post_likes for delete using (true);

create table if not exists post_comments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null,
  user_id     uuid not null,
  author_name text not null,
  body        text not null,
  created_at  timestamptz default now()
);
create index if not exists post_comments_post_idx on post_comments (post_id, created_at);
alter table post_comments enable row level security;
drop policy if exists "read comments" on post_comments;
create policy "read comments" on post_comments for select using (true);
drop policy if exists "write comments" on post_comments;
create policy "write comments" on post_comments for insert with check (true);
drop policy if exists "delete comments" on post_comments;
create policy "delete comments" on post_comments for delete using (true);
