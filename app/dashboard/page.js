// app/dashboard/page.js
"use client";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";
import { uploadImage } from "@/lib/uploadImage";
import PayForm from "@/app/components/PayForm";

const supabase = browserClient();

export default function Dashboard() {
  const [session, setSession] = useState(null);
  const [email, setEmail] = useState("");
  const [listings, setListings] = useState([]);
  const [busyId, setBusyId] = useState("");
  const [msg, setMsg] = useState("");
  const [editId, setEditId] = useState("");
  const [editForm, setEditForm] = useState({});
  const [payId, setPayId] = useState("");   // which listing's pay form is open
  const [featId, setFeatId] = useState(""); // which listing's FEATURE pay form is open

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setEmail(data.session?.user?.email || "");
    });
  }, []);

  async function load() {
    if (!session) return;
    const { data: helper } = await supabase.from("helpers").select("id").eq("user_id", session.user.id).maybeSingle();
    if (!helper) return;
    const { data } = await supabase.from("listings").select("*").eq("helper_id", helper.id).order("created_at", { ascending: false });
    setListings(data || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [session]);

  if (!session) {
    return <main className="wrap" style={{ paddingTop: "8vh" }}><p>Please <a href="/join" style={{ color: "var(--teal-deep)", fontWeight: 600 }}>sign in</a> to see your listings.</p></main>;
  }

  function liveStatus(l) {
    const now = Date.now();
    const from = l.active_from ? new Date(l.active_from).getTime() : null;
    const until = l.active_until ? new Date(l.active_until).getTime() : null;
    if (until && now > until) return ["#fde8e8", "#b13b3b", "Expired — renew to relist"];
    if (from && now < from) return ["#eef1f4", "#52606d", "Scheduled"];
    if (until && now <= until) {
      const daysLeft = Math.ceil((until - now) / (24 * 3600 * 1000));
      return ["#e7f7f4", "var(--teal-deep)", `Live · ${daysLeft} day${daysLeft === 1 ? "" : "s"} left`];
    }
    // No active window → not paid yet → not live.
    return ["#fff4e5", "#9a6700", "Not live — activate to appear in search"];
  }

  const reviewPill = (s) => {
    const map = {
      approved: ["#e7f7f4", "var(--teal-deep)", "Approved"],
      pending: ["#fbf0e3", "#9a5a16", "In review"],
      rejected: ["#fde8e8", "#b13b3b", "Not approved"],
    };
    const [bg, fg, label] = map[s] || map.pending;
    return <span style={{ background: bg, color: fg, padding: ".2rem .6rem", borderRadius: 999, fontSize: ".75rem", fontWeight: 600 }}>{label}</span>;
  };

  async function changeImage(l, e, kind) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusyId(l.id); setMsg("");
    const { url, error } = await uploadImage(file, kind === "avatar" ? "avatars" : "headers");
    if (error) { setMsg("Upload failed: " + error); setBusyId(""); return; }
    const res = await fetch("/api/listings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: l.id, ownerEmail: email, [kind === "avatar" ? "avatarUrl" : "headerUrl"]: url }),
    });
    const j = await res.json();
    setBusyId("");
    if (!res.ok || j.error) setMsg(j.error || "Couldn't save image.");
    else { setMsg("Image updated."); load(); }
  }

  async function toggleNationwide(l) {
    setBusyId(l.id); setMsg("");
    const res = await fetch("/api/listings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: l.id, ownerEmail: email, nationwide: !l.nationwide }),
    });
    const j = await res.json();
    setBusyId("");
    if (!res.ok || j.error) setMsg(j.error || "Couldn't update.");
    else load();
  }

  async function saveEdit(l) {
    setBusyId(l.id); setMsg("");
    const res = await fetch("/api/listings", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: l.id, ownerEmail: email, ...editForm }),
    });
    const j = await res.json();
    setBusyId("");
    if (!res.ok || j.error) setMsg(j.error || "Couldn't save.");
    else { setMsg("Listing updated."); setEditId(""); load(); }
  }

  async function del(l) {
    if (!confirm(`Delete "${l.business_name}"? This can't be undone.`)) return;
    setBusyId(l.id); setMsg("");
    const res = await fetch("/api/listings", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId: l.id, ownerEmail: email }),
    });
    const j = await res.json();
    setBusyId("");
    if (!res.ok || j.error) setMsg(j.error || "Couldn't delete.");
    else { setMsg("Listing deleted."); setListings((p) => p.filter((x) => x.id !== l.id)); }
  }

  const uploadLabel = { cursor: "pointer", color: "var(--teal-deep)", fontWeight: 600, fontSize: ".82rem" };

  return (
    <main className="wrap" style={{ paddingTop: "4vh", paddingBottom: "4rem", maxWidth: 720 }}>
      <h1 style={{ fontWeight: 800, fontSize: "1.7rem" }}>My listings</h1>
      <p style={{ margin: ".5rem 0 1.4rem" }}><a className="btn" href="/join">+ Add a listing</a></p>
      {msg && <div style={{ background: "var(--teal-wash)", color: "var(--teal-deep)", borderRadius: 10, padding: ".7rem 1rem", marginBottom: "1rem", fontSize: ".9rem" }}>{msg}</div>}
      {listings.length === 0 && <p style={{ color: "var(--muted)" }}>No listings yet.</p>}

      {listings.map((l) => {
        const [bg, fg, label] = liveStatus(l);
        return (
          <div key={l.id} style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.1rem 1.2rem", marginBottom: "1rem", opacity: busyId === l.id ? 0.6 : 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: ".5rem", flexWrap: "wrap" }}>
              <strong style={{ fontSize: "1.05rem" }}>{l.business_name}</strong>
              <div style={{ display: "flex", gap: ".4rem", alignItems: "center" }}>
                {reviewPill(l.review_status)}
                <span style={{ background: bg, color: fg, padding: ".2rem .6rem", borderRadius: 999, fontSize: ".75rem", fontWeight: 600 }}>{label}</span>
              </div>
            </div>
            <div style={{ color: "var(--teal-deep)", fontSize: ".85rem" }}>{l.website_url}</div>
            {editId === l.id ? (
              <div style={{ marginTop: ".6rem", display: "flex", flexDirection: "column", gap: ".6rem" }}>
                {(() => {
                  const fld = { width: "100%", border: "1px solid var(--silver)", borderRadius: 9, padding: ".55rem .8rem", fontSize: ".92rem" };
                  const upd = (k) => (e) => setEditForm((f) => ({ ...f, [k]: e.target.value }));
                  const lbl = { fontSize: ".8rem", fontWeight: 600, color: "var(--muted)", marginBottom: ".15rem", display: "block" };
                  return (
                    <>
                      <div><span style={lbl}>Business name</span><input style={fld} value={editForm.businessName ?? ""} onChange={upd("businessName")} /></div>
                      <div><span style={lbl}>Website</span><input style={fld} value={editForm.websiteUrl ?? ""} onChange={upd("websiteUrl")} /></div>
                      <div><span style={lbl}>What you offer</span><textarea style={{ ...fld, minHeight: 70 }} value={editForm.description ?? ""} onChange={upd("description")} /></div>
                      <div><span style={lbl}>Categories (comma separated)</span><input style={fld} value={editForm.categories ?? ""} onChange={upd("categories")} /></div>
                      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 140 }}><span style={lbl}>Mode</span>
                          <select style={fld} value={editForm.mode ?? "both"} onChange={upd("mode")}>
                            <option value="both">🌐 Virtual + 📍 In person</option>
                            <option value="virtual">🌐 Virtual only</option>
                            <option value="in_person">📍 In person only</option>
                          </select>
                        </div>
                        <div style={{ flex: 1, minWidth: 110 }}><span style={lbl}>Service area (mi)</span><input type="number" style={fld} value={editForm.serviceAreaMiles ?? 25} onChange={upd("serviceAreaMiles")} /></div>
                      </div>
                      <div><span style={lbl}>Headquarters</span><input style={fld} value={editForm.headquarters ?? ""} onChange={upd("headquarters")} /></div>
                      <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
                        <div style={{ flex: 1, minWidth: 140 }}><span style={lbl}>Phone</span><input style={fld} value={editForm.phone ?? ""} onChange={upd("phone")} /></div>
                        <div style={{ flex: 1, minWidth: 140 }}><span style={lbl}>Hours</span><input style={fld} value={editForm.hours ?? ""} onChange={upd("hours")} /></div>
                      </div>
                      <div><span style={lbl}>Address</span><input style={fld} value={editForm.address ?? ""} onChange={upd("address")} /></div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: ".5rem" }}>
                        {[["instagram","Instagram"],["facebook","Facebook"],["tiktok","TikTok"],["twitter","X / Twitter"],["youtube","YouTube"],["linkedin","LinkedIn"]].map(([k, label]) => (
                          <div key={k}><span style={lbl}>{label}</span><input style={fld} value={editForm[k] ?? ""} onChange={upd(k)} placeholder="https://…" /></div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: ".6rem", marginTop: ".4rem" }}>
                        <button onClick={() => saveEdit(l)} className="btn" style={{ padding: ".45rem 1.2rem" }}>Save all</button>
                        <button onClick={() => setEditId("")} style={{ border: "none", background: "none", color: "var(--muted)", cursor: "pointer" }}>cancel</button>
                      </div>
                    </>
                  );
                })()}
              </div>
            ) : (
              <div style={{ color: "var(--muted)", fontSize: ".9rem", marginTop: ".3rem" }}>{l.description}</div>
            )}

            <div style={{ display: "flex", gap: ".5rem", marginTop: ".7rem", alignItems: "center", flexWrap: "wrap" }}>
              {l.avatar_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={l.avatar_url} alt="" style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover", border: "1px solid var(--line)" }} />
                : <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--silver)" }} />}
              {l.header_url
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={l.header_url} alt="" style={{ width: 80, height: 44, borderRadius: 8, objectFit: "cover", border: "1px solid var(--line)" }} />
                : <div style={{ width: 80, height: 44, borderRadius: 8, background: "var(--silver)" }} />}
              <label style={uploadLabel}>Change pic<input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => changeImage(l, e, "avatar")} /></label>
              <label style={uploadLabel}>Change banner<input type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => changeImage(l, e, "header")} /></label>
            </div>

            <div style={{ display: "flex", gap: "1rem", marginTop: ".9rem", alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ fontSize: ".85rem", display: "flex", alignItems: "center", gap: ".4rem", cursor: "pointer" }}>
                <input type="checkbox" checked={!!l.nationwide} onChange={() => toggleNationwide(l)} />
                🇺🇸 Nationwide (USA)
              </label>
              <div style={{ marginLeft: "auto", display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
                <button onClick={() => { setPayId(payId === l.id ? "" : l.id); setFeatId(""); }}
                  className="btn" style={{ padding: ".35rem .9rem", fontSize: ".82rem" }}>
                  {l.active_until && new Date(l.active_until) > new Date() ? "Add days" : "Make live ($5/day)"}
                </button>
                <button onClick={() => { setFeatId(featId === l.id ? "" : l.id); setPayId(""); }}
                  style={{ border: "none", background: "#9a6700", color: "#fff", borderRadius: 999, padding: ".35rem .9rem", fontWeight: 700, fontSize: ".82rem", cursor: "pointer" }}>
                  {l.featured_until && new Date(l.featured_until) > new Date() ? "⭐ Featured — add days" : "⭐ Feature ($20/day)"}
                </button>
                <button onClick={() => { setEditId(l.id); setEditForm({
                  businessName: l.business_name || "", websiteUrl: l.website_url || "", description: l.description || "",
                  categories: Array.isArray(l.categories) ? l.categories.join(", ") : (l.categories || ""),
                  mode: l.mode || "both", serviceAreaMiles: l.service_area_miles || 25, headquarters: l.headquarters || "",
                  phone: l.phone || "", hours: l.hours || "", address: l.address || "",
                  instagram: l.instagram || "", facebook: l.facebook || "", tiktok: l.tiktok || "",
                  twitter: l.twitter || "", youtube: l.youtube || "", linkedin: l.linkedin || "",
                }); }}
                  style={{ border: "1px solid var(--silver)", background: "#fff", color: "var(--teal-deep)", borderRadius: 999, padding: ".35rem .9rem", fontWeight: 600, fontSize: ".82rem", cursor: "pointer" }}>
                  Edit details
                </button>
                <button onClick={() => del(l)} style={{ border: "1px solid #f3c0c0", background: "#fff", color: "#b13b3b", borderRadius: 999, padding: ".35rem .9rem", fontWeight: 600, fontSize: ".82rem", cursor: "pointer" }}>
                  Delete
                </button>
              </div>
            </div>

            {payId === l.id && (
              <div style={{ marginTop: "1rem" }}>
                <PayForm listingId={l.id} ownerEmail={email} pricePerDay={5} purpose="live"
                  onPaid={() => { setPayId(""); load(); }} />
              </div>
            )}
            {featId === l.id && (
              <div style={{ marginTop: "1rem" }}>
                <p style={{ fontSize: ".85rem", color: "var(--muted)", marginBottom: ".5rem" }}>
                  ⭐ Featured listings appear on the home page under “All” for the days you pay for. ($20/day)
                </p>
                <PayForm listingId={l.id} ownerEmail={email} pricePerDay={20} purpose="featured"
                  onPaid={() => { setFeatId(""); load(); }} />
              </div>
            )}
          </div>
        );
      })}
    </main>
  );
}
