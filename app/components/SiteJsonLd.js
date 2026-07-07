// app/components/SiteJsonLd.js
// Sitewide structured data: Organization + WebSite (with Sitelinks search box).
// Render once in app/layout.js, inside <body>. Helps Google understand the brand,
// show your logo/socials, and enable a search box in results.

import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
} from "@/app/lib/seo";

export default function SiteJsonLd() {
  const org = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    alternateName: "Helpful x Humans",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: SITE_DESCRIPTION,
    sameAs: [
      "https://www.instagram.com/helpfulxhumans",
      "https://x.com/helpfulxhumans",
      "https://www.tiktok.com/@helpful.humans",
      "https://www.youtube.com/@HelpfulxHumans",
    ],
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: SITE_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(website) }}
      />
    </>
  );
}
