-- ============================================================
--  Add uploaded image columns to listings
--    avatar_url  → the helper's userpic (round profile photo)
--    header_url  → the headline/banner photo across the top
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

alter table listings add column if not exists avatar_url text;
alter table listings add column if not exists header_url text;
