// app/robots.js
// Generates https://helpfulxhumans.com/robots.txt automatically.
// Allows crawling of public pages, blocks private/app areas, points to the sitemap.

import { SITE_URL } from "@/app/lib/seo";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Keep account/admin/API surfaces out of the index.
        disallow: ["/dashboard", "/admin", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
