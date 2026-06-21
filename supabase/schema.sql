-- ============================================================
--  Helpful x Human — Supabase schema
--  Run this in Supabase: SQL Editor → New query → paste → Run
-- ============================================================

-- Extensions (Supabase has these available)
create extension if not exists pg_trgm;        -- fuzzy text matching
-- (No geo extension needed — distance is computed with plain math below.)

-- ------------------------------------------------------------
-- HELPERS  (one row per independent person, linked to an auth user)
-- ------------------------------------------------------------
create table if not exists helpers (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid unique references auth.users(id) on delete cascade,
  name          text not null,
  email         text,
  role          text,                       -- e.g. "Listener & life sorter"
  bio           text,
  location_text text,                        -- "Portland, OR"
  lat           double precision,
  lng           double precision,
  rating        numeric(2,1) default 5.0,
  review_count  int default 0,
  created_at    timestamptz default now()
);

-- ------------------------------------------------------------
-- LISTINGS  (a helper's business + their OWN external website)
-- This is what the search engine returns.
-- ------------------------------------------------------------
create table if not exists listings (
  id                 uuid primary key default gen_random_uuid(),
  helper_id          uuid references helpers(id) on delete cascade,
  business_name      text not null,
  website_url        text not null,
  description        text not null,
  headquarters       text,                    -- where the helper is based, e.g. "Austin, TX"
  categories         text[] default '{}',     -- ['plumbing','errands']
  mode               text default 'both',     -- 'virtual' | 'in_person' | 'both'
  service_area_miles int default 25,
  lat                double precision,
  lng                double precision,

  -- gatekeeping
  is_approved        boolean default false,   -- shown in search only when true
  review_status      text default 'pending',  -- 'pending' | 'approved' | 'rejected'
  corp_flags         jsonb default '[]',      -- auto-detected red flags
  corp_score         int default 0,           -- higher = more likely a big corp
  attested_independent boolean default false, -- helper checked the box

  -- search
  search_vector      tsvector,
  clicks             int default 0,
  created_at         timestamptz default now()
);

-- Full-text search vector: weight name highest, then categories, then description
create or replace function listings_search_refresh() returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.business_name,'')), 'A') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.categories,'{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description,'')), 'C');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_listings_search on listings;
create trigger trg_listings_search
  before insert or update on listings
  for each row execute function listings_search_refresh();

create index if not exists idx_listings_search on listings using gin(search_vector);
create index if not exists idx_listings_trgm   on listings using gin (business_name gin_trgm_ops);
create index if not exists idx_listings_approved on listings(is_approved);

-- ------------------------------------------------------------
-- SERVICES (the helper's own priced services, virtual/in-person)
-- ------------------------------------------------------------
create table if not exists services (
  id          uuid primary key default gen_random_uuid(),
  helper_id   uuid references helpers(id) on delete cascade,
  name        text not null,
  price       numeric(10,2) not null,
  unit        text default 'session',
  mode        text default 'virtual',
  created_at  timestamptz default now()
);

-- ------------------------------------------------------------
-- REVIEWS
-- ------------------------------------------------------------
create table if not exists reviews (
  id          uuid primary key default gen_random_uuid(),
  helper_id   uuid references helpers(id) on delete cascade,
  author_name text,
  stars       int check (stars between 1 and 5),
  text        text,
  created_at  timestamptz default now()
);

-- ------------------------------------------------------------
-- BOOKINGS  (drives the Top Helpers leaderboard)
-- ------------------------------------------------------------
create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  helper_id   uuid references helpers(id) on delete cascade,
  channel     text,                       -- 'text' | 'call' | 'video' | 'in_person'
  created_at  timestamptz default now()
);

-- Leaderboard view: counts bookings per helper for day / week / month
create or replace view leaderboard as
select
  h.id, h.name, h.role, h.rating,
  count(*) filter (where b.created_at >= now() - interval '1 day')   as day,
  count(*) filter (where b.created_at >= now() - interval '7 days')  as week,
  count(*) filter (where b.created_at >= now() - interval '30 days') as month
from helpers h
left join bookings b on b.helper_id = h.id
group by h.id;

-- ------------------------------------------------------------
-- SEARCH LOG (every query + which result got clicked → improves ranking)
-- ------------------------------------------------------------
create table if not exists search_log (
  id                 uuid primary key default gen_random_uuid(),
  query              text,
  clicked_listing_id uuid references listings(id),
  created_at         timestamptz default now()
);

-- ============================================================
--  ROW LEVEL SECURITY
--  Anyone can READ approved listings. Helpers can only edit THEIR own.
-- ============================================================
alter table helpers  enable row level security;
alter table listings enable row level security;
alter table services enable row level security;
alter table reviews  enable row level security;

-- Public can read approved listings
create policy "public reads approved listings"
  on listings for select
  using (is_approved = true);

-- A helper can read all of their own listings (even unapproved)
create policy "owner reads own listings"
  on listings for select
  using (helper_id in (select id from helpers where user_id = auth.uid()));

-- A helper can insert/update/delete their own listings
create policy "owner writes own listings"
  on listings for all
  using (helper_id in (select id from helpers where user_id = auth.uid()))
  with check (helper_id in (select id from helpers where user_id = auth.uid()));

-- Helpers table: public can read; a user can edit their own helper row
create policy "public reads helpers"   on helpers for select using (true);
create policy "user writes own helper" on helpers for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Services + reviews: public read
create policy "public reads services" on services for select using (true);
create policy "public reads reviews"  on reviews  for select using (true);
create policy "owner writes services" on services for all
  using (helper_id in (select id from helpers where user_id = auth.uid()))
  with check (helper_id in (select id from helpers where user_id = auth.uid()));

-- NOTE: the admin review queue and search-ranking writes use the
-- service-role key on the server, which bypasses RLS. Never expose that key.

-- ============================================================
--  SEARCH FUNCTION  (called by the API)
--  Ranks by text relevance, then distance, then rating, then clicks.
-- ============================================================
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

-- Increment a listing's click count (called when a client clicks through)
create or replace function record_click(listing uuid, q text)
returns void as $$
  insert into search_log(query, clicked_listing_id) values (q, listing);
  update listings set clicks = clicks + 1 where id = listing;
$$ language sql;
