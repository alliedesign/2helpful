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
