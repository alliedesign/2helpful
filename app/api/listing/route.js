// app/api/listing/route.js
// GET /api/listing?id=...  → one listing's full public profile
import { serviceClient } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return Response.json({ error: "id required" }, { status: 400 });
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("listings")
      .select("*, helpers(name, rating, review_count)")
      .eq("id", id)
      .single();
    if (error || !data) return Response.json({ error: "Listing not found." }, { status: 404 });
    const listing = { ...data, helper_name: data.helpers?.name, rating: data.helpers?.rating, review_count: data.helpers?.review_count };
    delete listing.helpers;
    return Response.json({ listing });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
