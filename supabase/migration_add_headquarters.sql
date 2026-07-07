-- ============================================================
--  Migration: add "headquarters" to listings
--  Run this ONCE in Supabase → SQL Editor if your database was
--  created before the headquarters field existed.
--  Safe to run more than once (uses IF NOT EXISTS).
-- ============================================================

alter table listings add column if not exists headquarters text;
