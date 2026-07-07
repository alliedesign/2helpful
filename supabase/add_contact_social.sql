-- ============================================================
--  Listings: contact details + social media
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

alter table listings add column if not exists phone     text;
alter table listings add column if not exists hours     text;
alter table listings add column if not exists address   text;
alter table listings add column if not exists instagram text;
alter table listings add column if not exists facebook  text;
alter table listings add column if not exists tiktok    text;
alter table listings add column if not exists twitter   text;
alter table listings add column if not exists youtube   text;
alter table listings add column if not exists linkedin  text;
