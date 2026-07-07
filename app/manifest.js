// app/manifest.js
// Generates /site.webmanifest — helps mobile "add to home screen" and gives search
// engines your app name, theme color, and icons.

import { SITE_NAME, SITE_DESCRIPTION } from "@/app/lib/seo";

export default function manifest() {
  return {
    name: SITE_NAME,
    short_name: "Helpful × Humans",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0eb6a4",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
