// app/components/ListingImage.js
"use client";
import { useState } from "react";
import { listingPhoto, listingScreenshot, listingAvatar, initials, colorFor } from "@/lib/listingImage";

// Shows colorful initials immediately. If the helper has a real photo it loads
// on top right away; otherwise a website screenshot loads quietly underneath
// and only appears once it's actually ready (so no "Generating Preview…" box).
export default function ListingImage({ listing, height = 150, rounded = 12 }) {
  // Banner prefers an uploaded header or website screenshot — NOT the avatar,
  // so the round avatar overlay isn't drawn on top of itself.
  const header = (listing.header_url && listing.header_url.trim()) || "";
  const shot = header ? "" : listingScreenshot(listing);
  const candidate = header || shot;
  const avatar = listingAvatar(listing);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showImage = candidate && loaded && !failed;

  return (
    <div style={{
      position: "relative", height, borderRadius: rounded, overflow: "hidden",
      background: `linear-gradient(135deg, ${colorFor(listing.business_name)}, var(--teal-ink))`,
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {/* Initials layer — always present, covered once the image loads */}
      <span style={{ color: "#fff", fontWeight: 800, fontSize: height > 110 ? "2rem" : "1.4rem", opacity: showImage ? 0 : 1 }}>
        {initials(listing.business_name)}
      </span>

      {candidate && !failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={candidate}
          alt={listing.business_name}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          style={{
            position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
            opacity: showImage ? 1 : 0, transition: "opacity .4s ease",
          }}
        />
      )}

      {showImage && (
        <div style={{
          position: "absolute", left: 12, bottom: 12, background: "rgba(0,0,0,.55)", color: "#fff",
          padding: ".25rem .7rem", borderRadius: 999, fontWeight: 700, fontSize: ".9rem",
        }}>
          {listing.business_name}
        </div>
      )}

      {/* Userpic overlay (round), if the helper uploaded one */}
      {avatar && (
        <div style={{
          position: "absolute", right: 12, bottom: 12, width: 48, height: 48, borderRadius: "50%",
          overflow: "hidden", border: "3px solid #fff", boxShadow: "0 2px 8px rgba(0,0,0,.25)",
        }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={avatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}
    </div>
  );
}
