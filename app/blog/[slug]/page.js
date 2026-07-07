// app/blog/[slug]/page.js
import { notFound } from "next/navigation";
import { getPost, allSlugs, SITE } from "@/app/lib/posts";
import PostBody from "@/app/components/PostBody";
import { BlogNav, BlogFooter, Faq, Related } from "@/app/components/BlogChrome";

export function generateStaticParams() {
  return allSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }) {
  const post = getPost(params.slug);
  if (!post) return {};
  const url = `${SITE}/blog/${post.slug}`;
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    robots: { index: true, follow: true, "max-image-preview": "large" },
    openGraph: {
      type: "article",
      siteName: "Helpful × Humans",
      title: post.title,
      description: post.description,
      url,
      images: [`${SITE}/og/blog-default.jpg`],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
    },
  };
}

export default function BlogPost({ params }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const url = `${SITE}/blog/${post.slug}`;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    author: { "@type": "Organization", name: "Helpful × Humans" },
    publisher: {
      "@type": "Organization",
      name: "Helpful × Humans",
      logo: { "@type": "ImageObject", url: `${SITE}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: "2026-07-06",
    dateModified: "2026-07-06",
  };

  const faqLd = post.faqs?.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: post.faqs.map(([q, a]) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      }
    : null;

  const portfolioLd = post.hasPortfolio
    ? require("@/app/lib/portfolio").PORTFOLIO.reduce(
        (acc, s, i) => {
          acc.itemListElement.push({
            "@type": "ListItem",
            position: i + 1,
            item: { "@type": "WebSite", name: s.name, url: `https://${s.domain}` },
          });
          return acc;
        },
        {
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Websites built by Helpful × Humans",
          itemListElement: [],
        }
      )
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
      {portfolioLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(portfolioLd) }}
        />
      )}

      <div className="blog-scope">
        <article className="post">
          <div className="wrap">
            <span className="eyebrow">{post.kind}</span>
            <h1 className="title" dangerouslySetInnerHTML={{ __html: post.heading }} />
            <p className="dek">{post.dek}</p>
            <div className="meta">
              <span>Helpful × Humans</span>
              <span className="dot">·</span>
              <span>{post.read}</span>
              <span className="dot">·</span>
              <span>Updated Jul 2026</span>
            </div>

            <PostBody blocks={post.body} />
            <Faq faqs={post.faqs} />
            <Related slugs={post.related} />
          </div>
        </article>
      </div>
    </>
  );
}
