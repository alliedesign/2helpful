-- ============================================================
--  CATCH-UP PACK — run once in Supabase → SQL Editor.
--  Safe to re-run. This fills in everything the live database
--  may be missing so SEARCH and FEATURED work.
--
--  Root cause of empty search/featured: the search_listings and
--  featured queries depend on the listing_rating_summary view.
--  If that view (or the functions) never got created, the
--  queries fail and return nothing — even when good listings exist.
-- ============================================================

-- ---------- 1) Make sure every needed column exists ----------
alter table listings add column if not exists active_from    timestamptz;
alter table listings add column if not exists active_until   timestamptz;
alter table listings add column if not exists featured_from  timestamptz;
alter table listings add column if not exists featured_until timestamptz;
alter table listings add column if not exists header_url     text;
alter table listings add column if not exists avatar_url     text;
alter table listings add column if not exists image_url      text;
alter table listings add column if not exists categories     text[] default '{}';
alter table listings add column if not exists nationwide     boolean default false;
alter table listings add column if not exists service_area_miles int default 25;
alter table listings add column if not exists lat double precision;
alter table listings add column if not exists lng double precision;
alter table listings add column if not exists clicks int default 0;
alter table listings add column if not exists phone text;
alter table listings add column if not exists hours text;
alter table listings add column if not exists address text;
alter table listings add column if not exists instagram text;
alter table listings add column if not exists facebook text;
alter table listings add column if not exists tiktok text;
alter table listings add column if not exists twitter text;
alter table listings add column if not exists youtube text;
alter table listings add column if not exists linkedin text;
alter table helpers  add column if not exists location_text text;

-- ---------- 2) Reviews table (search_listings joins to its summary) ----------
create table if not exists listing_reviews (
  id          uuid primary key default gen_random_uuid(),
  listing_id  uuid not null,
  user_id     uuid not null,
  author_name text not null,
  rating      int  not null check (rating between 1 and 5),
  body        text,
  created_at  timestamptz default now(),
  updated_at  timestamptz default now(),
  unique (listing_id, user_id)
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

-- ---------- 3) THE MISSING VIEW (the likely culprit) ----------
create or replace view listing_rating_summary as
  select listing_id,
         round(avg(rating)::numeric, 1) as avg_rating,
         count(*)::int as review_total
  from listing_reviews
  group by listing_id;

-- ---------- 4) count_listings() ----------
create or replace function count_listings(
  q text,
  user_lat double precision default null,
  user_lng double precision default null,
  want_mode text default null
)
returns int as $func$
  with scored as (
    select l.mode, l.nationwide, l.service_area_miles,
      case when user_lat is not null and l.lat is not null
        then (3959 * acos(least(1.0, greatest(-1.0,
              cos(radians(user_lat))*cos(radians(l.lat))*cos(radians(l.lng)-radians(user_lng))
              + sin(radians(user_lat))*sin(radians(l.lat))))))
        else null end as distance_miles
    from listings l
    where l.is_approved = true
      and l.active_from is not null and l.active_from <= now()
      and l.active_until is not null and l.active_until >= now()
      and (q = '' or l.search_vector @@ websearch_to_tsquery('english', q)
           or l.business_name ilike '%'||q||'%')
      and (want_mode is null or l.mode = want_mode or l.mode = 'both')
  )
  select count(*)::int from scored
  where mode = 'virtual' or nationwide = true
     or user_lat is null or distance_miles is null
     or distance_miles <= service_area_miles;
$func$ language sql stable;

-- ---------- 5) search_listings() ----------
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
) as $func$
  with scored as (
    select
      l.id, l.business_name, l.website_url, l.description, l.categories, l.mode,
      s.avg_rating as rating,
      coalesce(s.review_total, 0) as review_count,
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
      and l.active_from is not null and l.active_from <= now()
      and l.active_until is not null and l.active_until >= now()
      and (q = '' or l.search_vector @@ websearch_to_tsquery('english', q)
           or l.business_name ilike '%'||q||'%')
      and (want_mode is null or l.mode = want_mode or l.mode = 'both')
  )
  select id, business_name, website_url, description, categories, mode,
         rating, review_count, helper_name, headquarters, service_area_miles, nationwide,
         image_url, avatar_url, header_url, distance_miles, relevance
  from scored
  where
    mode = 'virtual'
    or nationwide = true
    or user_lat is null or distance_miles is null
    or distance_miles <= service_area_miles
  order by
    relevance desc nulls last,
    distance_miles asc nulls last,
    rating desc nulls last
  limit max_rows offset skip_rows;
$func$ language sql stable;

-- ---------- 6) Tidy existing listings ----------
-- Any approved listing that has no active window becomes permanently live,
-- so things you've already added (e.g. AMBIX AP LLC) show up.
update listings
  set active_from  = coalesce(active_from, now()),
      active_until = '2099-01-01'::timestamptz
  where is_approved = true
    and (active_from is null or active_until is null);
