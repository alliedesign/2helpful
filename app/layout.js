// app/layout.js
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
              <a href="https://www.youtube.com/@HelpfulxH
