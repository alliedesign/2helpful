// app/components/Portfolio.js
"use client";
import { useState } from "react";
import { PORTFOLIO, shotUrl, logoUrl } from "@/app/lib/portfolio";

function Logo({ site }) {
  const [failed, setFailed] = useState(false);
  return (
    <span
      className="plogo"
      style={{ background: `linear-gradient(135deg, ${site.color}, ${site.color2})` }}
    >
      {failed ? (
        <span className="plogo-mono">{site.initials}</span>
      ) : (
        // Self-hosted logo; falls back to the monogram if the file is missing.
        <img
          src={logoUrl(site.slug)}
          alt={`${site.name} logo`}
          width={38}
          height={38}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

function Shot({ site }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  return (
    <div className="pshot">
      <div
        className="fallback"
        style={{ background: `linear-gradient(135deg, ${site.color}, ${site.color2})` }}
      >
        {site.name}
      </div>
      {!failed && (
        <img
          className="pshot-img"
          src={shotUrl(site.slug)}
          alt={`Screenshot of ${site.name} — ${site.tag} website`}
          loading="lazy"
          style={{ opacity: loaded ? 1 : 0 }}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

export default function Portfolio() {
  return (
    <>
      <div className="portfolio">
        {PORTFOLIO.map((site) => (
          <a
            key={site.slug}
            className="pcard"
            href={`https://${site.domain}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Shot site={site} />
            <div className="pbody">
              <div className="pbrand">
                <Logo site={site} />
                <span className="pname">{site.name}</span>
              </div>
              <span className="ptag">{site.tag}</span>
              <p className="pdesc">{site.desc}</p>
              <span className="purl">{site.domain} ↗</span>
            </div>
          </a>
        ))}
      </div>
    </>
  );
}
