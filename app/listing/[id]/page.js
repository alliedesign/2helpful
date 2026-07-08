// app/listing/[id]/page.js
"use client";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";
import { listingPhoto, listingScreenshot, listingAvatar, initials, colorFor } from "@/lib/listingImage";
import MarketingOptIn from "@/app/components/MarketingOptIn";

const supabase = browserClient();

const SOCIALS = [
  ["instagram", "📸 Instagram"], ["facebook", "👍 Facebook"], ["tiktok", "🎵 TikTok"],
  ["twitter", "𝕏 X"], ["youtube", "▶️ YouTube"], ["linkedin", "💼 LinkedIn"],
];

function Stars({ value, size = 16, onPick }) {
  return (
    <span style={{ whiteSpace: "nowrap" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} onClick={onPick ? () => onPick(n) : undefined}
          style={{ cursor: onPick ? "pointer" : "default", fontSize: size, color: n <= Math.round(value) ? "#f6a609" : "#d6d9dd" }}>★</span>
      ))}
    </span>
  );
}

export default function ListingProfile({ params }) {
  const [l, setL] = useState(null);
  const [err, setErr] = useState("");
  const [session, setSession] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [avg, setAvg] = useState(null);
  const [myRating, setMyRating] = useState(0);
  const [myBody, setMyBody] = useState("");
  const [savingReview, setSavingReview] = useState(false);
  // Marketing opt-in — both boxes start UNCHECKED.
  const [optIn, setOptIn] = useState({ emailOptIn: false, smsOptIn: false, phone: "" });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  function loadReviews() {
    fetch(`/api/reviews?listingId=${params.id}`).then((r) => r.json()).then((j) => {
      setReviews(j.reviews || []);
      setAvg(j.avg);
      // Pre-fill my existing review if I have one.
      const mine = (j.reviews || []).find((r) => session && r.user_id === session.user.id);
      if (mine) { setMyRating(mine.rating); setMyBody(mine.body || ""); }
    }).catch(() => {});
  }

  useEffect(() => {
    fetch(`/api/listing?id=${params.id}`).then((r) => r.json()).then((j) => {
      if (j.error) setErr(j.error); else setL(j.listing);
    }).catch((e) => setErr(e.message));
  }, [params.id]);

  useEffect(() => { loadReviews(); /* eslint-disable-next-line */ }, [params.id, session]);

  async function submitReview() {
    if (!session) return;
    if (!(myRating >= 1)) { setErr("Pick a star rating first."); return; }
    setSavingReview(true); setErr("");
    const name = session.user.user_metadata?.name || session.user.email?.split("@")[0] || "Someone";
    const res = await fetch("/api/reviews", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        listingId: params.id, userId: session.user.id, authorName: name, rating: myRating, body: myBody,
        email: session.user.email, phone: optIn.phone,
        emailOptIn: optIn.emailOptIn, smsOptIn: optIn.smsOptIn,
      }),
    });
    const j = await res.json();
    setSavingReview(false);
    if (j.error) { setErr(j.error); return; }
    loadReviews();
  }

  async function deleteMyReview() {
    if (!session) return;
    await fetch("/api/reviews", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: params.id, userId: session.user.id }) });
    setMyRating(0); setMyBody("");
    loadReviews();
  }

  if (err && !l) return <main className="wrap" style={{ paddingTop: "8vh" }}><p>{err}</p><a href="/search" style={{ color: "var(--teal-deep)" }}>← Back to search</a></main>;
  if (!l) return <main className="wrap" style={{ paddingTop: "8vh" }}><p style={{ color: "var(--muted)" }}>Loading…</p></main>;

  const banner = listingPhoto(l) || listingScreenshot(l);
  const website = l.website_url ? (l.website_url.startsWith("http") ? l.website_url : "https://" + l.website_url) : "";

  function visit() {
    if (!website) return;
    fetch("/api/listings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ listingId: l.id, q: "" }) });
    window.open(website, "_blank", "noopener");
  }

  const row = { display: "flex", gap: ".6rem", alignItems: "center", padding: ".5rem 0", borderBottom: "1px solid var(--line)", fontSize: ".95rem" };

  return (
    <main className="wrap" style={{ maxWidth: 720, paddingTop: "3vh", paddingBottom: "4rem" }}>
      <a href="/search" style={{ color: "var(--teal-deep)", fontSize: ".9rem", fontWeight: 600 }}>← Back to search</a>

      {/* Header banner */}
      <div style={{ position: "relative", height: 220, borderRadius: 18, overflow: "hidden", marginTop: ".8rem",
                    background: `linear-gradient(135deg, ${colorFor(l.business_name)}, var(--teal-ink))` }}>
        {banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={banner} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={(e) => { e.currentTarget.style.display = "none"; }} />
        )}
      </div>

      {/* Avatar overlapping banner, name BELOW it */}
      <div style={{ padding: "0 1rem" }}>
        <div style={{ width: 88, height: 88, borderRadius: "50%", border: "4px solid #fff", overflow: "hidden",
                      marginTop: "-44px", position: "relative", zIndex: 2,
                      background: colorFor(l.business_name), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.8rem" }}>
          {listingAvatar(l)
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={listingAvatar(l)} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : initials(l.business_name)}
        </div>
        <div style={{ marginTop: ".6rem" }}>
          <h1 style={{ fontWeight: 800, fontSize: "1.7rem", letterSpacing: "-.02em" }}>{l.business_name}</h1>
          <div style={{ color: "var(--muted)", fontSize: ".9rem", display: "flex", alignItems: "center", gap: ".4rem", marginTop: ".15rem" }}>
            {l.helper_name}
            {avg != null && <> · <Stars value={avg} /> {avg.toFixed(1)} <span>({reviews.length})</span></>}
            {avg == null && <span style={{ color: "var(--muted)" }}>· No reviews yet</span>}
          </div>
        </div>
      </div>

      <p style={{ fontSize: "1.02rem", margin: "1.2rem 0", lineHeight: 1.6 }}>{l.description}</p>

      {website && (
        <button onClick={visit} className="btn" style={{ marginBottom: "1.4rem" }}>Visit website ↗</button>
      )}

      {/* Quick facts */}
      <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "0 1rem" }}>
        <div style={row}><span>🌐</span><span style={{ fontWeight: 600 }}>Service</span>
          <span style={{ marginLeft: "auto", color: "var(--muted)" }}>
            {l.mode === "virtual" ? "Virtual" : l.mode === "in_person" ? "In person" : "Virtual + In person"}
            {l.nationwide ? " · 🇺🇸 Nationwide" : (l.headquarters ? ` · within ${l.service_area_miles} mi of ${l.headquarters}` : "")}
          </span>
        </div>
        {l.phone && <div style={row}><span>📞</span><span style={{ fontWeight: 600 }}>Phone</span><a href={`tel:${l.phone}`} style={{ marginLeft: "auto", color: "var(--teal-deep)" }}>{l.phone}</a></div>}
        {l.hours && <div style={row}><span>🕒</span><span style={{ fontWeight: 600 }}>Hours</span><span style={{ marginLeft: "auto", color: "var(--muted)" }}>{l.hours}</span></div>}
        {l.address && <div style={row}><span>📍</span><span style={{ fontWeight: 600 }}>Address</span>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(l.address)}`} target="_blank" rel="noopener noreferrer" style={{ marginLeft: "auto", color: "var(--teal-deep)" }}>{l.address}</a></div>}
        {l.headquarters && <div style={{ ...row, borderBottom: "none" }}><span>🏠</span><span style={{ fontWeight: 600 }}>Based in</span><span style={{ marginLeft: "auto", color: "var(--muted)" }}>{l.headquarters}</span></div>}
      </div>

      {/* Categories */}
      {l.categories?.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: ".4rem", marginTop: "1.2rem" }}>
          {l.categories.map((c, i) => (
            <span key={i} style={{ background: "var(--silver-bg)", borderRadius: 999, padding: ".25rem .7rem", fontSize: ".8rem" }}>{c}</span>
          ))}
        </div>
      )}

      {/* Socials */}
      {SOCIALS.some(([k]) => l[k]) && (
        <div style={{ marginTop: "1.6rem" }}>
          <div style={{ fontWeight: 700, marginBottom: ".6rem" }}>Follow</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: ".6rem" }}>
            {SOCIALS.filter(([k]) => l[k]).map(([k, label]) => {
              const href = l[k].startsWith("http") ? l[k] : "https://" + l[k];
              return (
                <a key={k} href={href} target="_blank" rel="noopener noreferrer"
                   style={{ border: "1px solid var(--silver)", borderRadius: 999, padding: ".4rem .9rem", fontWeight: 600, fontSize: ".88rem", color: "var(--ink)", textDecoration: "none" }}>
                  {label}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Reviews */}
      <section style={{ marginTop: "2.4rem" }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.3rem", marginBottom: ".2rem" }}>Reviews</h2>
        <div style={{ color: "var(--muted)", marginBottom: "1rem", display: "flex", alignItems: "center", gap: ".5rem" }}>
          {avg != null ? <><Stars value={avg} size={18} /> <strong>{avg.toFixed(1)}</strong> from {reviews.length} review{reviews.length === 1 ? "" : "s"}</> : "No reviews yet — be the first."}
        </div>

        {/* Write / edit your review (account required) */}
        {session ? (
          <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.1rem", marginBottom: "1.4rem" }}>
            <div style={{ fontWeight: 700, marginBottom: ".4rem" }}>
              {reviews.some((r) => r.user_id === session.user.id) ? "Edit your review" : "Leave a review"}
            </div>
            <Stars value={myRating} size={26} onPick={setMyRating} />
            <textarea value={myBody} onChange={(e) => setMyBody(e.target.value)} placeholder="Share your experience (optional)"
              style={{ width: "100%", border: "1px solid var(--silver)", borderRadius: 9, padding: ".6rem .8rem", minHeight: 70, marginTop: ".6rem", fontSize: ".92rem" }} />
            <MarketingOptIn value={optIn} onChange={setOptIn} />
            {err && <div style={{ color: "#b13b3b", fontSize: ".85rem", marginTop: ".4rem" }}>{err}</div>}
            <div style={{ display: "flex", gap: ".6rem", marginTop: ".7rem", alignItems: "center" }}>
              <button onClick={submitReview} disabled={savingReview} className="btn" style={{ padding: ".5rem 1.1rem" }}>
                {savingReview ? "Saving…" : "Submit"}
              </button>
              {reviews.some((r) => r.user_id === session.user.id) && (
                <button onClick={deleteMyReview} style={{ border: "none", background: "none", color: "#b13b3b", cursor: "pointer", fontSize: ".85rem" }}>delete my review</button>
              )}
            </div>
          </div>
        ) : (
          <p style={{ color: "var(--muted)", marginBottom: "1.4rem" }}>
            <a href="/join" style={{ color: "var(--teal-deep)", fontWeight: 600 }}>Sign in</a> to leave a review.
          </p>
        )}

        {/* All reviews */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                <strong>{r.author_name}</strong>
                <Stars value={r.rating} />
                {session && r.user_id === session.user.id && <span style={{ fontSize: ".72rem", background: "var(--teal-wash)", color: "var(--teal-deep)", padding: ".1rem .5rem", borderRadius: 999, fontWeight: 600 }}>your review</span>}
              </div>
              {r.body && <p style={{ marginTop: ".4rem", fontSize: ".95rem" }}>{r.body}</p>}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
