// app/admin/page.js
"use client";
import { useState } from "react";

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [queue, setQueue] = useState(null);
  const [requests, setRequests] = useState(null);
  const [msg, setMsg] = useState("");

  async function load() {
    setMsg("");
    const res = await fetch("/api/admin/queue", { headers: { "x-admin-secret": secret } });
    if (!res.ok) { setMsg("Wrong admin secret."); return; }
    const json = await res.json();
    setQueue(json.queue);
    // Also load website build requests.
    const r2 = await fetch("/api/admin/website-requests", { headers: { "x-admin-secret": secret } });
    if (r2.ok) { const j2 = await r2.json(); setRequests(j2.requests || []); }
  }

  async function decide(listingId, decision) {
    await fetch("/api/admin/queue", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ listingId, decision }),
    });
    setQueue((q) => q.filter((l) => l.id !== listingId));
  }

  function scoreColor(s) {
    if (s >= 50) return "#b13b3b";
    if (s >= 20) return "#9a5a16";
    return "var(--teal-deep)";
  }

  return (
    <main className="wrap" style={{ paddingTop: "4vh", paddingBottom: "4rem", maxWidth: 820 }}>
      <h1 style={{ fontWeight: 800, fontSize: "1.7rem" }}>Review queue</h1>
      <p style={{ color: "var(--muted)", margin: ".4rem 0 1rem" }}>
        Listings flagged for review, most likely-to-be-a-corporation first. Approve the genuine small businesses; reject the corporations.
      </p>

      {!queue && (
        <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
          <input
            type="password" value={secret} onChange={(e) => setSecret(e.target.value)}
            placeholder="Admin secret"
            style={{ border: "1px solid var(--silver)", borderRadius: 9, padding: ".6rem .9rem", flex: 1 }}
          />
          <button className="btn" onClick={load}>Open queue</button>
        </div>
      )}
      {msg && <p style={{ color: "#b13b3b" }}>{msg}</p>}

      {queue && queue.length === 0 && <p style={{ color: "var(--muted)" }}>🎉 Queue is empty — nothing to review.</p>}

      {queue && queue.map((l) => (
        <div key={l.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "1.2rem", marginBottom: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong style={{ fontSize: "1.1rem" }}>{l.business_name}</strong>
              <a href={l.website_url.startsWith("http") ? l.website_url : "https://" + l.website_url} target="_blank" rel="noopener"
                 style={{ color: "var(--teal-deep)", marginLeft: ".6rem", fontSize: ".88rem" }}>
                {l.website_url} ↗
              </a>
            </div>
            <span style={{ color: scoreColor(l.corp_score), fontWeight: 700 }}>
              corp score {l.corp_score}
            </span>
          </div>
          <div style={{ color: "var(--muted)", fontSize: ".9rem", margin: ".4rem 0" }}>
            {l.helpers?.name} · {l.helpers?.location_text || "—"} · attested: {l.attested_independent ? "yes" : "no"}
          </div>
          <div style={{ fontSize: ".94rem" }}>{l.description}</div>
          {l.corp_flags?.length > 0 && (
            <ul style={{ margin: ".7rem 0 0 1.1rem", color: "var(--muted)", fontSize: ".85rem" }}>
              {l.corp_flags.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
          )}
          <div style={{ marginTop: "1rem", display: "flex", gap: 10 }}>
            <button className="btn" onClick={() => decide(l.id, "approve")}>✓ Approve (small business)</button>
            <button className="btn btn-dark" onClick={() => decide(l.id, "reject")}>✕ Reject (corporation)</button>
          </div>
        </div>
      ))}

      {/* Website build requests */}
      {requests && (
        <section style={{ marginTop: "2.5rem" }}>
          <h2 style={{ fontWeight: 800, fontSize: "1.4rem" }}>Website requests ({requests.length})</h2>
          <p style={{ color: "var(--muted)", margin: ".3rem 0 1rem", fontSize: ".9rem" }}>
            People who asked for a website. Reach out to them by email to get started.
          </p>
          {requests.length === 0 && <p style={{ color: "var(--muted)" }}>No requests yet.</p>}
          {requests.map((r) => (
            <div key={r.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.1rem", marginBottom: ".8rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: ".4rem" }}>
                <strong>{r.name}{r.business_name ? ` — ${r.business_name}` : ""}</strong>
                <span style={{ color: "var(--muted)", fontSize: ".82rem" }}>{new Date(r.created_at).toLocaleString()}</span>
              </div>
              <div style={{ fontSize: ".9rem", marginTop: ".3rem" }}>
                ✉️ <a href={`mailto:${r.email}`} style={{ color: "var(--teal-deep)" }}>{r.email}</a>
                {r.phone ? <> · 📞 {r.phone}</> : null}
                {r.budget ? <> · 💰 {r.budget}</> : null}
              </div>
              {r.about && <div style={{ fontSize: ".92rem", marginTop: ".4rem", color: "var(--ink)" }}>{r.about}</div>}
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
