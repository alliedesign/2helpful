// app/blog/page.js
import Link from "next/link";
import { POSTS, SITE } from "@/app/lib/posts";
import { BlogNav, BlogFooter } from "@/app/components/BlogChrome";

export const metadata = {
  title: "Helpful × Humans Blog — Finding & Hiring Independent Helpers",
  description:
    "Guides on finding, hiring, and becoming an independent helper — plus how Helpful × Humans works. Real people, no corporations.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    siteName: "Helpful × Humans",
    title: "Helpful × Humans Blog",
    description:
      "Guides on finding and hiring independent helpers — and on getting found if you are one.",
    url: `${SITE}/blog`,
  },
  twitter: { card: "summary_large_image" },
};

export default function BlogIndex() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Helpful × Humans Blog",
    url: `${SITE}/blog`,
    publisher: { "@type": "Organization", name: "Helpful × Humans" },
    blogPost: POSTS.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE}/blog/${p.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
      />
      <div className="blog-scope">
        <div className="wrap-wide">
          <section className="hub-hero">
            <span className="eyebrow">The Blog</span>
            <h1>
              Real help, <em>found faster.</em>
            </h1>
            <p>
              Guides on finding and hiring independent helpers — and on getting found if
              you are one. No corporations, just neighbors with skills.
            </p>
          </section>

          <div className="post-list">
            {POSTS.map((p) => (
              <div className="pl-card" key={p.slug}>
                <span className="pk">{p.kind}</span>
                <h2>
                  <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                </h2>
                <p>{p.dek}</p>
                <Link className="read" href={`/blog/${p.slug}`}>
                  Read →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
