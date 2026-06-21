// app/community/page.js
"use client";
import { useEffect, useState } from "react";
import { browserClient } from "@/lib/supabase";
import AuthForm from "@/app/components/AuthForm";
import { CATEGORIES, categoryLabel } from "@/lib/categories";

const supabase = browserClient();

function youTubeEmbed(url) {
  if (!url) return "";
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (!m) return "";
  const id = m[1];
  // autoplay + loop (loop needs playlist=<id>), muted so browsers allow autoplay
  return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&loop=1&playlist=${id}&controls=1`;
}
function timeAgo(iso) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return Math.floor(s / 60) + "m ago";
  if (s < 86400) return Math.floor(s / 3600) + "h ago";
  return Math.floor(s / 86400) + "d ago";
}

export default function Community() {
  const [session, setSession] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({ authorName: "", authorKind: "client", category: "general", body: "", imageUrl: "", videoUrl: "", linkUrl: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [editingId, setEditingId] = useState("");
  const [editForm, setEditForm] = useState({});
  const [likeCounts, setLikeCounts] = useState({});
  const [likedIds, setLikedIds] = useState([]);
  const [openComments, setOpenComments] = useState("");   // postId whose comments are open
  const [comments, setComments] = useState({});            // postId -> [comments]
  const [commentText, setCommentText] = useState("");
  const [shareMsg, setShareMsg] = useState("");
  function set(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      const nm = data.session?.user?.user_metadata?.name || data.session?.user?.email?.split("@")[0] || "";
      setForm((f) => ({ ...f, authorName: nm }));
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  function load(cat = filter) {
    setLoading(true);
    const url = cat && cat !== "all" ? `/api/posts?category=${cat}` : "/api/posts";
    fetch(url).then((r) => r.json()).then((j) => {
      const list = j.posts || [];
      setPosts(list);
      const ids = list.map((p) => p.id).join(",");
      if (ids) {
        const uid = session?.user?.id || "";
        fetch(`/api/likes?postIds=${ids}&userId=${uid}`).then((r) => r.json()).then((lj) => {
          setLikeCounts(lj.counts || {});
          setLikedIds(lj.liked || []);
        }).catch(() => {});
      }
    }).catch(() => setPosts([])).finally(() => setLoading(false));
  }
  useEffect(() => { load("all"); /* eslint-disable-next-line */ }, []);

  if (!session) {
    return <AuthForm title="Join the community" blurb="Sign in or create an account to post and reply in the community." />;
  }
  const userId = session.user.id;

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const res = await fetch("/api/posts", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, userId }),
      });
      const j = await res.json();
      if (!res.ok || j.error) setErr(j.error || "Couldn't post.");
      else {
        setForm((f) => ({ ...f, body: "", imageUrl: "", videoUrl: "", linkUrl: "" }));
        if (filter === "all" || filter === j.post.category) setPosts((p) => [j.post, ...p]);
      }
    } catch (e2) { setErr("Couldn't reach the server. " + e2.message); }
    setBusy(false);
  }

  async function deletePost(p) {
    if (!confirm("Delete this post?")) return;
    const res = await fetch("/api/posts", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: p.id, userId }),
    });
    const j = await res.json();
    if (!res.ok || j.error) { setErr(j.error || "Couldn't delete."); return; }
    setPosts((list) => list.filter((x) => x.id !== p.id));
  }

  function startEdit(p) {
    setEditingId(p.id);
    setEditForm({ body: p.body || "", category: p.category || "general", imageUrl: p.image_url || "", videoUrl: p.video_url || "", linkUrl: p.link_url || "" });
  }
  async function saveEdit(p) {
    const res = await fetch("/api/posts", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: p.id, userId, ...editForm }),
    });
    const j = await res.json();
    if (!res.ok || j.error) { setErr(j.error || "Couldn't save."); return; }
    setPosts((list) => list.map((x) => (x.id === p.id ? j.post : x)));
    setEditingId("");
  }

  async function toggleLike(p) {
    const res = await fetch("/api/likes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: p.id, userId }),
    });
    const j = await res.json();
    if (j.error) return;
    setLikeCounts((c) => ({ ...c, [p.id]: j.count }));
    setLikedIds((ids) => j.liked ? [...ids, p.id] : ids.filter((x) => x !== p.id));
  }

  async function toggleComments(p) {
    if (openComments === p.id) { setOpenComments(""); return; }
    setOpenComments(p.id);
    setCommentText("");
    const res = await fetch(`/api/comments?postId=${p.id}`);
    const j = await res.json();
    setComments((c) => ({ ...c, [p.id]: j.comments || [] }));
  }

  async function addComment(p) {
    if (!commentText.trim()) return;
    const res = await fetch("/api/comments", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId: p.id, userId, authorName: form.authorName, body: commentText }),
    });
    const j = await res.json();
    if (j.error) { setErr(j.error); return; }
    setComments((c) => ({ ...c, [p.id]: [...(c[p.id] || []), j.comment] }));
    setCommentText("");
  }

  async function deleteComment(p, cmt) {
    const res = await fetch("/api/comments", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ commentId: cmt.id, userId }),
    });
    const j = await res.json();
    if (j.error) return;
    setComments((c) => ({ ...c, [p.id]: (c[p.id] || []).filter((x) => x.id !== cmt.id) }));
  }

  async function share(p) {
    const text = (p.body || "Check out this post on Helpful x Humans").slice(0, 120);
    const url = window.location.origin + "/community";
    if (navigator.share) {
      try { await navigator.share({ title: "Helpful x Humans", text, url }); return; } catch {}
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareMsg(p.id);
      setTimeout(() => setShareMsg(""), 1500);
    } catch {}
  }

  const fieldStyle = { width: "100%", border: "1px solid var(--silver)", borderRadius: 9, padding: ".6rem .8rem", marginTop: ".3rem", fontSize: ".92rem" };
  function changeFilter(c) { setFilter(c); load(c); }

  return (
    <main className="wrap" style={{ maxWidth: 860, paddingTop: "4vh", paddingBottom: "4rem" }}>
      <h1 style={{ fontWeight: 800, fontSize: "1.9rem", letterSpacing: "-.02em" }}>Community</h1>
      <p style={{ color: "var(--muted)", margin: ".5rem 0 1.2rem" }}>
        Helpers and clients sharing updates, asks, and recommendations. Pick a category to post or browse.
      </p>

      {/* Category filter chips */}
      <div style={{ display: "flex", gap: ".4rem", flexWrap: "wrap", marginBottom: "1.4rem" }}>
        {[{ value: "all", label: "All", icon: "🗂️" }, ...CATEGORIES].map((c) => (
          <button key={c.value} onClick={() => changeFilter(c.value)}
            style={{ border: "1px solid " + (filter === c.value ? "var(--teal)" : "var(--silver)"),
              background: filter === c.value ? "var(--teal-wash)" : "#fff",
              color: filter === c.value ? "var(--teal-deep)" : "var(--muted)",
              borderRadius: 999, padding: ".3rem .75rem", fontWeight: 600, cursor: "pointer", fontSize: ".82rem" }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Composer */}
      <form onSubmit={submit} style={{ border: "1px solid var(--line)", borderRadius: 16, padding: "1.1rem", marginBottom: "2rem", background: "#fff" }}>
        <div style={{ display: "flex", gap: ".6rem", flexWrap: "wrap" }}>
          <input style={{ ...fieldStyle, flex: 1, minWidth: 140 }} placeholder="Your name" value={form.authorName} onChange={(e) => set("authorName", e.target.value)} />
          <select style={{ ...fieldStyle, width: "auto" }} value={form.authorKind} onChange={(e) => set("authorKind", e.target.value)}>
            <option value="client">I'm a client</option>
            <option value="helper">I'm a helper</option>
          </select>
          <select style={{ ...fieldStyle, width: "auto" }} value={form.category} onChange={(e) => set("category", e.target.value)}>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </select>
        </div>
        <textarea style={{ ...fieldStyle, minHeight: 80 }} placeholder="What's on your mind?" value={form.body} onChange={(e) => set("body", e.target.value)} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: ".6rem" }}>
          <input style={fieldStyle} placeholder="🖼️ Image link (optional)" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} />
          <input style={fieldStyle} placeholder="🎬 Video link (YouTube ok)" value={form.videoUrl} onChange={(e) => set("videoUrl", e.target.value)} />
          <input style={fieldStyle} placeholder="🔗 Link (optional)" value={form.linkUrl} onChange={(e) => set("linkUrl", e.target.value)} />
        </div>
        {err && <div style={{ color: "#b13b3b", fontSize: ".88rem", marginTop: ".6rem" }}>{err}</div>}
        <button className="btn" disabled={busy} style={{ marginTop: ".9rem" }}>{busy ? "Posting…" : "Post"}</button>
      </form>

      {loading && <p style={{ color: "var(--muted)" }}>Loading posts…</p>}
      {!loading && posts.length === 0 && <p style={{ color: "var(--muted)" }}>No posts here yet — be the first!</p>}

      <div style={{ display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        {posts.map((p) => {
          const yt = youTubeEmbed(p.video_url);
          const mine = p.user_id === userId;
          const editing = editingId === p.id;
          return (
            <article key={p.id} style={{ border: "1px solid var(--line)", borderRadius: 16, padding: "1.1rem", background: "#fff" }}>
              <div style={{ display: "flex", alignItems: "center", gap: ".6rem", marginBottom: ".6rem" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: p.author_kind === "helper" ? "var(--teal)" : "var(--silver)",
                              color: p.author_kind === "helper" ? "#fff" : "var(--ink)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800 }}>
                  {(p.author_name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: ".95rem" }}>{p.author_name}
                    <span style={{ marginLeft: ".5rem", fontSize: ".72rem", fontWeight: 600, color: "var(--teal-deep)", background: "var(--teal-wash)", padding: ".1rem .5rem", borderRadius: 999 }}>
                      {p.author_kind === "helper" ? "Helper" : "Client"}
                    </span>
                    <span style={{ marginLeft: ".4rem", fontSize: ".72rem", color: "var(--muted)" }}>{categoryLabel(p.category)}</span>
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: ".78rem" }}>{timeAgo(p.created_at)}</div>
                </div>
                {mine && !editing && (
                  <div style={{ marginLeft: "auto", display: "flex", gap: ".6rem" }}>
                    <button onClick={() => startEdit(p)} style={{ border: "none", background: "none", color: "var(--teal-deep)", cursor: "pointer", fontSize: ".82rem", textDecoration: "underline" }}>edit</button>
                    <button onClick={() => deletePost(p)} style={{ border: "none", background: "none", color: "#b13b3b", cursor: "pointer", fontSize: ".82rem", textDecoration: "underline" }}>delete</button>
                  </div>
                )}
              </div>

              {editing ? (
                <div>
                  <select style={fieldStyle} value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}>
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                  <textarea style={{ ...fieldStyle, minHeight: 70 }} value={editForm.body} onChange={(e) => setEditForm((f) => ({ ...f, body: e.target.value }))} />
                  <input style={fieldStyle} placeholder="🖼️ Image link" value={editForm.imageUrl} onChange={(e) => setEditForm((f) => ({ ...f, imageUrl: e.target.value }))} />
                  <input style={fieldStyle} placeholder="🎬 Video link" value={editForm.videoUrl} onChange={(e) => setEditForm((f) => ({ ...f, videoUrl: e.target.value }))} />
                  <input style={fieldStyle} placeholder="🔗 Link" value={editForm.linkUrl} onChange={(e) => setEditForm((f) => ({ ...f, linkUrl: e.target.value }))} />
                  <div style={{ display: "flex", gap: ".6rem", marginTop: ".7rem" }}>
                    <button onClick={() => saveEdit(p)} className="btn" style={{ padding: ".4rem 1rem" }}>Save</button>
                    <button onClick={() => setEditingId("")} style={{ border: "none", background: "none", color: "var(--muted)", cursor: "pointer" }}>cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  {p.body && <p style={{ fontSize: ".96rem", whiteSpace: "pre-wrap", marginBottom: ".6rem" }}>{p.body}</p>}
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--line)", marginBottom: ".6rem" }}
                         onError={(e) => { e.currentTarget.style.display = "none"; }} />
                  )}
                  {yt ? (
                    <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, marginBottom: ".6rem", borderRadius: 12, overflow: "hidden" }}>
                      <iframe src={yt} title="video" allowFullScreen style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }} />
                    </div>
                  ) : p.video_url ? (
                    <video src={p.video_url} autoPlay loop muted playsInline controls style={{ width: "100%", borderRadius: 12, marginBottom: ".6rem" }} />
                  ) : null}
                  {p.link_url && (
                    <a href={p.link_url} target="_blank" rel="noopener noreferrer"
                       style={{ display: "inline-block", color: "var(--teal-deep)", fontWeight: 600, fontSize: ".9rem", wordBreak: "break-all" }}>
                      🔗 {p.link_url}
                    </a>
                  )}

                  {/* Action bar: like, comment, share */}
                  <div style={{ display: "flex", gap: "1.2rem", marginTop: ".9rem", paddingTop: ".7rem", borderTop: "1px solid var(--line)", fontSize: ".88rem" }}>
                    <button onClick={() => toggleLike(p)} style={{ border: "none", background: "none", cursor: "pointer", color: likedIds.includes(p.id) ? "var(--teal-deep)" : "var(--muted)", fontWeight: 600 }}>
                      {likedIds.includes(p.id) ? "❤️" : "🤍"} {likeCounts[p.id] || 0}
                    </button>
                    <button onClick={() => toggleComments(p)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted)", fontWeight: 600 }}>
                      💬 Comment
                    </button>
                    <button onClick={() => share(p)} style={{ border: "none", background: "none", cursor: "pointer", color: "var(--muted)", fontWeight: 600 }}>
                      {shareMsg === p.id ? "✓ Copied!" : "↗ Share"}
                    </button>
                  </div>

                  {/* Comments thread */}
                  {openComments === p.id && (
                    <div style={{ marginTop: ".8rem", borderTop: "1px solid var(--line)", paddingTop: ".8rem" }}>
                      {(comments[p.id] || []).map((cmt) => (
                        <div key={cmt.id} style={{ display: "flex", gap: ".5rem", marginBottom: ".6rem", fontSize: ".9rem" }}>
                          <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--silver)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: ".8rem", flexShrink: 0 }}>
                            {(cmt.author_name || "?")[0].toUpperCase()}
                          </div>
                          <div style={{ background: "var(--silver-bg)", borderRadius: 10, padding: ".4rem .7rem", flex: 1 }}>
                            <strong style={{ fontSize: ".82rem" }}>{cmt.author_name}</strong>
                            <div>{cmt.body}</div>
                          </div>
                          {cmt.user_id === userId && (
                            <button onClick={() => deleteComment(p, cmt)} style={{ border: "none", background: "none", color: "#b13b3b", cursor: "pointer", fontSize: ".75rem" }}>✕</button>
                          )}
                        </div>
                      ))}
                      <div style={{ display: "flex", gap: ".5rem", marginTop: ".5rem" }}>
                        <input value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment…"
                               onKeyDown={(e) => { if (e.key === "Enter") addComment(p); }}
                               style={{ flex: 1, border: "1px solid var(--silver)", borderRadius: 999, padding: ".5rem .9rem", fontSize: ".9rem" }} />
                        <button onClick={() => addComment(p)} className="btn" style={{ padding: ".4rem 1rem" }}>Send</button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
