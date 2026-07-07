-- ============================================================
--  HelpfulxHuman — UPDATE PACK
--  Run this whole file once in Supabase → SQL Editor.
--  Adds: profile images, website-build requests, community posts,
--  and upgrades the search function to return images.
--  Safe to re-run (uses if-not-exists / create-or-replace).
-- ============================================================

-- 1) Profile image on listings -------------------------------
alter table listings add column if not exists image_url text;
alter table listings add column if not exists avatar_url text;
alter table listings add column if not exists header_url text;

-- 2) Website build requests ----------------------------------
create table if not exists website_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  business_name text,
  phone         text,
  about         text,
  budget        text,
  status        text default 'new',
  created_at    timestamptz default now()
);
alter table website_requests enable row level security;
drop policy if exists "anyone can request a website" on website_requests;
create policy "anyone can request a website"
  on website_requests for insert with check (true);

-- 3) Community posts -----------------------------------------
create table if not exists posts (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null,
  author_kind text default 'client',
  body        text,
  image_url   text,
  video_url   text,
  link_url    text,
  created_at  timestamptz default now()
);
create index if not exists posts_created_idx on posts (created_at desc);
alter table posts enable row level security;
drop policy if exists "anyone can read posts" on posts;
create policy "anyone can read posts" on posts for select using (true);
drop policy if exists "anyone can write posts" on posts;
create policy "anyone can write posts" on posts for insert with check (true);

-- 4) Upgrade search to return image_url ----------------------
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
  helper_name text, headquarters text, service_area_miles int,
  image_url text, avatar_url text, header_url text, distance_miles double precision, relevance real
) as $$
  with scored as (
    select
      l.id, l.business_name, l.website_url, l.description, l.categories, l.mode,
      h.rating, h.review_count, h.name as helper_name, l.headquarters,
      l.service_area_miles, l.image_url, l.avatar_url, l.header_url,
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
      and (q = '' or l.search_vector @@ websearch_to_tsquery('english', q)
           or l.business_name ilike '%'||q||'%')
      and (want_mode is null or l.mode = want_mode or l.mode = 'both')
  )
  select id, business_name, website_url, description, categories, mode,
         rating, review_count, helper_name, headquarters, service_area_miles,
         image_url, avatar_url, header_url, distance_miles, relevance
  from scored
  where
    mode = 'virtual'
    or user_lat is null or distance_miles is null
    or distance_miles <= service_area_miles
  order by
    relevance desc nulls last,
    distance_miles asc nulls last,
    rating desc
  limit 30;
$$ language sql stable;
