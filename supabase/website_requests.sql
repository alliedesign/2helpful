-- ============================================================
--  Website build requests
--  Helpers without a website can request that HelpfulxHuman
--  build one for them. Run once in Supabase → SQL Editor.
-- ============================================================

create table if not exists website_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  business_name text,
  phone         text,
  about         text,
  budget        text,
  status        text default 'new',   -- new | contacted | building | done
  created_at    timestamptz default now()
);

alter table website_requests enable row level security;

-- Anyone can submit a request (insert). Only the service role can read them
-- (so requests aren't publicly visible). No public select policy = private.
drop policy if exists "anyone can request a website" on website_requests;
create policy "anyone can request a website"
  on website_requests for insert
  with check (true);
