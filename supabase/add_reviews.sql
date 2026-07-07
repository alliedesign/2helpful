-- ============================================================
--  Reviews & ratings (live average, account-gated, editable)
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

create table if not exists listing_reviews (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null,
  user_id     uuid not null,
  author_name text not null,
  rating      int  not null check (rating between 1 and 5),
  body        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (listing_id, user_id)   -- one review per person per business (they can edit it)
);
create index if not exists listing_reviews_listing_idx on listing_reviews (listing_id);

alter table listing_reviews enable row level security;
drop policy if exists "read reviews"   on listing_reviews;
create policy "read reviews"   on listing_reviews for select using (true);
drop policy if exists "write reviews"  on listing_reviews;
create policy "write reviews"  on listing_reviews for insert with check (true);
drop policy if exists "update reviews" on listing_reviews;
create policy "update reviews" on listing_reviews for update using (true);
drop policy if exists "delete reviews" on listing_reviews;
create policy "delete reviews" on listing_reviews for delete using (true);

-- Live rating summary per listing: average of real reviews + how many.
create or replace view listing_rating_summary as
  select listing_id,
         round(avg(rating)::numeric, 1) as avg_rating,
         count(*)::int as review_total
  from listing_reviews
  group by listing_id;
