// app/sitemap.js
// Generates https://helpfulxhumans.com/sitemap.xml automatically.
// Next.js App Router picks this up with no extra config.
//
// If you already added the blog, this imports its posts so everything lives in ONE
// sitemap. If the blog isn't installed yet, delete the POSTS import + the `blog` block.

import { SITE_URL } from "@/app/lib/seo";

// Optional: pull blog posts if the blog package is installed.
let POSTS = [];
try {
  // eslint-disable-next-line global-require
  POSTS = require("@/app/lib/posts").POSTS || [];
} catch {
  POSTS = [];
}

export default function sitemap() {
  const now = new Date();

  // Core, indexable pages. (Left out: /dashboard, /admin, /join success states, etc.)
  const core = [
    { url: `${SITE_URL}/`, changeFrequency: "daily", priority: 1.0 },
    { url: `${SITE_URL}/search`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/browse`, changeFrequency: "daily", priority: 0.8 },
    { url: `${SITE_URL}/join`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/build-my-site`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/community`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/faq`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ].map((e) => ({ ...e, lastModified: now }));

  const blog = POSTS.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...core, ...blog];
}

/*
 * WANT LISTING PAGES IN THE SITEMAP TOO? (recommended once you have listings)
 * Make this function async and fetch approved listings from Supabase:
 *
 *   import { serviceClient } from "@/app/lib/supabase";
 *   export default async function sitemap() {
 *     const supabase = serviceClient();
 *     const { data } = await supabase
 *       .from("listings")
 *       .select("id, updated_at")
 *       .eq("status", "approved");   // adjust to your schema
 *     const listings = (data || []).map((l) => ({
 *       url: `${SITE_URL}/listing/${l.id}`,
 *       lastModified: l.updated_at ? new Date(l.updated_at) : now,
 *       changeFrequency: "weekly",
 *       priority: 0.7,
 *     }));
 *     return [...core, ...blog, ...listings];
 *   }
 */
