-- ============================================================
--  HelpfulxHuman — UPDATE PACK 5
--  Adds: reviews & ratings (live average), pagination support
--  (search now takes page size/offset + a count function).
--  Run this whole file once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

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


-- ============================================================
--  Count matching listings (for pagination totals)
--  Mirrors search_listings filters but returns just a count.
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

create or replace function count_listings(
  q text,
  user_lat double precision default null,
  user_lng double precision default null,
  want_mode text default null
)
returns int as $$
  with scored as (
    select l.mode, l.nationwide, l.service_area_miles,
      case when user_lat is not null and l.lat is not null
        then (3959 * acos(least(1.0, greatest(-1.0,
              cos(radians(user_lat))*cos(radians(l.lat))*cos(radians(l.lng)-radians(user_lng))
              + sin(radians(user_lat))*sin(radians(l.lat))))))
        else null end as distance_miles
    from listings l
    where l.is_approved = true
      and (l.active_from is null or l.active_from <= now())
      and (l.active_until is null or l.active_until >= now())
      and (q = '' or l.search_vector @@ websearch_to_tsquery('english', q)
           or l.business_name ilike '%'||q||'%')
      and (want_mode is null or l.mode = want_mode or l.mode = 'both')
  )
  select count(*)::int from scored
  where mode = 'virtual' or nationwide = true
     or user_lat is null or distance_miles is null
     or distance_miles <= service_area_miles;
$$ language sql stable;


-- Upgraded search: live-average rating + pagination ----------
drop function if exists search_listings(text, double precision, double precision, text);
drop function if exists search_listings(text, double precision, double precision, text, int, int);

create or replace function search_listings(
  q text,
  user_lat double precision default null,
  user_lng double precision default null,
  want_mode text default null,
  max_rows int default 100,
  skip_rows int default 0
)
returns table (
  id uuid, business_name text, website_url text, description text,
  categories text[], mode text, rating numeric, review_count int,
  helper_name text, headquarters text, service_area_miles int, nationwide boolean,
  image_url text, avatar_url text, header_url text, distance_miles double precision, relevance real
) as $$
  with scored as (
    select
      l.id, l.business_name, l.website_url, l.description, l.categories, l.mode,
      coalesce(s.avg_rating, h.rating) as rating,
      coalesce(s.review_total, h.review_count) as review_count,
      h.name as helper_name, l.headquarters,
      l.service_area_miles, l.nationwide, l.image_url, l.avatar_url, l.header_url,
      case when user_lat is not null and l.lat is not null
        then (
          3959 * acos(
            least(1.0, greatest(-1.0,
              cos(radians(user_lat)) * cos(radians(l.lat)) *
              cos(radians(l.lng) - radians(user_lng)) +
              sin(radians(user_lat)) * sin(radians(l.lat))
            ))
          )
        )
        else null end as distance_miles,
      ts_rank(l.search_vector, websearch_to_tsquery('english', q)) as relevance
    from listings l
    join helpers h on h.id = l.helper_id
    left join listing_rating_summary s on s.listing_id = l.id
    where l.is_approved = true
      -- Only show listings whose paid window is currently active.
      -- (If active_from/until are null, treat as always-on, e.g. seed/demo data.)
      and (l.active_from is null or l.active_from <= now())
      and (l.active_until is null or l.active_until >= now())
      and (q = '' or l.search_vector @@ websearch_to_tsquery('english', q)
           or l.business_name ilike '%'||q||'%')
      and (want_mode is null or l.mode = want_mode or l.mode = 'both')
  )
  select id, business_name, website_url, description, categories, mode,
         rating, review_count, helper_name, headquarters, service_area_miles, nationwide,
         image_url, avatar_url, header_url, distance_miles, relevance
  from scored
  where
    -- Virtual helpers are reachable anywhere.
    mode = 'virtual'
    -- Nationwide helpers serve the whole USA.
    or nationwide = true
    -- If the client didn't share a location, show everyone (can't filter by distance).
    or user_lat is null or distance_miles is null
    -- Otherwise, in-person/both helpers must have their HQ within service-area range.
    or distance_miles <= service_area_miles
  order by
    relevance desc nulls last,
    distance_miles asc nulls last,
    rating desc
  limit max_rows offset skip_rows;
$$ language sql stable;
