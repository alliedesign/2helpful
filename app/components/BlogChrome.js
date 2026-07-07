// app/components/BlogChrome.js
import Link from "next/link";
import { getPost } from "@/app/lib/posts";

export function BlogNav() {
  return (
    <nav className="blognav">
      <div className="blognav-in">
        <Link className="brand" href="/">
          Helpful<span className="x">×</span>Humans
        </Link>
        <div className="blognav-links">
          <Link href="/search">Find a helper</Link>
          <Link href="/join">List your business</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/community">Community</Link>
          <Link className="blognav-cta" href="/search">
            Search
          </Link>
        </div>
      </div>
    </nav>
  );
}

export function BlogFooter() {
  return (
    <footer className="blogfoot">
      <div className="blogfoot-in">
        <div>
          <span className="fbrand">Helpful × Humans</span> — a search engine for real,
          independent helpers. No corporations, just neighbors with skills.
        </div>
        <div className="blogfoot-links">
          <Link href="/search">Find a helper</Link>
          <span>·</span>
          <Link href="/join">List your business</Link>
          <span>·</span>
          <Link href="/blog">Blog</Link>
          <span>·</span>
          <Link href="/faq">FAQ</Link>
          <span>·</span>
          <a href="https://instagram.com/helpfulxhumans" target="_blank" rel="noopener noreferrer">
            @helpfulxhumans
          </a>
        </div>
      </div>
    </footer>
  );
}

export function Faq({ faqs }) {
  if (!faqs?.length) return null;
  return (
    <section className="faq">
      <h2>Frequently asked questions</h2>
      {faqs.map(([q, a], i) => (
        <details key={i}>
          <summary>{q}</summary>
          <div className="faq-a">{a}</div>
        </details>
      ))}
    </section>
  );
}

export function Related({ slugs }) {
  const posts = (slugs || []).map(getPost).filter(Boolean);
  if (!posts.length) return null;
  return (
    <section className="related">
      <h2>Keep reading</h2>
      <div className="rgrid">
        {posts.map((p) => (
          <div className="rcard" key={p.slug}>
            <span className="rk">{p.kind}</span>
            <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            <p>{p.dek}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
