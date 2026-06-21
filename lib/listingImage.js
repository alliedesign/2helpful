// lib/listingImage.js
// Decide what image to show for a listing, with graceful fallbacks:
//   1. A photo/logo the helper pasted (image_url)
//   2. An automatic screenshot of their website (free, no API key)
//   3. null  → the card shows colorful initials instead
//
// The screenshot uses WordPress's free mShots service, which renders any
// public URL to an image. It's best-effort: if a site can't be shot, the
// card still falls back to initials.

export function cleanUrl(websiteUrl) {
  if (!websiteUrl) return "";
  return websiteUrl.startsWith("http") ? websiteUrl : "https://" + websiteUrl;
}

export function screenshotUrl(websiteUrl, w = 600, h = 400) {
  const site = cleanUrl(websiteUrl);
  if (!site) return "";
  // example.com placeholders won't produce a useful shot; skip them.
  if (site.includes("example.com")) return "";
  return `https://s0.wp.com/mshots/v1/${encodeURIComponent(site)}?w=${w}&h=${h}`;
}

// Returns ONLY a real photo the helper provided (instant), or "".
// Priority: uploaded header banner → uploaded avatar → pasted image_url.
export function listingPhoto(listing) {
  if (listing?.header_url && listing.header_url.trim()) return listing.header_url.trim();
  if (listing?.image_url && listing.image_url.trim()) return listing.image_url.trim();
  if (listing?.avatar_url && listing.avatar_url.trim()) return listing.avatar_url.trim();
  return "";
}

export function listingAvatar(listing) {
  return (listing?.avatar_url && listing.avatar_url.trim()) ? listing.avatar_url.trim() : "";
}

// Returns the auto website screenshot URL, or "" if not applicable.
// This may be slow the first time (the screenshot service generates it),
// so the UI should show initials first and let this load underneath.
export function listingScreenshot(listing) {
  return screenshotUrl(listing?.website_url);
}

// Backwards-compatible: best image overall (photo, else screenshot).
export function listingImage(listing) {
  return listingPhoto(listing) || listingScreenshot(listing) || "";
}

export function initials(name) {
  return (name || "?").split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export function colorFor(name) {
  const palette = ["#0eb6a4", "#0a8e80", "#1aa6d8", "#13a594", "#0d7d71", "#2a3640"];
  let h = 0;
  for (let i = 0; i < (name || "").length; i++) h = (h * 31 + name.charCodeAt(i)) % palette.length;
  return palette[h];
}
