-- ============================================================
--  UPDATE PACK 7
--  (a) Creates the missing website_requests table (fixes the
--      "Could not find table public.website_requests" error).
--  (b) Adds featured promotion: a $20/day "featured" window that
--      pins a listing to the home page under "All".
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

-- (a) Website build requests --------------------------------
create table if not exists website_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  business_name text,
  phone         text,
  about         text,
  budget        text,
  created_at    timestamptz default now()
);
alter table website_requests enable row level security;
drop policy if exists "insert website requests" on website_requests;
create policy "insert website requests" on website_requests for insert with check (true);
drop policy if exists "read website requests" on website_requests;
create policy "read website requests" on website_requests for select using (true);

-- (b) Featured promotion window -----------------------------
alter table listings add column if not exists featured_from  timestamptz;
alter table listings add column if not exists featured_until timestamptz;
create index if not exists listings_featured_idx on listings (featured_until);
