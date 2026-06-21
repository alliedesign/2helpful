-- ============================================================
--  Migration: add profile image support to listings
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

alter table listings add column if not exists image_url text;
