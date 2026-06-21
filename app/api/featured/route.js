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
      .select("id, business_name, website_url, description, categories, mode, headquarters, image_url, avatar_url, header_url, clicks, featured_until, helpers(name), listing_rating_summary(avg_rating, review_total)")
      .eq("is_approved", true)
      .gt("featured_until", nowIso)        // only currently-featured (paid) listings
      .order("featured_until", { ascending: false })
      .limit(12);

    if (error) {
      console.error("\n[featured error]", error, "\n");
      return Response.json({ error: error.message }, { status: 500 });
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
      rating: l.listing_rating_summary?.avg_rating ?? null,
      review_count: l.listing_rating_summary?.review_total ?? 0,
    }));
    return Response.json({ featured });
  } catch (e) {
    console.error("\n[featured error] Unexpected:", e, "\n");
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
