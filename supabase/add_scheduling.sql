-- ============================================================
--  Listings: nationwide serving + paid scheduling window
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

-- Serve the entire USA (in addition to / instead of a local radius)
alter table listings add column if not exists nationwide boolean default false;

-- Paid scheduling window. A listing is only shown in search while
-- now() is between active_from and active_until.
alter table listings add column if not exists active_from  timestamptz;
alter table listings add column if not exists active_until timestamptz;

-- How many paid days were purchased (for reference / receipts later).
alter table listings add column if not exists paid_days int default 0;

-- A simple per-listing owner handle so people can manage their own.
-- We store the helper's email (already on helpers) — nothing new needed,
-- but index active_until for fast "is it live?" checks.
create index if not exists listings_active_until_idx on listings (active_until);
