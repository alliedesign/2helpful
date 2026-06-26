// app/api/featured/route.js
// GET /api/featured  → a handful of approved listings to feature on the home page,
// ranked by rating then clicks (most-loved / most-clicked first).
import { serviceClient } from "@/lib/supabase";

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ error: "Supabase env vars are not set in .env.local" }, { status: 500 });
    }
    const supabase = serviceClient();
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("listings")
     .select("id, business_name, website_url, description, categories, mode, headquarters, image_url, avatar_url, header_url, clicks, featured_until, helpers!left(name)")
      .eq("is_approved", true)
      .gt("featured_until", nowIso)        // only currently-featured listings
      .order("featured_until", { ascending: false })
      .limit(1000);                       // effectively unlimited — show all featured

    if (error) {
      console.error("\n[featured error]", error, "\n");
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Ratings are looked up separately from the summary view (avoids a fragile
    // embedded-relationship join that PostgREST can't resolve on a view).
    const ids = (data || []).map((l) => l.id);
    let ratingById = {};
    if (ids.length) {
      const { data: rs } = await supabase
        .from("listing_rating_summary")
        .select("listing_id, avg_rating, review_total")
        .in("listing_id", ids);
      for (const r of rs || []) ratingById[r.listing_id] = r;
    }

    // Flatten the joined helper fields for easy use on the client.
    const featured = (data || []).map((l) => ({
      id: l.id,
      business_name: l.business_name,
      website_url: l.website_url,
      description: l.description,
      categories: l.categories,
      mode: l.mode,
      headquarters: l.headquarters,
      image_url: l.image_url,
      avatar_url: l.avatar_url,
      header_url: l.header_url,
      helper_name: l.helpers?.name || "",
      rating: ratingById[l.id]?.avg_rating ?? null,
      review_count: ratingById[l.id]?.review_total ?? 0,
    }));
    return Response.json({ featured });
  } catch (e) {
    console.error("\n[featured error] Unexpected:", e, "\n");
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
