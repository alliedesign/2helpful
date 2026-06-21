// app/components/ChannelBanner.js
"use client";
import { useState } from "react";
import { listingScreenshot, initials, colorFor } from "@/lib/listingImage";

// YouTube-channel-style banner: a wide cover image with a round avatar
// overlapping its bottom-left edge. Falls back cleanly:
//   banner  = uploaded header → website screenshot → color gradient
//   avatar  = uploaded avatar → initials circle
export default function ChannelBanner({ listing, height = 120, avatarSize = 64 }) {
  const headerImg = (listing.header_url && listing.header_url.trim()) || listingScreenshot(listing) || "";
  const avatarImg = (listing.avatar_url && listing.avatar_url.trim()) || "";
  const [bannerOk, setBannerOk] = useState(true);
  const color = colorFor(listing.business_name);

  return (
    <div style={{ position: "relative", marginBottom: avatarSize / 2 }}>
      {/* Banner */}
      <div style={{
        height, borderRadius: 12, overflow: "hidden",
        background: `linear-gradient(135deg, ${color}, var(--teal-ink))`,
      }}>
        {headerImg && bannerOk && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={headerImg} alt="" onError={() => setBannerOk(false)}
               style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        )}
      </div>

      {/* Avatar overlapping the bottom-left edge */}
      <div style={{
        position: "absolute", left: 16, bottom: -avatarSize / 2,
        width: avatarSize, height: avatarSize, borderRadius: "50%",
        border: "3px solid #fff", overflow: "hidden", boxShadow: "0 2px 10px rgba(0,0,0,.18)",
        background: color, display: "flex", alignItems: "center", justifyContent: "center",
        color: "#fff", fontWeight: 800, fontSize: avatarSize * 0.34,
      }}>
        {avatarImg
          // eslint-disable-next-line @next/next/no-img-element
          ? <img src={avatarImg} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : initials(listing.business_name)}
      </div>
    </div>
  );
}
