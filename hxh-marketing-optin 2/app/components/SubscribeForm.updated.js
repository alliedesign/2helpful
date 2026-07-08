// Drop-in replacement for the `SubscribeForm` export in
// app/components/SubscribePopup.js  (keep the SubscribePopup default export as-is;
// it can keep rendering <SubscribeForm /> inside the modal).
"use client";
import { useState } from "react";
import MarketingOptIn from "./MarketingOptIn";

export function SubscribeForm() {
  const [email, setEmail] = useState("");
  // Email is pre-checked here because clicking "Subscribe" IS the email opt-in action.
  // SMS stays unchecked (explicit consent). Flip emailOptIn to false if you want it unchecked too.
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
        <p style={{ color: "#c0392b", fontSize: ".85rem", margin: ".3rem 0 0" }}>{msg}</p>
      )}
    </form>
  );
}
