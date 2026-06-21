// app/browse/page.js
"use client";
import { useState } from "react";
import { CATEGORIES, categoryPhoto } from "@/lib/categories";

// Big image-tile grid of categories, like OfferUp's "Popular services near you".
// Clicking a tile runs a search for that category.
export default function BrowsePage() {
  // Skip "general" — it's not a browseable service category.
  const cats = CATEGORIES.filter((c) => c.value !== "general");

  return (
    <main className="wrap" style={{ paddingTop: "2.5rem", paddingBottom: "4rem", maxWidth: 1100 }}>
      <h1 style={{ fontWeight: 800, fontSize: "2rem", letterSpacing: "-.02em", marginBottom: ".4rem" }}>
        Browse helpers by category
      </h1>
      <p style={{ color: "var(--muted)", marginBottom: "2rem" }}>
        Real people and small businesses — pick a category to see who can help.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.1rem" }}>
        {cats.map((c) => (
          <Tile key={c.value} cat={c} />
        ))}
      </div>
    </main>
  );
}

function Tile({ cat }) {
  const [ok, setOk] = useState(true);
  const href = `/search?q=${encodeURIComponent(cat.label)}`;
  return (
    <a href={href} style={{
      position: "relative", display: "block", height: 170, borderRadius: 14, overflow: "hidden",
      textDecoration: "none", background: "linear-gradient(135deg, var(--teal), var(--teal-ink))",
      boxShadow: "0 1px 3px rgba(16,20,23,.12)",
    }}>
      {ok && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={categoryPhoto(cat.value)} alt={cat.label} onError={() => setOk(false)}
             style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
      )}
      {/* dark gradient so the label is always readable */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,.62) 0%, rgba(0,0,0,.05) 55%)" }} />
      <div style={{ position: "absolute", left: 14, bottom: 12, color: "#fff", fontWeight: 800, fontSize: "1.1rem", textShadow: "0 1px 4px rgba(0,0,0,.4)" }}>
        {cat.icon} {cat.label}
      </div>
    </a>
  );
}
