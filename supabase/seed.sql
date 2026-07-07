-- ============================================================
--  Seed data — run AFTER schema.sql to populate the search.
--  These are sample independent helpers so you can test search
--  immediately. All are pre-approved (is_approved = true).
-- ============================================================

-- Helpers (no user_id — these are demo rows not tied to a login)
insert into helpers (id, name, role, bio, location_text, lat, lng, rating, review_count) values
  ('11111111-1111-1111-1111-111111111111','Maya R.','Listener & life sorter','Warm, unhurried listener and to-do-list finisher.','Portland, OR',45.5152,-122.6784,4.9,312),
  ('22222222-2222-2222-2222-222222222222','Devon T.','Tech & admin fixer','Patient help with printers, passwords, and confusing apps.','Austin, TX',30.2672,-97.7431,5.0,198),
  ('33333333-3333-3333-3333-333333333333','Amara B.','Errands & logistics','The calls you''d rather not make, handled.','Chicago, IL',41.8781,-87.6298,4.9,276),
  ('44444444-4444-4444-4444-444444444444','Priya N.','Paperwork guide','Forms and applications, line by line.','Boston, MA',42.3601,-71.0589,5.0,301),
  ('55555555-5555-5555-5555-555555555555','Ravi C.','Travel & planning','Turns a vague trip idea into a plan that works.','San Diego, CA',32.7157,-117.1611,4.9,233)
on conflict (id) do nothing;

insert into listings (helper_id, business_name, website_url, description, categories, mode, headquarters, lat, lng, is_approved, review_status, attested_independent) values
  ('11111111-1111-1111-1111-111111111111','Maya Helps','mayahelps.example.com','Gentle listening, life-admin sessions, and in-person decluttering around Portland. Someone in your corner for a hard day or a long to-do list.', array['just listening','errands','planning','decluttering'],'both','Portland, OR',45.5152,-122.6784,true,'approved',true),
  ('22222222-2222-2222-2222-222222222222','DevonFixesIt','devonfixesit.example.com','Friendly on-site and remote tech help: printers, wifi, passwords, new devices, and confusing apps. Family-run, locally owned in Austin.', array['tech help','setup','troubleshooting','printers','wifi'],'both','Austin, TX',30.2672,-97.7431,true,'approved',true),
  ('33333333-3333-3333-3333-333333333333','Amara Runs It','amararunsit.example.com','Independent personal concierge: errands, bookings, returns, and the phone calls you keep avoiding. Chicago neighborhoods.', array['errands','concierge','phone calls','bookings'],'both','Chicago, IL',41.8781,-87.6298,true,'approved',true),
  ('44444444-4444-4444-4444-444444444444','Paperwork With Priya','paperworkwithpriya.example.com','Plain-language help with forms, applications, and official letters. Sit-with-you or remote. Small independent practice.', array['paperwork','forms','applications','letters'],'both','Boston, MA',42.3601,-71.0589,true,'approved',true),
  ('55555555-5555-5555-5555-555555555555','Ravi Plans Trips','raviplanstrips.example.com','Independent trip planning — full itineraries, bookings, and routes. No airline or hotel commissions, just honest picks.', array['travel','planning','itinerary','trips'],'virtual','San Diego, CA',32.7157,-117.1611,true,'approved',true)
on conflict do nothing;
