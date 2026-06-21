// app/components/PayForm.js
"use client";
import { useEffect, useState } from "react";

// Authorize.Net Accept.js payment form.
// Card details are tokenized in the browser by Accept.js and never touch our server.
//
// Requires two public env values in .env.local (safe to expose — they're meant to be public):
//   NEXT_PUBLIC_AUTHORIZENET_ENV=sandbox        (or "live")
//   NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY=...      (the "Public Client Key" from your dashboard)
//   NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID=...    (same API Login ID as the server)
export default function PayForm({ listingId, ownerEmail, pricePerDay = 5, purpose = "live", onPaid }) {
  const [days, setDays] = useState(7);
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");      // MMYY
  const [cvv, setCvv] = useState("");
  const [zip, setZip] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");
  const [ready, setReady] = useState(false);

  const env = process.env.NEXT_PUBLIC_AUTHORIZENET_ENV || "sandbox";

  // Load Accept.js (the correct script URL depends on sandbox vs live).
  useEffect(() => {
    const src = env === "live"
      ? "https://js.authorize.net/v1/Accept.js"
      : "https://jstest.authorize.net/v1/Accept.js";
    if (document.querySelector(`script[src="${src}"]`)) { setReady(true); return; }
    const s = document.createElement("script");
    s.src = src; s.charset = "utf-8";
    s.onload = () => setReady(true);
    s.onerror = () => setMsg("Couldn't load the secure card library. Check your connection and refresh.");
    document.body.appendChild(s);
  }, [env]);

  const total = (pricePerDay * Math.max(1, Number(days) || 0)).toFixed(2);

  function pay() {
    setMsg("");
    if (!window.Accept) { setMsg("Secure card library isn't ready yet — wait a moment and try again."); return; }
    const clean = card.replace(/\s+/g, "");
    if (clean.length < 13) { setMsg("Please enter a valid card number."); return; }
    if (!/^\d{4}$/.test(exp)) { setMsg("Enter expiry as MMYY, e.g. 0827."); return; }
    if (!/^\d{3,4}$/.test(cvv)) { setMsg("Enter the 3–4 digit security code."); return; }

    setBusy(true);
    const secureData = {
      authData: {
        clientKey: process.env.NEXT_PUBLIC_AUTHORIZENET_CLIENT_KEY,
        apiLoginID: process.env.NEXT_PUBLIC_AUTHORIZENET_API_LOGIN_ID,
      },
      cardData: {
        cardNumber: clean,
        month: exp.slice(0, 2),
        year: exp.slice(2, 4),
        cardCode: cvv,
        zip,
      },
    };

    window.Accept.dispatchData(secureData, async (response) => {
      if (response.messages.resultCode === "Error") {
        setBusy(false);
        setMsg(response.messages.message.map((m) => m.text).join(" "));
        return;
      }
      // Got a one-time token — send it to our server to charge.
      try {
        const res = await fetch("/api/pay", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, ownerEmail, days: Number(days), opaqueData: response.opaqueData, purpose }),
        });
        const j = await res.json();
        setBusy(false);
        if (!res.ok || j.error) { setMsg(j.error || "Payment failed."); return; }
        setMsg(`✅ Paid $${j.amount}. Your listing is live until ${new Date(j.activeUntil).toLocaleDateString()}.`);
        if (onPaid) onPaid(j);
      } catch (e) {
        setBusy(false);
        setMsg("Payment request failed: " + e.message);
      }
    });
  }

  const fld = { width: "100%", border: "1px solid var(--silver)", borderRadius: 9, padding: ".6rem .8rem", fontSize: ".95rem" };

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 14, padding: "1.2rem" }}>
      <div style={{ fontWeight: 700, marginBottom: ".2rem" }}>{purpose === "featured" ? "Feature this listing" : "Make this listing live"}</div>
      <div style={{ color: "var(--muted)", fontSize: ".88rem", marginBottom: ".9rem" }}>
        ${pricePerDay.toFixed(2)} per day{env !== "live" ? " · TEST MODE (no real charge)" : ""}
      </div>

      <label style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--muted)" }}>Number of days</label>
      <input type="number" min={1} max={365} value={days} onChange={(e) => setDays(e.target.value)} style={{ ...fld, marginBottom: ".7rem" }} />

      <label style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--muted)" }}>Card number</label>
      <input inputMode="numeric" placeholder="4111 1111 1111 1111" value={card} onChange={(e) => setCard(e.target.value)} style={{ ...fld, marginBottom: ".7rem" }} />

      <div style={{ display: "flex", gap: ".7rem", marginBottom: ".7rem" }}>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--muted)" }}>Expiry (MMYY)</label>
          <input inputMode="numeric" placeholder="0827" maxLength={4} value={exp} onChange={(e) => setExp(e.target.value)} style={fld} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--muted)" }}>CVV</label>
          <input inputMode="numeric" placeholder="123" maxLength={4} value={cvv} onChange={(e) => setCvv(e.target.value)} style={fld} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: ".8rem", fontWeight: 600, color: "var(--muted)" }}>ZIP</label>
          <input inputMode="numeric" placeholder="90710" value={zip} onChange={(e) => setZip(e.target.value)} style={fld} />
        </div>
      </div>

      {msg && <div style={{ fontSize: ".88rem", margin: ".4rem 0 .7rem", color: msg.startsWith("✅") ? "var(--teal-deep)" : "#b13b3b" }}>{msg}</div>}

      <button onClick={pay} disabled={busy || !ready} className="btn" style={{ width: "100%" }}>
        {busy ? "Processing…" : `Pay $${total}`}
      </button>

      <p style={{ fontSize: ".75rem", color: "var(--muted)", marginTop: ".7rem", lineHeight: 1.5 }}>
        Card details are encrypted by Authorize.Net and never sent to or stored on this site.
      </p>
    </div>
  );
}
