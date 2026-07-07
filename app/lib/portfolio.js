// app/lib/portfolio.js
// Real sites Helpful × Humans has built.
// Logos + snapshots are self-hosted static images under /public/portfolio/.
// To swap in a real capture, just replace the matching file in public/portfolio/ —
// no code changes needed. Filenames are derived from `slug` below.

export const PORTFOLIO = [
  {
    slug: "allworkallgain",
    name: "All Work All Gain",
    domain: "allworkallgain.com",
    tag: "Youth basketball / training",
    desc:
      "A bold, athletic site for Rosser Basketball — training, drills, and program info built to convert parents and players.",
    color: "#e8542b",
    color2: "#111827",
    initials: "AW",
  },
  {
    slug: "rjrworldwide",
    name: "RJR Worldwide",
    domain: "rjrworldwide.com",
    tag: "Industrial / logistics",
    desc:
      "A sharp corporate site for a two-division operator — global chemical sourcing and FedEx Linehaul acquisitions — with scroll-driven storytelling.",
    color: "#1e3a5f",
    color2: "#06101d",
    initials: "RJR",
  },
  {
    slug: "astrologyserene",
    name: "Astrology Serene",
    domain: "astrologyserene.com",
    tag: "Astrology / readings",
    desc:
      "A dreamy, celestial booking site with an interactive reading wheel, a full menu of chart readings, and a free birth-chart calculator.",
    color: "#7c5cff",
    color2: "#241b4d",
    initials: "AS",
  },
  {
    slug: "vibesnvolume",
    name: "Vibes n Volume",
    domain: "vibesnvolume.com",
    tag: "Hairstylist / beauty",
    desc:
      "A playful, page-flipping \u201Cstylist journal\u201D for a Temecula colorist — portfolio, service menu, and booking styled like a keepsake book.",
    color: "#ff5c8a",
    color2: "#b23a6b",
    initials: "VV",
  },
  {
    slug: "hydramobilespa",
    name: "Hydra Mobile Spa",
    domain: "hydramobilespa.com",
    tag: "Mobile spa / wellness",
    desc:
      "A calm, premium landing site for an on-demand mobile spa — services and booking that come to the client's door.",
    color: "#22b3c9",
    color2: "#0d5b6b",
    initials: "HS",
  },
  {
    slug: "milapethotel",
    name: "Mila Pet Hotel",
    domain: "milapethotel.com",
    tag: "Pet hotel / boarding",
    desc:
      "A five-star boutique pet-hotel site with suites, live pet-cams, a breed library, and an instant reservation flow. Fully SEO-optimized.",
    color: "#1f3a2e",
    color2: "#0e2019",
    initials: "MH",
  },
];

// Self-hosted assets. Replace the files in public/portfolio/ to update.
export const logoUrl = (slug) => `/portfolio/${slug}-logo.png`;
export const shotUrl = (slug) => `/portfolio/${slug}-shot.jpg`;
