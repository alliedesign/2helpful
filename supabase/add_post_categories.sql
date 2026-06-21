-- ============================================================
--  Community posts: categories + account ownership
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

alter table posts add column if not exists category text default 'general';
alter table posts add column if not exists user_id uuid;   -- ties a post to the logged-in account

create index if not exists posts_category_idx on posts (category);
create index if not exists posts_user_idx on posts (user_id);
