-- ============================================================
--  HelpfulxHuman — UPDATE PACK 2
--  Adds: nationwide serving, paid scheduling window (auto up/down),
--  and the columns for delete/edit. Run this whole file once in
--  Supabase → SQL Editor. Safe to re-run.
-- ============================================================

-- Columns -----------------------------------------------------
alter table listings add column if not exists nationwide   boolean default false;
alter table listings add column if not exists active_from   timestamptz;
alter table listings add column if not exists active_until  timestamptz;
alter table listings add column if not exists paid_days     int default 0;
create index if not exists listings_active_until_idx on listings (active_until);

-- Upgraded search: only shows listings inside their paid window,
-- and treats nationwide listings as reachable everywhere ---------
drop function if exists search_listings(text, double precision, double precision, text);

create or replace function search_listings(
  q text,
  user_lat double precision default null,
  user_lng double precision default null,
  want_mode text default null
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
      h.rating, h.review_count, h.name as helper_name, l.headquarters,
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
  limit 30;
$$ language sql stable;

-- ============================================================
--  OPTIONAL: exact-minute auto-cleanup with pg_cron
--  Search already hides expired listings instantly, so this is
--  just housekeeping. If your project has pg_cron enabled, this
--  marks expired listings every minute. If pg_cron isn't enabled,
--  SKIP this block — everything still works without it.
-- ============================================================
-- create extension if not exists pg_cron;
-- select cron.schedule('expire-listings', '* * * * *', $$
--   update listings set is_approved = false
--   where active_until is not null and active_until < now() and is_approved = true;
-- $$);
