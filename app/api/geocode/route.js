// app/api/geocode/route.js
// GET /api/geocode?place=Los+Angeles  → { lat, lng }
// Lets the search page turn a typed city into coordinates (reliable
// alternative to browser GPS, which is often blocked on localhost).
import { geocode } from "@/lib/geocode";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const place = searchParams.get("place") || "";
    if (!place.trim()) return Response.json({ error: "No place provided." }, { status: 400 });
    const { lat, lng } = await geocode(place);
    if (lat == null) return Response.json({ error: "Couldn't find that place." }, { status: 404 });
    return Response.json({ lat, lng });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
