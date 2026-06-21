// app/layout.js
export const metadata = {
  title: "Helpful x Humans — search independent helpers",
  description: "A search engine for independent contractors and mom-and-pop shops. No corporations.",
};

const css = `
:root{--teal:#0eb6a4;--teal-deep:#0a8e80;--teal-ink:#063e38;--teal-wash:#e7f7f4;
--black:#101417;--ink:#1a1f23;--silver:#c8cfd4;--silver-bg:#f6f8f9;--line:#e3e8ea;--muted:#69757b;}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Inter',system-ui,sans-serif;color:var(--ink);background:#fff;line-height:1.55}
a{color:inherit;text-decoration:none}
.wrap{max-width:1080px;margin:0 auto;padding:0 28px}
.topbar{border-bottom:1px solid var(--line);position:sticky;top:0;background:#fff;z-index:50}
.topbar-inner{display:flex;align-items:center;justify-content:space-between;height:70px}
.logo{font-weight:800;font-size:1.3rem;letter-spacing:-.03em}
.logo .x{color:var(--teal);font-style:italic}
.nav a{margin-left:1.4rem;font-weight:500;color:var(--muted)}
.nav a:hover{color:var(--teal)}
.btn{display:inline-block;background:var(--teal);color:#04241f;font-weight:700;padding:.7rem 1.3rem;border-radius:9px;border:none;cursor:pointer}
.btn:hover{background:#13d1bb}
.btn-dark{background:var(--black);color:#fff}
.btn-dark:hover{background:#23303a}
input,textarea,select{font-family:inherit;font-size:.95rem}
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
      </body>
    </html>
  );
}
