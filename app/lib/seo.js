// app/lib/seo.js
// Central SEO config for Helpful × Humans. Import SITE_URL and defaultMetadata
// into app/layout.js, and use the helpers for per-page metadata.

export const SITE_URL = "https://helpfulxhumans.com";
export const SITE_NAME = "Helpful × Humans";
export const SITE_TAGLINE = "Search independent helpers near you";
export const SITE_DESCRIPTION =
  "Helpful × Humans is a free search engine for independent helpers — real people and mom-and-pop shops you can hire directly. No corporations, no middleman.";
export const TWITTER_HANDLE = "@helpfulxhumans";
export const DEFAULT_OG = `${SITE_URL}/og/default.png`; // 1200×630

// Root metadata. Spread into app/layout.js `export const metadata`.
// metadataBase lets Next resolve all relative OG/canonical URLs to absolute ones.
export const defaultMetadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "independent helpers",
    "hire local help",
    "local service directory",
    "mom and pop shops",
    "independent contractors",
    "small business directory",
    "find a helper near me",
    "no corporations",
  ],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  alternates: { canonical: "/" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: [
      {
        url: DEFAULT_OG,
        width: 1200,
        height: 630,
        alt: "Helpful × Humans — a search engine for independent helpers.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    site: TWITTER_HANDLE,
    creator: TWITTER_HANDLE,
    images: [DEFAULT_OG],
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
  category: "business",
};

// Helper to build clean per-page metadata anywhere in the app.
// Usage in a page/route:  export const metadata = pageMeta({ title, description, path });
export function pageMeta({ title, description, path = "/", image, noindex = false }) {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description: description || SITE_DESCRIPTION,
    alternates: { canonical: path },
    robots: noindex ? { index: false, follow: false } : undefined,
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title,
      description: description || SITE_DESCRIPTION,
      images: [image || DEFAULT_OG],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description || SITE_DESCRIPTION,
      images: [image || DEFAULT_OG],
    },
  };
}
