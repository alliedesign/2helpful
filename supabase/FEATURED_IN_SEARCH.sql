-- ============================================================
--  FEATURED-IN-SEARCH PACK
--  Makes featured listings ALWAYS appear in search automatically.
--
--  Before: a listing showed in search only if its live window
--          (active_from/active_until) was active. Featured status
--          was separate, so a featured listing could be missing
--          from search.
--  After:  a listing shows in search if it's live in its window
--          OR currently featured. Featured ⇒ searchable, always.
--
--  Run once in Supabase → SQL Editor. Safe to re-run.
-- ============================================================

-- 1) Backfill: give every currently-featured listing an active live
--    window too, so existing featured ones show up immediately.
update listings
  set active_from  = coalesce(active_from, now()),
      active_until = greatest(coalesce(active_until, now()), featured_until)
  where is_approved = true
    and featured_until is not null
    and featured_until >= now();

-- 2) search_listings: treat "currently featured" as live.
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
      and (
        -- live in its paid window …
        (l.active_from is not null and l.active_from <= now()
         and l.active_until is not null and l.active_until >= now())
        -- … OR currently featured (featured always shows in search)
        or (l.featured_until is not null and l.featured_until >= now())
      )
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

-- 3) count_listings: same rule, so pagination totals match.
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
      and (
        (l.active_from is not null and l.active_from <= now()
         and l.active_until is not null and l.active_until >= now())
        or (l.featured_until is not null and l.featured_until >= now())
      )
      and (q = '' or l.search_vector @@ websearch_to_tsquery('english', q)
           or l.business_name ilike '%'||q||'%')
      and (want_mode is null or l.mode = want_mode or l.mode = 'both')
  )
  select count(*)::int from scored
  where mode = 'virtual' or nationwide = true
     or user_lat is null or distance_miles is null
     or distance_miles <= service_area_miles;
$func$ language sql stable;
