// app/build-my-site/page.js
"use client";
import { useState } from "react";

export default function BuildMySite() {
  const [form, setForm] = useState({ name: "", email: "", businessName: "", phone: "", about: "", budget: "" });
  const [result, setResult] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/website-request", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      });
      const j = await res.json();
      if (!res.ok || j.error) setErr(j.error || "Something went wrong.");
      else setResult(j);
    } catch (e2) { setErr("Couldn't reach the server. " + e2.message); }
    setBusy(false);
  }

  const fieldStyle = { width: "100%", border: "1px solid var(--silver)", borderRadius: 9, padding: ".7rem .9rem", marginTop: ".3rem" };
  const labelStyle = { display: "block", fontWeight: 600, fontSize: ".9rem", marginTop: "1rem" };

  if (result) {
    return (
      <main className="wrap" style={{ maxWidth: 560, paddingTop: "8vh", textAlign: "center" }}>
        <h1 style={{ fontWeight: 800, fontSize: "1.8rem" }}>🎉 Request received!</h1>
        <p style={{ color: "var(--muted)", marginTop: ".8rem" }}>{result.message}</p>
        <a href="/" style={{ color: "var(--teal-deep)", fontWeight: 600, display: "inline-block", marginTop: "1.4rem" }}>← Back home</a>
      </main>
    );
  }

  return (
    <main className="wrap" style={{ maxWidth: 680, paddingTop: "5vh", paddingBottom: "4rem" }}>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <h1 style={{ fontWeight: 800, fontSize: "clamp(1.9rem,4vw,2.6rem)", letterSpacing: "-.02em" }}>
          No website? <span style={{ color: "var(--teal)", fontStyle: "italic" }}>We'll build you one.</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "1.05rem", margin: "1rem auto 0", maxWidth: "48ch" }}>
          Every helpful human deserves a home on the web. Tell us about your business and we'll create a simple,
          beautiful site — and list you in search so clients can find you.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {[["🎨", "Designed for you", "Clean, mobile-friendly, ready to share."],
          ["🔎", "Found in search", "Listed on Helpful x Humans automatically."],
          ["🤝", "Human help", "We walk you through every step."]].map(([icon, t, d]) => (
          <div key={t} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.1rem" }}>
            <div style={{ fontSize: "1.6rem" }}>{icon}</div>
            <div style={{ fontWeight: 700, marginTop: ".4rem" }}>{t}</div>
            <div style={{ color: "var(--muted)", fontSize: ".88rem", marginTop: ".2rem" }}>{d}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submit}>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ ...labelStyle, flex: 1, minWidth: 200 }}>Your name
            <input style={fieldStyle} required value={form.name} onChange={(e) => set("name", e.target.value)} />
          </label>
          <label style={{ ...labelStyle, flex: 1, minWidth: 200 }}>Email
            <input type="email" style={fieldStyle} required value={form.email} onChange={(e) => set("email", e.target.value)} />
          </label>
        </div>
        <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <label style={{ ...labelStyle, flex: 1, minWidth: 200 }}>Business name
            <input style={fieldStyle} value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
          </label>
          <label style={{ ...labelStyle, flex: 1, minWidth: 200 }}>Phone (optional)
            <input style={fieldStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </label>
        </div>
        <label style={labelStyle}>Tell us about what you do
          <textarea style={{ ...fieldStyle, minHeight: 110 }} value={form.about} onChange={(e) => set("about", e.target.value)} placeholder="What help do you offer? Who do you serve?" />
        </label>
        <label style={labelStyle}>Budget (optional)
          <select style={fieldStyle} value={form.budget} onChange={(e) => set("budget", e.target.value)}>
            <option value="">Not sure yet</option>
            <option>Free / basic</option>
            <option>Under $100</option>
            <option>$100–$500</option>
            <option>$500+</option>
          </select>
        </label>

        {err && (
          <div style={{ background: "#fde8e8", border: "1px solid #f3c0c0", color: "#b13b3b",
                        borderRadius: 10, padding: "1rem 1.1rem", marginTop: "1.2rem", fontSize: ".92rem" }}>
            <strong>Couldn't submit:</strong> {err}
          </div>
        )}
        <button className="btn" disabled={busy} style={{ marginTop: "1.4rem" }}>
          {busy ? "Sending…" : "Request my website"}
        </button>
      </form>
    </main>
  );
}
