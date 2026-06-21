// app/search/page.js
"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { listingImage, initials, colorFor } from "@/lib/listingImage";
import ListingImage from "@/app/components/ListingImage";
import ChannelBanner from "@/app/components/ChannelBanner";

function resultImage(r) { return listingImage(r); }

function SearchInner() {
  const params = useSearchParams();
  const router = useRouter();
  const [q, setQ] = useState(params.get("q") || "");
  const [mode, setMode] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [err, setErr] = useState("");
  const [coords, setCoords] = useState(null);   // {lat, lng} once the user shares location
  const [locating, setLocating] = useState(false);
  const [city, setCity] = useState("");
  const [cityLabel, setCityLabel] = useState("");
  const [hovered, setHovered] = useState(null);   // {id, src, x, y} for website preview popup
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [selected, setSelected] = useState(null);   // listing shown in the right detail panel
  const perPage = 100;

  function useMyLocation() {
    if (!navigator.geolocation) { setErr("Your browser can't share location — type your city below instead."); return; }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setCoords(c);
        setCityLabel("your location");
        setLocating(false);
        runSearch(q, mode, c);
      },
      () => {
        setLocating(false);
        setErr("Your browser blocked location access. Type your city in the box instead — it works the same way.");
      },
      { timeout: 8000 }
    );
  }

  async function useCity(e) {
    if (e) e.preventDefault();
    if (!city.trim()) return;
    setLocating(true);
    setErr("");
    try {
      const res = await fetch("/api/geocode?place=" + encodeURIComponent(city));
      const j = await res.json();
      if (!res.ok || j.error || j.lat == null) {
        setErr("Couldn't find “" + city + "”. Try a city and state, e.g. “Los Angeles, CA”.");
        setLocating(false);
        return;
      }
      const c = { lat: j.lat, lng: j.lng };
      setCoords(c);
      setCityLabel(city);
      setLocating(false);
      runSearch(q, mode, c);
    } catch (e2) {
      setErr("Location lookup failed: " + e2.message);
      setLocating(false);
    }
  }

  function clearLocation() {
    setCoords(null);
    setCityLabel("");
    setCity("");
    runSearch(q, mode, null);
  }

  async function runSearch(query, m, c, pg = 1) {
    const loc = c || coords;
    setLoading(true);
    setSearched(true);
    setErr("");
    try {
      const url = new URL("/api/search", window.location.origin);
      if (query) url.searchParams.set("q", query);
      if (m) url.searchParams.set("mode", m);
      if (loc) { url.searchParams.set("lat", loc.lat); url.searchParams.set("lng", loc.lng); }
      url.searchParams.set("page", pg);
      const res = await fetch(url);
      const text = await res.text();
      let json = {};
      try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
      if (!res.ok || json.error) {
        setErr(json.error || `Search failed (HTTP ${res.status}). Check your Supabase settings in .env.local, then restart the dev server.`);
        setResults([]);
      } else {
        setResults(json.results || []);
        setSelected((json.results || [])[0] || null);
        setTotal(json.total || 0);
        setPage(json.page || pg);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (e) {
      setErr("Could not reach the search API. Is the dev server running? " + e.message);
      setResults([]);
    }
    setLoading(false);
  }

  useEffect(() => {
    const initial = params.get("q") || "";
    if (initial) runSearch(initial, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function submit(e) {
    e.preventDefault();
    router.replace(`/search?q=${encodeURIComponent(q)}`);
    runSearch(q, mode);
  }

  async function clickThrough(r) {
    // log the click (improves ranking), then open their site
    fetch("/api/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: r.id, q }),
    });
    const url = r.website_url.startsWith("http") ? r.website_url : "https://" + r.website_url;
    window.open(url, "_blank", "noopener");
  }

  return (
    <main className="wrap" style={{ paddingTop: "2rem", paddingBottom: "4rem", maxWidth: 1000 }}>
      <form onSubmit={submit} style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for help…"
          style={{ flex: 1, border: "1px solid var(--silver)", borderRadius: 9, padding: ".75rem 1rem", outline: "none" }}
        />
        <button className="btn">Search</button>
      </form>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        {[["", "All"], ["virtual", "🌐 Virtual"], ["in_person", "📍 In person"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => { setMode(val); runSearch(q, val); }}
            style={{
              border: "1px solid " + (mode === val ? "var(--teal)" : "var(--silver)"),
              background: mode === val ? "var(--teal-wash)" : "#fff",
              color: mode === val ? "var(--teal-deep)" : "var(--muted)",
              borderRadius: 999, padding: ".45rem 1rem", fontWeight: 600, cursor: "pointer", fontSize: ".88rem",
            }}
          >
            {label}
          </button>
        ))}
        <button
          onClick={useMyLocation}
          style={{
            border: "1px solid " + (coords ? "var(--teal)" : "var(--silver)"),
            background: coords ? "var(--teal-wash)" : "#fff",
            color: coords ? "var(--teal-deep)" : "var(--muted)",
            borderRadius: 999, padding: ".45rem 1rem", fontWeight: 600, cursor: "pointer", fontSize: ".88rem",
          }}
        >
          {locating ? "Locating…" : coords ? "📍 Near " + (cityLabel || "you") + " ✓" : "📍 Use my location"}
        </button>
      </div>

      {/* Reliable fallback: type a city. Works even when the browser blocks GPS. */}
      <form onSubmit={useCity} style={{ display: "flex", gap: 8, marginBottom: "1rem", flexWrap: "wrap", alignItems: "center" }}>
        <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>or type your city:</span>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Los Angeles, CA"
          style={{ border: "1px solid var(--silver)", borderRadius: 999, padding: ".4rem .9rem", fontSize: ".88rem", minWidth: 180 }}
        />
        <button type="submit" style={{
          border: "1px solid var(--teal)", background: "var(--teal-wash)", color: "var(--teal-deep)",
          borderRadius: 999, padding: ".4rem 1rem", fontWeight: 600, cursor: "pointer", fontSize: ".85rem",
        }}>
          Set location
        </button>
        {coords && (
          <button type="button" onClick={clearLocation} style={{
            border: "none", background: "none", color: "var(--muted)", cursor: "pointer", fontSize: ".82rem", textDecoration: "underline",
          }}>
            clear
          </button>
        )}
      </form>
      <p style={{ color: "var(--muted)", fontSize: ".82rem", marginBottom: "1.4rem" }}>
        {coords
          ? `📍 Near ${cityLabel || "you"} — showing in-person helpers whose service area reaches you, plus all virtual helpers.`
          : "Tip: share your location (or type your city) to see only in-person helpers who actually serve your area."}
      </p>

      {loading && <p style={{ color: "var(--muted)" }}>Searching…</p>}
      {err && (
        <div style={{ background: "#fde8e8", border: "1px solid #f3c0c0", color: "#b13b3b",
                      borderRadius: 10, padding: "1rem 1.1rem", marginBottom: "1rem", fontSize: ".92rem" }}>
          <strong>Search error:</strong> {err}
        </div>
      )}
      {!loading && searched && results.length === 0 && (
        <p style={{ color: "var(--muted)" }}>
          No independent helpers matched that yet. Try different words — or{" "}
          <a href="/join" style={{ color: "var(--teal-deep)", fontWeight: 600 }}>list your own business</a>.
        </p>
      )}

      {!loading && results.length > 0 && (
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
          {/* LEFT: scrollable list of businesses */}
          <div style={{ flex: "0 0 42%", maxWidth: 460 }}>
            {results.map((r) => {
              const isSel = selected && selected.id === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => setSelected(r)}
                  style={{
                    display: "flex", gap: ".9rem", padding: "1rem", cursor: "pointer",
                    border: "1px solid " + (isSel ? "var(--teal)" : "transparent"),
                    background: isSel ? "var(--teal-wash)" : "transparent",
                    borderRadius: 14, marginBottom: ".4rem", transition: "background .15s",
                  }}
                >
                  <div style={{ width: 56, height: 56, flexShrink: 0, borderRadius: "50%", overflow: "hidden",
                                background: `linear-gradient(135deg, ${colorFor(r.business_name)}, var(--teal-ink))`,
                                display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800 }}>
                    {r.avatar_url
                      // eslint-disable-next-line @next/next/no-img-element
                      ? <img src={r.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      : initials(r.business_name)}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "1.02rem" }}>{r.business_name}</div>
                    <div style={{ fontSize: ".85rem", color: "var(--muted)", marginTop: ".1rem" }}>
                      {r.rating != null
                        ? <><span style={{ color: "#f6a609" }}>★</span> {Number(r.rating).toFixed(1)} ({r.review_count})</>
                        : <span>No reviews yet</span>}
                    </div>
                    <div style={{ fontSize: ".85rem", color: "var(--muted)", marginTop: ".1rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.mode === "virtual" ? "🌐 Virtual" : r.mode === "in_person" ? "📍 In person" : "🌐 + 📍"}
                      {r.nationwide ? " · 🇺🇸 Nationwide" : (r.headquarters ? " · " + r.headquarters : "")}
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Pagination under the list */}
            {total > perPage && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: ".8rem", marginTop: "1rem" }}>
                <button onClick={() => runSearch(q, mode, coords, page - 1)} disabled={page <= 1}
                  style={{ border: "1px solid var(--silver)", background: "#fff", borderRadius: 999, padding: ".4rem .9rem", fontWeight: 600, cursor: page <= 1 ? "not-allowed" : "pointer", opacity: page <= 1 ? 0.5 : 1 }}>← Prev</button>
                <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>Page {page} / {Math.ceil(total / perPage)}</span>
                <button onClick={() => runSearch(q, mode, coords, page + 1)} disabled={page >= Math.ceil(total / perPage)}
                  style={{ border: "1px solid var(--silver)", background: "#fff", borderRadius: 999, padding: ".4rem .9rem", fontWeight: 600, cursor: page >= Math.ceil(total / perPage) ? "not-allowed" : "pointer", opacity: page >= Math.ceil(total / perPage) ? 0.5 : 1 }}>Next →</button>
              </div>
            )}
          </div>

          {/* RIGHT: detail panel for the selected business */}
          {selected && (
            <div style={{ flex: 1, position: "sticky", top: "1rem", border: "1px solid var(--line)", borderRadius: 18, overflow: "hidden", background: "#fff" }}>
              <ChannelBanner listing={selected} height={150} avatarSize={76} />
              <div style={{ padding: "0 1.4rem 1.4rem" }}>
                <h2 style={{ fontWeight: 800, fontSize: "1.5rem", letterSpacing: "-.02em" }}>{selected.business_name}</h2>
                <div style={{ color: "var(--muted)", margin: ".2rem 0 .9rem" }}>
                  {selected.rating != null
                    ? <><span style={{ color: "#f6a609" }}>★</span> {Number(selected.rating).toFixed(1)} ({selected.review_count}) · {selected.helper_name}</>
                    : <>No reviews yet · {selected.helper_name}</>}
                </div>

                <button onClick={() => clickThrough(selected)} className="btn" style={{ width: "100%", marginBottom: "1rem" }}>
                  Visit website ↗
                </button>
                <a href={`/listing/${selected.id}`} style={{ display: "block", textAlign: "center", color: "var(--teal-deep)", fontWeight: 600, fontSize: ".9rem", marginBottom: "1.2rem" }}>
                  See full profile & reviews →
                </a>

                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: ".4rem" }}>About</h3>
                <p style={{ fontSize: ".96rem", lineHeight: 1.6, marginBottom: "1.2rem" }}>{selected.description}</p>

                <h3 style={{ fontWeight: 700, fontSize: "1.05rem", marginBottom: ".4rem" }}>Details</h3>
                <div style={{ fontSize: ".92rem", color: "var(--ink)", display: "flex", flexDirection: "column", gap: ".4rem" }}>
                  <div>🌐 {selected.mode === "virtual" ? "Virtual" : selected.mode === "in_person" ? "In person" : "Virtual + In person"}
                    {selected.nationwide ? " · 🇺🇸 Nationwide" : (selected.headquarters ? ` · within ${selected.service_area_miles} mi of ${selected.headquarters}` : "")}</div>
                  {selected.headquarters && <div>📍 Based in {selected.headquarters}</div>}
                  {selected.distance_miles != null && <div>📏 {Math.round(selected.distance_miles)} miles from you</div>}
                  <div>🔗 <span style={{ color: "var(--teal-deep)" }}>{(selected.website_url || "").replace(/^https?:\/\//, "")}</span></div>
                </div>

                {selected.categories?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginTop: "1rem" }}>
                    {selected.categories.map((c, i) => (
                      <span key={i} style={{ background: "var(--silver-bg)", borderRadius: 999, padding: ".25rem .7rem", fontSize: ".8rem" }}>{c}</span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<main className="wrap" style={{ paddingTop: "2rem" }}>Loading…</main>}>
      <SearchInner />
    </Suspense>
  );
}
