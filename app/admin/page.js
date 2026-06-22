// app/admin/page.js
"use client";
import { useState } from "react";

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [queue, setQueue] = useState(null);
  const [requests, setRequests] = useState(null);
  const [msg, setMsg] = useState("");

  // Admin "add a listing" form state
  const blankForm = {
    businessName: "", websiteUrl: "", description: "", headquarters: "",
    ownerName: "", ownerEmail: "", avatarUrl: "", headerUrl: "",
    categories: "", mode: "both", serviceAreaMiles: 25, nationwide: false,
    phone: "", hours: "", address: "",
    instagram: "", facebook: "", tiktok: "", twitter: "", youtube: "", linkedin: "",
    durationDays: 30, permanent: true, featured: false, featuredDays: 30,
  };
  const [addForm, setAddForm] = useState(blankForm);
  const [addMsg, setAddMsg] = useState("");
  const [adding, setAdding] = useState(false);
  const setF = (k, v) => setAddForm((f) => ({ ...f, [k]: v }));

  async function addListing() {
    setAddMsg("");
    if (!addForm.businessName.trim()) { setAddMsg("Business name is required."); return; }
    if (!secret) { setAddMsg("Enter the admin secret at the top first."); return; }
    setAdding(true);
    try {
      const payload = {
        ...addForm,
        categories: addForm.categories
          ? addForm.categories.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
      };
      const res = await fetch("/api/admin/add-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-admin-secret": secret },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) { setAddMsg(json.error || "Could not add listing."); setAdding(false); return; }
      setAddMsg("✅ " + (json.message || "Listing added and live."));
      setAddForm(blankForm);
    } catch {
      setAddMsg("Something went wrong.");
    }
    setAdding(false);
  }

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

  const inp = { border: "1px solid var(--silver)", borderRadius: 9, padding: ".6rem .8rem", width: "100%", background: "#fff", fontSize: ".95rem" };

  return (
    <main className="wrap" style={{ paddingTop: "4vh", paddingBottom: "4rem", maxWidth: 820 }}>
      <h1 style={{ fontWeight: 800, fontSize: "1.7rem" }}>Review queue</h1>
      <p style={{ color: "var(--muted)", margin: ".4rem 0 1rem" }}>
        Listings flagged for review, most likely-to-be-a-corporation first. Approve the genuine small businesses; reject the corporations.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: "1rem" }}>
        <input
          type="password" value={secret} onChange={(e) => setSecret(e.target.value)}
          placeholder="Admin secret"
          style={{ border: "1px solid var(--silver)", borderRadius: 9, padding: ".6rem .9rem", flex: 1 }}
        />
        {!queue && <button className="btn" onClick={load}>Open queue</button>}
      </div>
      {msg && <p style={{ color: "#b13b3b" }}>{msg}</p>}

      {/* ───────────── Admin: Add a listing (no payment) ───────────── */}
      <section style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.3rem", margin: "1.5rem 0 2.5rem", background: "var(--silver-bg)" }}>
        <h2 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Add a listing (admin)</h2>
        <p style={{ color: "var(--muted)", fontSize: ".9rem", margin: ".3rem 0 1rem" }}>
          Create a listing that goes live immediately — no payment. Enter the admin secret above first.
        </p>

        <div style={{ display: "grid", gap: ".7rem" }}>
          <input style={inp} placeholder="Business name *" value={addForm.businessName} onChange={(e) => setF("businessName", e.target.value)} />
          <input style={inp} placeholder="Website (e.g. example.com)" value={addForm.websiteUrl} onChange={(e) => setF("websiteUrl", e.target.value)} />
          <textarea style={{ ...inp, minHeight: 70, resize: "vertical" }} placeholder="Short description of what they do" value={addForm.description} onChange={(e) => setF("description", e.target.value)} />

          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
            <input style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="City / headquarters (e.g. Austin, TX)" value={addForm.headquarters} onChange={(e) => setF("headquarters", e.target.value)} />
            <select style={{ ...inp, flex: 1, minWidth: 200 }} value={addForm.mode} onChange={(e) => setF("mode", e.target.value)}>
              <option value="both">🌐 Virtual + 📍 In person</option>
              <option value="virtual">🌐 Virtual only</option>
              <option value="in_person">📍 In person only</option>
            </select>
          </div>

          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
            <input style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="Owner/contact name (optional)" value={addForm.ownerName} onChange={(e) => setF("ownerName", e.target.value)} />
            <input style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="Contact email (optional)" value={addForm.ownerEmail} onChange={(e) => setF("ownerEmail", e.target.value)} />
          </div>

          <input style={inp} placeholder="Categories, comma-separated (e.g. tech help, setup, wifi)" value={addForm.categories} onChange={(e) => setF("categories", e.target.value)} />

          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
            <input style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="Profile picture URL" value={addForm.avatarUrl} onChange={(e) => setF("avatarUrl", e.target.value)} />
            <input style={{ ...inp, flex: 1, minWidth: 200 }} placeholder="Banner image URL" value={addForm.headerUrl} onChange={(e) => setF("headerUrl", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px,1fr))", gap: ".7rem" }}>
            <input style={inp} placeholder="Phone (optional)" value={addForm.phone} onChange={(e) => setF("phone", e.target.value)} />
            <input style={inp} placeholder="Hours (optional)" value={addForm.hours} onChange={(e) => setF("hours", e.target.value)} />
            <input style={inp} placeholder="Address (optional)" value={addForm.address} onChange={(e) => setF("address", e.target.value)} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px,1fr))", gap: ".7rem" }}>
            <input style={inp} placeholder="Instagram" value={addForm.instagram} onChange={(e) => setF("instagram", e.target.value)} />
            <input style={inp} placeholder="Facebook" value={addForm.facebook} onChange={(e) => setF("facebook", e.target.value)} />
            <input style={inp} placeholder="TikTok" value={addForm.tiktok} onChange={(e) => setF("tiktok", e.target.value)} />
            <input style={inp} placeholder="YouTube" value={addForm.youtube} onChange={(e) => setF("youtube", e.target.value)} />
          </div>

          {/* Duration + featured controls */}
          <div style={{ borderTop: "1px solid var(--line)", marginTop: ".4rem", paddingTop: ".9rem", display: "flex", flexWrap: "wrap", gap: "1.2rem", alignItems: "center" }}>
            <label style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".92rem", cursor: "pointer" }}>
              <input type="checkbox" checked={addForm.permanent} onChange={(e) => setF("permanent", e.target.checked)} />
              Permanent (never expires)
            </label>
            {!addForm.permanent && (
              <label style={{ fontSize: ".92rem", display: "flex", alignItems: "center", gap: ".45rem" }}>
                Live for
                <input type="number" min="1" style={{ ...inp, width: 80 }} value={addForm.durationDays} onChange={(e) => setF("durationDays", e.target.value)} />
                days
              </label>
            )}
            <label style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".92rem", cursor: "pointer" }}>
              <input type="checkbox" checked={addForm.nationwide} onChange={(e) => setF("nationwide", e.target.checked)} />
              🇺🇸 Nationwide
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: ".45rem", fontSize: ".92rem", cursor: "pointer" }}>
              <input type="checkbox" checked={addForm.featured} onChange={(e) => setF("featured", e.target.checked)} />
              ⭐ Featured on home page
            </label>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <button className="btn" onClick={addListing} disabled={adding}>
              {adding ? "Adding…" : "Add listing — go live now"}
            </button>
            {addMsg && (
              <span style={{ fontSize: ".9rem", color: addMsg.startsWith("✅") ? "var(--teal-deep)" : "#b13b3b" }}>
                {addMsg}
              </span>
            )}
          </div>
        </div>
      </section>

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
