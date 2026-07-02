// app/layout.js
export const metadata = {
  title: "Helpful x Humans — search independent helpers",
  description: "A search engine for independent contractors and mom-and-pop shops. No corporations.",
};

// Critical for mobile: tells phones to render at device width, not zoomed out.
export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};
import SubscribePopup from "@/app/components/SubscribePopup";

const css = `
:root{--teal:#0eb6a4;--teal-deep:#0a8e80;--teal-ink:#063e38;--teal-wash:#e7f7f4;
--black:#101417;--ink:#1a1f23;--silver:#c8cfd4;--silver-bg:#f6f8f9;--line:#e3e8ea;--muted:#69757b;}
*{box-sizing:border-box;margin:0;padding:0}
html{-webkit-text-size-adjust:100%}
body{font-family:'Inter',system-ui,sans-serif;color:var(--ink);background:#fff;line-height:1.55;-webkit-font-smoothing:antialiased}
a{color:inherit;text-decoration:none}
.wrap{max-width:1080px;margin:0 auto;padding:0 28px}
.topbar{border-bottom:1px solid var(--line);position:sticky;top:0;background:#fff;z-index:50}
.topbar-inner{display:flex;align-items:center;justify-content:space-between;height:70px}
.logo{font-weight:800;font-size:1.3rem;letter-spacing:-.03em}
.logo .x{color:var(--teal);font-style:italic}
.nav{display:flex;align-items:center}
.nav a{margin-left:1.4rem;font-weight:500;color:var(--muted)}
.nav a:hover{color:var(--teal)}
.btn{display:inline-block;background:var(--teal);color:#04241f;font-weight:700;padding:.7rem 1.3rem;border-radius:9px;border:none;cursor:pointer;font-size:1rem}
.btn:hover{background:#13d1bb}
.btn-dark{background:var(--black);color:#fff}
.btn-dark:hover{background:#23303a}
input,textarea,select{font-family:inherit;font-size:1rem}

/* Hamburger toggle — hidden on desktop */
.menu-toggle{display:none;background:none;border:none;cursor:pointer;padding:.4rem;font-size:1.6rem;line-height:1;color:var(--ink)}
#nav-toggle{display:none}

/* ---------- MOBILE ---------- */
@media (max-width:760px){
  .wrap{padding:0 16px}
  .topbar-inner{height:60px}
  .logo{font-size:1.15rem}
  .menu-toggle{display:block}
  .nav{
    position:absolute;top:60px;left:0;right:0;
    flex-direction:column;align-items:stretch;
    background:#fff;border-bottom:1px solid var(--line);
    box-shadow:0 8px 20px rgba(16,20,23,.08);
    max-height:0;overflow:hidden;transition:max-height .25s ease;
  }
  #nav-toggle:checked ~ .nav{max-height:420px}
  .nav a{margin:0;padding:1rem 16px;border-top:1px solid var(--line);font-size:1.05rem;color:var(--ink)}
  .nav a:first-child{border-top:none}
  .btn{padding:.85rem 1.3rem}
  input,textarea,select{font-size:16px}
}

/* Search two-column → stacks on mobile */
.search-cols{display:flex;gap:1.5rem;align-items:flex-start}
.search-list{flex:0 0 42%;max-width:460px}
.search-detail{flex:1;position:sticky;top:1rem}
@media (max-width:760px){
  .search-cols{flex-direction:column;gap:1rem}
  .search-list{flex:none;max-width:none;width:100%}
  .search-detail{position:static;width:100%}
}
/* ---------- FOOTER ---------- */
.footer{border-top:1px solid var(--line);margin-top:4rem;background:var(--silver-bg)}
.footer-inner{display:flex;align-items:center;justify-content:space-between;padding:2rem 0;gap:1rem;flex-wrap:wrap}
.footer .logo{font-size:1.1rem}
.social{display:flex;align-items:center;gap:.4rem}
.social a{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;border-radius:9px;color:var(--muted);transition:background .18s,color .18s}
.social a:hover{background:var(--teal-wash);color:var(--teal-deep)}
.social svg{width:20px;height:20px;fill:currentColor}
.footer-copy{color:var(--muted);font-size:.85rem;width:100%;text-align:center;padding-bottom:1.5rem}
@media (max-width:760px){
  .footer-inner{flex-direction:column;text-align:center}
}
`;

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>
        <SubscribePopup isSignedIn={false} />
        <div className="topbar">
          <div className="wrap topbar-inner">
            <a className="logo" href="/">Helpful<span className="x">x</span>Humans<span style={{color:"var(--teal)"}}>.</span></a>
            <input type="checkbox" id="nav-toggle" />
            <label className="menu-toggle" htmlFor="nav-toggle" aria-label="Menu">☰</label>
            <nav className="nav">
              <a href="/search">Search</a>
              <a href="/browse">Browse</a>
              <a href="/community">Community</a>
              <a href="/join">List your business</a>
              <a href="/build-my-site">Get a website</a>
              <a href="/dashboard">My listings</a>
            </nav>
          </div>
        </div>
       {children}
</div>
        {children}
        <footer className="footer">
          <div className="wrap footer-inner">
            <a className="logo" href="/">Helpful<span className="x">x</span>Humans<span style={{color:"var(--teal)"}}>.</span></a>
            <div className="social">
              <a href="https://www.instagram.com/helpfulxhumans" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                <svg viewBox="0 0 24 24"><path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16zm0 1.94c-3.14 0-3.51.01-4.75.07-.9.04-1.39.19-1.71.32-.43.17-.74.37-1.06.69-.32.32-.52.63-.69 1.06-.13.32-.28.81-.32 1.71-.06 1.24-.07 1.61-.07 4.75s.01 3.51.07 4.75c.04.9.19 1.39.32 1.71.17.43.37.74.69 1.06.32.32.63.52 1.06.69.32.13.81.28 1.71.32 1.24.06 1.61.07 4.75.07s3.51-.01 4.75-.07c.9-.04 1.39-.19 1.71-.32.43-.17.74-.37 1.06-.69.32-.32.52-.63.69-1.06.13-.32.28-.81.32-1.71.06-1.24.07-1.61.07-4.75s-.01-3.51-.07-4.75c-.04-.9-.19-1.39-.32-1.71-.17-.43-.37-.74-.69-1.06-.32-.32-.63-.52-1.06-.69-.32-.13-.81-.28-1.71-.32-1.24-.06-1.61-.07-4.75-.07zm0 3.3a4.6 4.6 0 110 9.2 4.6 4.6 0 010-9.2zm0 7.59a2.99 2.99 0 100-5.98 2.99 2.99 0 000 5.98zm5.85-7.81a1.08 1.08 0 11-2.15 0 1.08 1.08 0 012.15 0z"/></svg>
              </a>
              <a href="https://x.com/helpfulxhumans" target="_blank" rel="noopener noreferrer" aria-label="X">
                <svg viewBox="0 0 24 24"><path d="M18.9 1.15h3.68l-8.04 9.19L24 22.85h-7.41l-5.8-7.58-6.64 7.58H.47l8.6-9.83L0 1.15h7.59l5.24 6.93 6.07-6.93zm-1.29 19.5h2.04L6.48 3.24H4.29l13.32 17.41z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@helpful.humans" target="_blank" rel="noopener noreferrer" aria-label="TikTok">
                <svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.89-4.63V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 005.4 20.5a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1.44-.5z"/></svg>
              </a>
              <a href="https://www.youtube.com/@HelpfulxHumans" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                <svg viewBox="0 0 24 24"><path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.5 3.55 12 3.55 12 3.55s-7.5 0-9.38.5A3.02 3.02 0 00.5 6.19C0 8.07 0 12 0 12s0 3.93.5 5.81a3.02 3.02 0 002.12 2.14c1.88.5 9.38.5 9.38.5s7.5 0 9.38-.5a3.02 3.02 0 002.12-2.14C24 15.93 24 12 24 12s0-3.93-.5-5.81zM9.55 15.57V8.43L15.82 12l-6.27 3.57z"/></svg>
              </a>
            </div>
          </div>
          <div className="footer-copy">© {new Date().getFullYear()} Helpful x Humans. Independent helpers, real people.</div>
        </footer>
      </body>
      </body>
    </html>
  );
}
