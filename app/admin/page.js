// app/admin/page.js
"use client";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";
import ImageDrop from "@/app/components/ImageDrop";

export default function Admin() {
  const [secret, setSecret] = useState("");
  const [queue, setQueue] = useState(null);
  const [requests, setRequests] = useState(null);
  const [msg, setMsg] = useState("");

  // All listings for the management panel
  const [allListings, setAllListings] = useState(null);
  const [mgrMsg, setMgrMsg] = useState("");

  async function loadListings() {
    const res = await fetch("/api/admin/listings", { headers: { "x-admin-secret": secret } });
    if (res.ok) { const j = await res.json(); setAllListings(j.listings || []); }
  }

  async function listingAction(listingId, payload) {
    setMgrMsg("");
    const res = await fetch("/api/admin/listings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ listingId, ...payload }),
    });
    if (!res.ok) { const j = await res.json(); setMgrMsg(j.error || "Action failed."); return; }
    await loadListings();
  }

  async function deleteListing(listingId, name) {
    if (!confirm(`Delete "${name}"? This removes it from the site permanently.`)) return;
    setMgrMsg("");
    const res = await fetch("/api/admin/listings", {
      method: "DELETE",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ listingId }),
    });
    if (!res.ok) { const j = await res.json(); setMgrMsg(j.error || "Delete failed."); return; }
    await loadListings();
  }

  // Admin "add a listing" form state
  const blankForm = {
    businessName: "", websiteUrl: "", description: "", headquarters: "",
    ownerName: "", ownerEmail: "", avatarUrl: "", headerUrl: "",
    categories: [], mode: "both", serviceAreaMiles: 25, nationwide: false,
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
        categories: addForm.categories,
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
      loadListings();
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
    // Also load all listings for the management panel.
    await loadListings();
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
  const btnSm = { padding: ".4rem .85rem", borderRadius: 8, fontSize: ".85rem", fontWeight: 700, cursor: "pointer", border: "none" };
  const btnGhost = { background: "#fff", border: "1px solid var(--silver)", color: "var(--ink)" };

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

          <div>
            <div style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: ".4rem" }}>Categories (pick all that apply):</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px,1fr))", gap: ".35rem" }}>
              {CATEGORIES.filter((c) => c.value !== "general").map((c) => {
                const on = addForm.categories.includes(c.value);
                return (
                  <label key={c.value} style={{
                    display: "flex", alignItems: "center", gap: ".4rem", padding: ".4rem .55rem",
                    border: "1px solid " + (on ? "var(--teal)" : "var(--silver)"), borderRadius: 8,
                    background: on ? "var(--teal-wash)" : "#fff", cursor: "pointer", fontSize: ".85rem",
                  }}>
                    <input type="checkbox" checked={on} onChange={(e) => {
                      const next = e.target.checked
                        ? [...addForm.categories, c.value]
                        : addForm.categories.filter((v) => v !== c.value);
                      setF("categories", next);
                    }} />
                    <span>{c.icon} {c.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <ImageDrop label="Profile picture" bucket="avatars" round value={addForm.avatarUrl} onChange={(url) => setF("avatarUrl", url)} />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
              <ImageDrop label="Banner image" bucket="headers" value={addForm.headerUrl} onChange={(url) => setF("headerUrl", url)} />
            </div>
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

      {/* ───────────── Admin: Manage existing listings ───────────── */}
      {allListings && (
        <section style={{ margin: "0 0 2.5rem" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: ".5rem" }}>
            <h2 style={{ fontWeight: 800, fontSize: "1.3rem" }}>Manage listings ({allListings.length})</h2>
            <button onClick={loadListings} style={{ background: "none", border: "none", color: "var(--teal-deep)", fontWeight: 600, cursor: "pointer" }}>↻ Refresh</button>
          </div>
          {mgrMsg && <p style={{ color: "#b13b3b", fontSize: ".9rem" }}>{mgrMsg}</p>}
          {allListings.length === 0 && <p style={{ color: "var(--muted)" }}>No listings yet.</p>}

          <div style={{ display: "flex", flexDirection: "column", gap: ".7rem", marginTop: ".8rem" }}>
            {allListings.map((l) => (
              <div key={l.id} style={{ border: "1px solid var(--line)", borderRadius: 12, padding: "1rem 1.1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: ".4rem" }}>
                  <strong style={{ fontSize: "1.05rem" }}>{l.business_name}</strong>
                  <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap" }}>
                    <span style={{ fontSize: ".75rem", fontWeight: 700, padding: ".2rem .6rem", borderRadius: 999,
                      background: l.is_live ? "var(--teal-wash)" : "#f3e8d0", color: l.is_live ? "var(--teal-deep)" : "#9a5a16" }}>
                      {l.is_live ? "● Live" : "○ Not live"}
                    </span>
                    {l.is_featured && (
                      <span style={{ fontSize: ".75rem", fontWeight: 700, padding: ".2rem .6rem", borderRadius: 999, background: "#fdf3c4", color: "#8a6d00" }}>★ Featured</span>
                    )}
                  </div>
                </div>
                <div style={{ color: "var(--muted)", fontSize: ".85rem", margin: ".3rem 0 .2rem" }}>
                  {l.headquarters || "—"} · {l.helper_email || "no email"}
                  {l.active_until ? ` · live until ${new Date(l.active_until).toLocaleDateString()}` : ""}
                </div>

                <div style={{ display: "flex", gap: ".5rem", marginTop: ".7rem", flexWrap: "wrap" }}>
                  {!l.is_live ? (
                    <button className="btn" style={btnSm} onClick={() => listingAction(l.id, { action: "makeLive", permanent: true })}>Make live (permanent)</button>
                  ) : (
                    <button style={{ ...btnSm, ...btnGhost }} onClick={() => listingAction(l.id, { action: "endLive" })}>Take down</button>
                  )}
                  {!l.is_featured ? (
                    <button className="btn" style={{ ...btnSm, background: "#caa42a", color: "#3a2e00" }} onClick={() => listingAction(l.id, { action: "feature", permanent: true })}>★ Feature</button>
                  ) : (
                    <button style={{ ...btnSm, ...btnGhost }} onClick={() => listingAction(l.id, { action: "unfeature" })}>Unfeature</button>
                  )}
                  <label style={{ ...btnSm, ...btnGhost, display: "flex", alignItems: "center", gap: ".35rem", cursor: "pointer" }}>
                    <input type="checkbox" checked={l.nationwide} onChange={(e) => listingAction(l.id, { nationwide: e.target.checked })} />
                    Nationwide
                  </label>
                  <button style={{ ...btnSm, ...btnGhost, color: "#b13b3b", borderColor: "#e3b9b9" }} onClick={() => deleteListing(l.id, l.business_name)}>Delete</button>
                </div>

                {/* Inline image editing — uploads save immediately */}
                <div style={{ display: "flex", gap: ".7rem", flexWrap: "wrap", marginTop: ".7rem" }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <ImageDrop label="Profile picture" bucket="avatars" round value={l.avatar_url}
                      onChange={(url) => listingAction(l.id, { avatarUrl: url })} />
                  </div>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <ImageDrop label="Banner image" bucket="headers" value={l.header_url}
                      onChange={(url) => listingAction(l.id, { headerUrl: url })} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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
