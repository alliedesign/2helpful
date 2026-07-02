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
       
      </body>
    </html>
  );
}
