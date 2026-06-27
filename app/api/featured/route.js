// app/api/featured/route.js
// GET /api/featured  → all approved, currently-featured listings for the home page.
// Helper names and ratings are fetched in separate queries (no PostgREST embeds),
// which avoids the embedded-join row-drop quirk entirely.
import { serviceClient } from "@/lib/supabase";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ error: "Supabase env vars are not set in .env.local" }, { status: 500 });
    }
    const supabase = serviceClient();
    const nowIso = new Date().toISOString();

    // 1) The listings themselves — no helper embed.
    const { data, error } = await supabase
      .from("listings")
      .select("id, business_name, website_url, description, categories, mode, headquarters, image_url, avatar_url, header_url, clicks, featured_until, helper_id")
      .eq("is_approved", true)
      .gt("featured_until", nowIso)
      .order("featured_until", { ascending: false })
      .limit(1000);
    if (error) {
      console.error("\n[featured error]", error, "\n");
      return Response.json({ error: error.message }, { status: 500 });
    }

    const listings = data || [];
    const ids = listings.map((l) => l.id);
    const helperIds = [...new Set(listings.map((l) => l.helper_id).filter(Boolean))];

    // 2) Helper names, looked up separately.
    let helperNameById = {};
    if (helperIds.length) {
      const { data: hs } = await supabase
        .from("helpers")
        .select("id, name")
        .in("id", helperIds);
      for (const h of hs || []) helperNameById[h.id] = h.name;
    }

    // 3) Ratings, looked up separately (unchanged).
    let ratingById = {};
    if (ids.length) {
      const { data: rs } = await supabase
        .from("listing_rating_summary")
        .select("listing_id, avg_rating, review_total")
        .in("listing_id", ids);
      for (const r of rs || []) ratingById[r.listing_id] = r;
    }

    const featured = listings.map((l) => ({
      id: l.id,
      business_name: l.business_name,
      website_url: l.website_url,
      description: l.description,
      categories: l.categories,
      mode: l.mode,
      headquarters: l.headquarters,
