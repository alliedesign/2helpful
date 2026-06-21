-- ============================================================
--  HelpfulxHuman — UPDATE PACK 3
--  Adds: community post categories + account ownership of posts.
--  Run this whole file once in Supabase → SQL Editor. Safe to re-run.
--
--  ALSO REQUIRED (one-time, in the dashboard — see chat instructions):
--    Authentication → Providers → Email → enable "Email + Password".
--    Optionally turn OFF "Confirm email" while testing so sign-up is instant.
-- ============================================================

alter table posts add column if not exists category text default 'general';
alter table posts add column if not exists user_id  uuid;

create index if not exists posts_category_idx on posts (category);
create index if not exists posts_user_idx     on posts (user_id);
