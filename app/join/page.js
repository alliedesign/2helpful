// app/join/page.js
"use client";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import AuthForm from "@/app/components/AuthForm";
import { CATEGORIES } from "@/lib/categories";

const supabase = browserClient();

export default function JoinPage() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [helper, setHelper] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  // Ensure a helper row exists for this logged-in user
  useEffect(() => {
    if (!session) return;
    (async () => {
      const { data: existing } = await supabase
        .from("helpers").select("*").eq("user_id", session.user.id).maybeSingle();
      if (existing) { setHelper(existing); return; }
      const { data: created } = await supabase
        .from("helpers")
        .insert({ user_id: session.user.id, email: session.user.email, name: session.user.email.split("@")[0] })
        .select().single();
      setHelper(created);
    })();
  }, [session]);

  async function sendLink(e) {
    e.preventDefault();
    await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.href } });
    setSent(true);
  }

  if (!session) {
    return <AuthForm title="List your business" blurb="Sign in or create an account to add your independent business to the search." />;
  }

  return <ListingForm helper={helper} email={session.user.email} />;
}

function ListingForm({ helper, email }) {
  const [form, setForm] = useState({
    businessName: "", websiteUrl: "", description: "", headquarters: "", imageUrl: "",
    avatarUrl: "", headerUrl: "", nationwide: false, paidDays: 1,
    phone: "", hours: "", address: "",
    instagram: "", facebook: "", tiktok: "", twitter: "", youtube: "", linkedin: "",
    categories: [], mode: "both", serviceAreaMiles: 25, attestedIndependent: false,
  });
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [uploading, setUploading] = useState("");   // "avatar" | "header" | ""

  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function handleUpload(e, kind) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(kind);
    setErr("");
    const bucket = kind === "avatar" ? "avatars" : "headers";
    const { url, error } = await uploadImage(file, bucket);
    setUploading("");
    if (error) { setErr("Upload failed: " + error); return; }
    set(kind === "avatar" ? "avatarUrl" : "headerUrl", url);
  }

  async function submit(e) {
    e.preventDefault();
    if (!helper) { setErr("Still setting up your account — wait a moment and try again."); return; }
    if (!form.avatarUrl) { setErr("Please upload a profile picture — it's required to create a listing."); return; }
    if (!form.headerUrl) { setErr("Please upload a banner photo — it's required to create a listing."); return; }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/listings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          helperId: helper.id,
          businessName: form.businessName,
          websiteUrl: form.websiteUrl,
          description: form.description,
          headquarters: form.headquarters,
          imageUrl: form.imageUrl,
          avatarUrl: form.avatarUrl,
          headerUrl: form.headerUrl,
          nationwide: form.nationwide,
          paidDays: Number(form.paidDays) || 0,
          phone: form.phone, hours: form.hours, address: form.address,
          instagram: form.instagram, facebook: form.facebook, tiktok: form.tiktok,
          twitter: form.twitter, youtube: form.youtube, linkedin: form.linkedin,
          categories: form.categories,
          mode: form.mode,
          serviceAreaMiles: Number(form.serviceAreaMiles),
          attestedIndependent: form.attestedIndependent,
        }),
      });
      const text = await res.text();
      let json = {};
      try { json = text ? JSON.parse(text) : {}; } catch { json = {}; }
      if (!res.ok || json.error) {
        setErr(json.error || `Submit failed (HTTP ${res.status}).`);
      } else {
        setResult(json);
      }
    } catch (e2) {
      setErr("Could not reach the server. Is the dev server running? " + e2.message);
    }
    setBusy(false);
  }

  const fieldStyle = { width: "100%", border: "1px solid var(--silver)", borderRadius: 9, padding: ".7rem .9rem", marginTop: ".3rem" };
  const labelStyle = { display: "block", fontWeight: 600, fontSize: ".9rem", marginTop: "1rem" };

  if (result) {
    return (
      <main className="wrap" style={{ maxWidth: 560, paddingTop: "6vh" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.6rem" }}>
          {result.autoApproved ? "✅ Listing created" : "📥 Submitted for review"}
        </h1>
        <p style={{ color: "var(--muted)", margin: ".6rem 0 1rem" }}>
          {result.autoApproved
            ? "Your listing is saved but not yet live. To appear in search, activate it for $5/day from your listings page."
            : result.message}
        </p>
        {!result.autoApproved && (
          <div style={{ background: "var(--silver-bg)", borderRadius: 10, padding: "1rem" }}>
            <strong>Why it's being reviewed</strong> (corp-likelihood score {result.corpScore}):
            <ul style={{ margin: ".5rem 0 0 1.1rem", color: "var(--muted)" }}>
              {(result.flags || []).map((f, i) => <li key={i}>{f}</li>)}
              {(!result.flags || result.flags.length === 0) && <li>Standard review of new listings.</li>}
            </ul>
          </div>
        )}
        <p style={{ marginTop: "1.4rem" }}>
          <a className="btn" href="/dashboard">Go to my listings to activate →</a>
        </p>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ maxWidth: 620, paddingTop: "4vh", paddingBottom: "4rem" }}>
      <p style={{ color: "var(--muted)", fontSize: ".9rem" }}>Signed in as {email}</p>
      <h1 style={{ fontWeight: 800, fontSize: "1.7rem", marginTop: ".3rem" }}>List your business</h1>
      <p style={{ color: "var(--muted)", margin: ".5rem 0 1rem" }}>
        Add your own website to the search. Independent contractors and small/family shops only.
      </p>
      <form onSubmit={submit}>
        <label style={labelStyle}>Business name
          <input style={fieldStyle} required value={form.businessName} onChange={(e) => set("businessName", e.target.value)} placeholder="e.g. DevonFixesIt" />
        </label>
        <label style={labelStyle}>Your website
          <input style={fieldStyle} required value={form.websiteUrl} onChange={(e) => set("websiteUrl", e.target.value)} placeholder="yourbusiness.com" />
        </label>
        <label style={labelStyle}>Where are you headquartered?
          <input style={fieldStyle} required value={form.headquarters} onChange={(e) => set("headquarters", e.target.value)} placeholder="e.g. Austin, TX" />
        </label>
        <label style={labelStyle}>What you offer (this is what people search)
          <textarea style={{ ...fieldStyle, minHeight: 110 }} required value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Friendly on-site and remote tech help: printers, wifi, new devices, and confusing apps." />
        </label>
        <div style={labelStyle}>Categories (pick all that apply — this is how people find you)
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: ".4rem", marginTop: ".5rem" }}>
            {CATEGORIES.filter((c) => c.value !== "general").map((c) => {
              const on = form.categories.includes(c.value);
              return (
                <label key={c.value} style={{
                  display: "flex", alignItems: "center", gap: ".5rem", padding: ".5rem .7rem",
                  border: "1px solid " + (on ? "var(--teal)" : "var(--silver)"), borderRadius: 9,
                  background: on ? "var(--teal-wash)" : "#fff", cursor: "pointer", fontSize: ".9rem",
                }}>
                  <input
                    type="checkbox" checked={on}
                    onChange={(e) => {
                      const next = e.target.checked
                        ? [...form.categories, c.value]
                        : form.categories.filter((v) => v !== c.value);
                      set("categories", next);
                    }}
                  />
                  <span>{c.icon} {c.label}</span>
                </label>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ ...labelStyle, flex: 1, minWidth: 200 }}>Mode
            <select style={fieldStyle} value={form.mode} onChange={(e) => set("mode", e.target.value)}>
              <option value="both">🌐 Virtual + 📍 In person</option>
              <option value="virtual">🌐 Virtual only</option>
              <option value="in_person">📍 In person only</option>
            </select>
          </label>
          <label style={{ ...labelStyle, flex: 1, minWidth: 200 }}>Service area
            <input type="number" style={fieldStyle} value={form.serviceAreaMiles} onChange={(e) => set("serviceAreaMiles", e.target.value)} />
            <span style={{ display: "block", color: "var(--muted)", fontSize: ".8rem", marginTop: ".3rem" }}>
              miles from {form.headquarters || "your headquarters"}
            </span>
          </label>
        </div>

        <label style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", marginTop: "1rem", fontSize: ".92rem" }}>
          <input type="checkbox" checked={form.nationwide} onChange={(e) => set("nationwide", e.target.checked)} style={{ marginTop: ".2rem" }} />
          <span>🇺🇸 Offer my services <strong>nationwide (USA)</strong> — show up in search everywhere, in addition to my local area above.</span>
        </label>

        <div style={{ marginTop: "1.4rem", padding: "1.1rem", border: "1px solid var(--teal)", borderRadius: 14, background: "var(--teal-wash)" }}>
          <div style={{ fontWeight: 700 }}>Listing length</div>
          <div style={{ color: "var(--muted)", fontSize: ".85rem", margin: ".2rem 0 .8rem" }}>
            Listings are $5 per day. Choose how many days to run — it goes live right away and comes down automatically when the time is up.
            <em> (Payment isn't connected yet — this is for testing the schedule.)</em>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
            <input type="number" min="0" style={{ ...fieldStyle, width: 90, marginTop: 0 }} value={form.paidDays} onChange={(e) => set("paidDays", e.target.value)} />
            <span style={{ fontWeight: 600 }}>days &nbsp;=&nbsp; ${(Number(form.paidDays) || 0) * 5} total</span>
          </label>
        </div>

        <div style={{ marginTop: "1.4rem", padding: "1.1rem", border: "1px solid var(--line)", borderRadius: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: ".2rem" }}>Contact details (optional)</div>
          <div style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: ".8rem" }}>
            Help clients reach you. Anything you skip just won't show.
          </div>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
            <label style={{ ...labelStyle, flex: 1, minWidth: 160, marginTop: 0 }}>Phone
              <input style={fieldStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(555) 123-4567" />
            </label>
            <label style={{ ...labelStyle, flex: 1, minWidth: 160, marginTop: 0 }}>Hours
              <input style={fieldStyle} value={form.hours} onChange={(e) => set("hours", e.target.value)} placeholder="Mon–Fri 9am–5pm" />
            </label>
          </div>
          <label style={labelStyle}>Address (optional)
            <input style={fieldStyle} value={form.address} onChange={(e) => set("address", e.target.value)} placeholder="123 Main St, Austin, TX" />
          </label>
        </div>

        <div style={{ marginTop: "1.2rem", padding: "1.1rem", border: "1px solid var(--line)", borderRadius: 14 }}>
          <div style={{ fontWeight: 700, marginBottom: ".2rem" }}>Social media (optional)</div>
          <div style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: ".8rem" }}>
            Paste your profile links so clients can follow you.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px,1fr))", gap: ".6rem" }}>
            {[["instagram","📸 Instagram"],["facebook","👍 Facebook"],["tiktok","🎵 TikTok"],["twitter","𝕏 X / Twitter"],["youtube","▶️ YouTube"],["linkedin","💼 LinkedIn"]].map(([k, label]) => (
              <label key={k} style={{ fontSize: ".85rem", fontWeight: 600 }}>{label}
                <input style={fieldStyle} value={form[k]} onChange={(e) => set(k, e.target.value)} placeholder="https://…" />
              </label>
            ))}
          </div>
        </div>

        <div style={{ marginTop: "1.4rem", padding: "1.1rem", border: "1px solid var(--line)", borderRadius: 14, background: "var(--silver-bg)" }}>
          <div style={{ fontWeight: 700, marginBottom: ".2rem" }}>Your photos</div>
          <div style={{ color: "var(--muted)", fontSize: ".85rem", marginBottom: "1rem" }}>
            Upload a profile pic and a headline photo from your device. Both optional — we'll use a website preview or your initials if you skip them.
          </div>

          <div style={{ display: "flex", gap: "1.4rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            {/* Userpic */}
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: ".82rem", fontWeight: 600, marginBottom: ".4rem" }}>Profile pic <span style={{ color: "#b13b3b" }}>*</span></div>
              <div style={{
                width: 88, height: 88, borderRadius: "50%", overflow: "hidden", margin: "0 auto .5rem",
                border: "2px solid var(--line)", background: "var(--silver)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {form.avatarUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={form.avatarUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "var(--muted)", fontSize: ".7rem" }}>no pic</span>}
              </div>
              <label style={{ cursor: "pointer", color: "var(--teal-deep)", fontWeight: 600, fontSize: ".85rem" }}>
                {uploading === "avatar" ? "Uploading…" : (form.avatarUrl ? "Change" : "Upload")}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleUpload(e, "avatar")} />
              </label>
            </div>

            {/* Headline photo */}
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ fontSize: ".82rem", fontWeight: 600, marginBottom: ".4rem" }}>Headline photo (banner) <span style={{ color: "#b13b3b" }}>*</span></div>
              <div style={{
                width: "100%", height: 110, borderRadius: 12, overflow: "hidden", marginBottom: ".5rem",
                border: "2px solid var(--line)", background: "var(--silver)", display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {form.headerUrl
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={form.headerUrl} alt="header" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "var(--muted)", fontSize: ".8rem" }}>no banner yet</span>}
              </div>
              <label style={{ cursor: "pointer", color: "var(--teal-deep)", fontWeight: 600, fontSize: ".85rem" }}>
                {uploading === "header" ? "Uploading…" : (form.headerUrl ? "Change photo" : "Upload photo")}
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleUpload(e, "header")} />
              </label>
            </div>
          </div>
        </div>

        <label style={{ display: "flex", gap: ".6rem", alignItems: "flex-start", marginTop: "1.2rem", fontSize: ".92rem" }}>
          <input type="checkbox" checked={form.attestedIndependent} onChange={(e) => set("attestedIndependent", e.target.checked)} style={{ marginTop: ".2rem" }} />
          <span>I confirm this is an independent contractor or small/family-owned business — not a franchise, chain, or major corporation. (Checking this lets clean listings go live instantly; otherwise it's reviewed first.)</span>
        </label>
        {err && (
          <div style={{ background: "#fde8e8", border: "1px solid #f3c0c0", color: "#b13b3b",
                        borderRadius: 10, padding: "1rem 1.1rem", marginTop: "1.2rem", fontSize: ".92rem" }}>
            <strong>Couldn't submit:</strong> {err}
          </div>
        )}
        <button className="btn" disabled={busy} style={{ marginTop: "1.4rem" }}>
          {busy ? "Submitting…" : "Submit listing"}
        </button>
      </form>
    </main>
  );
}
