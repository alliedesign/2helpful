// app/components/AuthForm.js
"use client";
import { useState } from "react";
import { browserClient } from "@/lib/supabase";

const supabase = browserClient();

// Email + password sign-in / sign-up. Renders inline; on success the parent's
// onAuthStateChange picks up the new session automatically.
export default function AuthForm({ title = "Sign in", blurb = "" }) {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr(""); setInfo("");
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { data: { name: name || email.split("@")[0] } },
        });
        if (error) { setErr(error.message); }
        else if (!data.session) {
          setInfo("Account created! If email confirmation is on, check your inbox to confirm, then sign in.");
          setMode("signin");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setErr(error.message);
      }
    } catch (e2) { setErr(e2.message); }
    setBusy(false);
  }

  const field = { width: "100%", border: "1px solid var(--silver)", borderRadius: 9, padding: ".75rem 1rem", marginTop: ".5rem" };

  return (
    <main className="wrap" style={{ maxWidth: 440, paddingTop: "8vh" }}>
      <h1 style={{ fontWeight: 800, fontSize: "1.8rem" }}>{title}</h1>
      {blurb && <p style={{ color: "var(--muted)", margin: ".6rem 0 1.2rem" }}>{blurb}</p>}

      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1rem" }}>
        {[["signin", "Sign in"], ["signup", "Create account"]].map(([m, label]) => (
          <button key={m} onClick={() => { setMode(m); setErr(""); setInfo(""); }}
            style={{ flex: 1, padding: ".5rem", borderRadius: 9, fontWeight: 600, cursor: "pointer",
              border: "1px solid " + (mode === m ? "var(--teal)" : "var(--silver)"),
              background: mode === m ? "var(--teal-wash)" : "#fff",
              color: mode === m ? "var(--teal-deep)" : "var(--muted)" }}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={submit}>
        {mode === "signup" && (
          <input style={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        )}
        <input style={field} type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input style={field} type="password" required minLength={6} placeholder="Password (6+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <div style={{ color: "#b13b3b", fontSize: ".88rem", marginTop: ".7rem" }}>{err}</div>}
        {info && <div style={{ color: "var(--teal-deep)", fontSize: ".88rem", marginTop: ".7rem" }}>{info}</div>}
        <button className="btn" disabled={busy} style={{ marginTop: "1rem", width: "100%" }}>
          {busy ? "Please wait…" : (mode === "signup" ? "Create account" : "Sign in")}
        </button>
      </form>
    </main>
  );
}
