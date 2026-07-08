// app/components/SubscribePopup.js
"use client";
import { useEffect, useState } from "react";
import MarketingOptIn from "./MarketingOptIn";

// Reusable subscribe form — drop <SubscribeForm /> anywhere (e.g. footer).
export function SubscribeForm() {
  const [email, setEmail] = useState("");
  // Email is pre-checked because clicking "Subscribe" IS the email opt-in.
  // SMS stays unchecked — the user must actively tick it (and add a phone).
  const [optIn, setOptIn] = useState({ emailOptIn: true, smsOptIn: false, phone: "" });
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [msg, setMsg] = useState("");

  async function submit(e) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    try {
      const r = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          phone: optIn.phone,
          emailOptIn: optIn.emailOptIn,
          smsOptIn: optIn.smsOptIn,
        }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Try again.");
      setStatus("done");
      setMsg("You're on the list! 🎉");
      try { localStorage.setItem("hxh_subscribed", "1"); } catch {}
    } catch (err) {
      setStatus("error");
      setMsg(err.message || "Something went wrong.");
    }
  }

  if (status === "done") {
    return <p style={{ color: "var(--teal-deep)", fontWeight: 600, margin: 0 }}>{msg}</p>;
  }

  return (
    <form onSubmit={submit} style={{ display: "grid", gap: ".6rem" }}>
      <div style={{ display: "flex", gap: ".5rem", flexWrap: "wrap" }}>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          style={{
            flex: 1, minWidth: 180, padding: ".7rem 1rem",
            border: "1px solid var(--silver)", borderRadius: 999, outline: "none",
          }}
        />
        <button className="btn" disabled={status === "loading"} style={{ borderRadius: 999, whiteSpace: "nowrap" }}>
          {status === "loading" ? "Joining…" : "Subscribe"}
        </button>
      </div>
      <MarketingOptIn value={optIn} onChange={setOptIn} />
      {status === "error" && (
        <p style={{ color: "#c0392b", fontSize: ".85rem", width: "100%", margin: ".3rem 0 0" }}>{msg}</p>
      )}
    </form>
  );
}

// Arrival pop-up. Suppressed if already subscribed, dismissed this session, or signed in.
export default function SubscribePopup({ isSignedIn = false }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let subscribed = false, dismissed = false;
    try {
      subscribed = localStorage.getItem("hxh_subscribed") === "1";
      dismissed = sessionStorage.getItem("hxh_popup_dismissed") === "1";
    } catch {}
    if (isSignedIn || subscribed || dismissed) return;
    const t = setTimeout(() => setOpen(true), 1500);
    return () => clearTimeout(t);
  }, [isSignedIn]);

  function close() {
    setOpen(false);
    try { sessionStorage.setItem("hxh_popup_dismissed", "1"); } catch {}
  }

  if (!open) return null;

  return (
    <div
      onClick={close}
      style={{
        position: "fixed", inset: 0, background: "rgba(16,20,23,.45)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1000, padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff", borderRadius: 20, maxWidth: 440, width: "100%",
          padding: "2rem", boxShadow: "0 24px 60px rgba(16,20,23,.28)", position: "relative",
        }}
      >
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: "absolute", top: 14, right: 16, border: "none", background: "none",
            fontSize: "1.4rem", cursor: "pointer", color: "var(--muted)", lineHeight: 1,
          }}
        >
          ×
        </button>
        <h3 style={{ fontSize: "1.4rem", fontWeight: 800, letterSpacing: "-.02em", marginBottom: ".5rem" }}>
          Stay in the loop ✨
        </h3>
        <p style={{ color: "var(--muted)", fontSize: ".98rem", marginBottom: "1.2rem" }}>
          Get updates on new independent helpers near you. No spam — just the good stuff.
        </p>
        <SubscribeForm />
      </div>
    </div>
  );
}
