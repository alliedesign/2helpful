// app/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { listingImage, initials, colorFor } from "@/lib/listingImage";
import ListingImage from "@/app/components/ListingImage";

export default function Home() {
  const [q, setQ] = useState("");
  const [featured, setFeatured] = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/featured")
      .then((r) => r.json())
      .then((j) => setFeatured(j.featured || []))
      .catch(() => setFeatured([]))
      .finally(() => setLoadingFeatured(false));
  }, []);

  function clickThrough(r) {
    fetch("/api/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: r.id, q: "" }),
    });
    const url = r.website_url.startsWith("http") ? r.website_url : "https://" + r.website_url;
    window.open(url, "_blank", "noopener");
  }

  function modeLabel(m) {
    if (m === "virtual") return "🌐 Virtual";
    if (m === "in_person") return "📍 In person";
    return "🌐 Virtual + 📍 In person";
  }

  return (
    <main className="wrap" style={{ paddingTop: "8vh", paddingBottom: "4rem" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.4rem)", fontWeight: 800, letterSpacing: "-.03em" }}>
          Find an <span style={{ color: "var(--teal)", fontStyle: "italic" }}>independent</span> helper near you.
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.1rem", margin: "1rem auto 2rem", maxWidth: "46ch" }}>
          Search real people and mom-and-pop shops who can help. No big corporations — just neighbors with skills.
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); router.push(`/search?q=${encodeURIComponent(q)}`); }}
          style={{ display: "flex", maxWidth: 600, margin: "0 auto", border: "1px solid var(--silver)",
                   borderRadius: 999, padding: 6, boxShadow: "0 8px 30px rgba(16,20,23,.08)" }}
        >
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Try “fix a leaky sink” or “someone to talk to”"
            style={{ flex: 1, border: "none", outline: "none", padding: ".8rem 1.2rem", borderRadius: 999 }}
          />
          <button className="btn" style={{ borderRadius: 999 }}>Search</button>
        </form>
        <div style={{ marginTop: "1.4rem", color: "var(--muted)", fontSize: ".9rem" }}>
          Are you a helper?{" "}
          <a href="/join" style={{ color: "var(--teal-deep)", fontWeight: 600 }}>List your business →</a>
        </div>
      </div>

      {/* Featured helpers */}
      <section style={{ marginTop: "4rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "1.4rem" }}>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, letterSpacing: "-.02em" }}>⭐ Featured helpers</h2>
          <a href="/search" style={{ color: "var(--teal-deep)", fontWeight: 600, fontSize: ".92rem" }}>Browse all →</a>
        </div>

        {loadingFeatured && <p style={{ color: "var(--muted)" }}>Loading helpers…</p>}
        {!loadingFeatured && featured.length === 0 && (
          <p style={{ color: "var(--muted)" }}>
            No helpers yet — <a href="/join" style={{ color: "var(--teal-deep)", fontWeight: 600 }}>be the first to list your business</a>.
          </p>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1.2rem" }}>
          {featured.map((r) => (
            <article
              key={r.id}
              onClick={() => { window.location.href = `/listing/${r.id}`; }}
              style={{
                border: "1px solid var(--line)", borderRadius: 16, overflow: "hidden",
                background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column",
                transition: "transform .18s, box-shadow .18s",
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 34px rgba(16,20,23,.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
            >
              {/* instant initials, image fades in when ready */}
              <ListingImage listing={r} height={150} rounded={0} />

              <div style={{ padding: "1rem 1.2rem 1.2rem", display: "flex", flexDirection: "column", flexGrow: 1 }}>
                <div style={{ fontSize: ".82rem", color: "var(--teal-deep)", fontWeight: 600, marginBottom: ".5rem" }}>
                  {modeLabel(r.mode)}{r.headquarters ? " · 🏠 " + r.headquarters : ""}
                </div>
                <p style={{ color: "var(--ink)", fontSize: ".94rem", flexGrow: 1 }}>{r.description}</p>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderTop: "1px solid var(--line)", paddingTop: ".8rem", marginTop: ".9rem" }}>
                  <span style={{ color: "var(--muted)", fontSize: ".85rem" }}>
                    {r.helper_name}
                    {r.rating != null
                      ? <> · <span style={{ color: "var(--star, #f6a609)" }}>★</span> {Number(r.rating).toFixed(1)} ({r.review_count})</>
                      : <> · No reviews yet</>}
                  </span>
                  <span style={{ color: "var(--teal-deep)", fontWeight: 700, fontSize: ".88rem" }}>Visit ↗</span>
                </div>
                {r.categories?.length ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: ".35rem", marginTop: ".7rem" }}>
                    {r.categories.slice(0, 3).map((c, i) => (
                      <span key={i} style={{ background: "var(--silver-bg)", borderRadius: 999, padding: ".2rem .6rem", fontSize: ".72rem", color: "var(--ink)" }}>{c}</span>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
