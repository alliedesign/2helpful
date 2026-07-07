// lib/geocode.js
// Convert a place name like "Austin, TX" into { lat, lng } coordinates.
// Uses OpenStreetMap's Nominatim — free, no API key required.
// Nominatim asks that you identify your app and not hammer it; for a real
// production app at scale, switch to a paid geocoder (Google/Mapbox) or
// self-host Nominatim. For development and modest traffic this is fine.

export async function geocode(place) {
  if (!place || !place.trim()) return { lat: null, lng: null };
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", place);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    const res = await fetch(url, {
      headers: {
        // Nominatim requires a descriptive User-Agent identifying your app.
        "User-Agent": "HelpfulxHuman/1.0 (listing geocoder)",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return { lat: null, lng: null };
    const data = await res.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lat: Number(data[0].lat), lng: Number(data[0].lon) };
    }
    return { lat: null, lng: null };
  } catch {
    return { lat: null, lng: null };
  }
}
