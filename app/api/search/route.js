// app/api/search/route.js
// GET /api/search?q=...&lat=..&lng=..&mode=virtual|in_person
import { serviceClient } from "@/lib/supabase";

export async function GET(request) {
  try {
    // Guard: missing env vars are the #1 cause of failures.
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
      return Response.json({ error: "NEXT_PUBLIC_SUPABASE_URL is not set in .env.local" }, { status: 500 });
    }
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return Response.json({ error: "SUPABASE_SERVICE_ROLE_KEY is not set in .env.local" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const lat = searchParams.get("lat") ? Number(searchParams.get("lat")) : null;
    const lng = searchParams.get("lng") ? Number(searchParams.get("lng")) : null;
    const mode = searchParams.get("mode") || null;
    const page = Math.max(1, Number(searchParams.get("page")) || 1);
    const perPage = 100;

    const supabase = serviceClient();
    const { data, error } = await supabase.rpc("search_listings", {
      q,
      user_lat: lat,
      user_lng: lng,
      want_mode: mode,
      max_rows: perPage,
      skip_rows: (page - 1) * perPage,
    });

    if (error) {
      console.error("\n[search error] Supabase returned:", error, "\n");
      return Response.json({ error: error.message || "Supabase query failed", details: error }, { status: 500 });
    }

    // Total count for pagination (best-effort).
    let total = (data ?? []).length;
    const { data: cnt } = await supabase.rpc("count_listings", { q, user_lat: lat, user_lng: lng, want_mode: mode });
    if (typeof cnt === "number") total = cnt;

    return Response.json({ results: data ?? [], total, page, perPage });
  } catch (e) {
    console.error("\n[search error] Unexpected:", e, "\n");
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
