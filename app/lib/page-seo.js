// app/lib/page-seo.js
// Drop-in metadata + structured data for the main pages. Each page is a Client
// Component in your current build (it uses hooks), so metadata can't be exported from
// the page file itself. Two clean options per page — pick one:
//
//   OPTION A (recommended): add a tiny server `layout.js` in that route folder and
//   `export const metadata = <the object below>`. The layout just returns children.
//
//   OPTION B: convert the page to a Server Component wrapper that renders your existing
//   client component, and export metadata from the wrapper.
//
// The JSON-LD blocks can be rendered directly inside the client component (they're just
// <script> tags) — see FAQ_JSONLD usage note at the bottom.

import { pageMeta, SITE_URL, SITE_NAME } from "@/app/lib/seo";

/* ----------------------------- HOME ----------------------------- */
export const homeMetadata = pageMeta({
  title: "Find an Independent Helper Near You",
  description:
    "Search real people and mom-and-pop shops who can help — no big corporations, just neighbors with skills. Free to search and contact on Helpful × Humans.",
  path: "/",
});

/* ----------------------------- SEARCH ----------------------------- */
export const searchMetadata = pageMeta({
  title: "Search Independent Helpers",
  description:
    "Search independent, local helpers and small businesses. Free to browse and contact — no corporations, no middleman.",
  path: "/search",
});

/* ----------------------------- BROWSE ----------------------------- */
export const browseMetadata = pageMeta({
  title: "Browse Independent Helpers",
  description:
    "Browse real, independent helpers and mom-and-pop shops across every category. Reviewed before listing, free to contact.",
  path: "/browse",
});

/* ----------------------------- JOIN ----------------------------- */
export const joinMetadata = pageMeta({
  title: "List Your Business — $5/Day",
  description:
    "List your independent business on Helpful × Humans for $5/day and get found by real customers. No corporations to outbid. Reviewed before going live.",
  path: "/join",
});

/* ----------------------------- BUILD MY SITE ----------------------------- */
export const buildSiteMetadata = pageMeta({
  title: "Get a Free Website for Your Business",
  description:
    "No website? We'll build you a clean, mobile-friendly site and list you in search automatically. See real sites we've built for independent businesses.",
  path: "/build-my-site",
});

/* ----------------------------- COMMUNITY ----------------------------- */
export const communityMetadata = pageMeta({
  title: "Community",
  description:
    "Helpers and clients sharing updates, asks, and recommendations on Helpful × Humans.",
  path: "/community",
});

/* ----------------------------- FAQ ----------------------------- */
export const faqMetadata = pageMeta({
  title: "FAQ — How Helpful × Humans Works",
  description:
    "Answers about using Helpful × Humans: how to find and hire helpers, what listings cost, trust & safety, and more.",
  path: "/faq",
});

// Real FAQ content from your site → FAQPage rich-result schema.
// Render <FaqJsonLd /> inside your FAQ page (it's just a script tag, safe in a client
// component). Keeps answers in sync-ish; edit here if your FAQ copy changes.
const FAQ_ITEMS = [
  ["What is Helpful × Humans?",
    "Helpful × Humans is a search engine for independent helpers — real people and small businesses you can find and hire directly. It deliberately excludes big corporations."],
  ["Does it cost anything to search or contact helpers?",
    "No. Searching, browsing, and contacting helpers is completely free for customers. Helpers pay to be listed; you never pay to find them."],
  ["How much does a listing cost?",
    "A basic listing is $5 per day. A featured listing costs more and appears higher in results."],
  ["Are helpers verified or vetted?",
    "Every listing is reviewed before it goes live to keep the marketplace genuine and free of corporations and spam. Always use your own judgment when hiring — check reviews, ask questions, and confirm details directly with the helper."],
  ["Why no big corporations?",
    "Because the people who need work and the neighbors who can do it deserve to find each other without a giant company taking a cut in the middle. Helpful × Humans is built to support real, independent people."],
  ["How do you handle disputes between customers and helpers?",
    "Since you contact and hire helpers directly, any agreement is between you and them. If a listing itself is misleading or breaks our guidelines, report it and we'll review it."],
  ["How do I report a listing or a problem?",
    "DM us on Instagram (@helpfulxhumans) or X (@helpfulxhumans) with the details and we'll look into it quickly."],
  ["Does the site work on mobile?",
    "Yes. Helpful × Humans works on phones, tablets, and computers, so you can search for help wherever you are."],
];

export function FaqJsonLd() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_ITEMS.map(([q, a]) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}

/* --------------------- BREADCRUMBS (optional helper) --------------------- */
// Use on deeper pages (e.g. a listing) for breadcrumb rich results.
export function BreadcrumbJsonLd({ items }) {
  // items: [{ name, path }]
  const ld = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: it.name,
      item: `${SITE_URL}${it.path}`,
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
    />
  );
}
