// app/components/MarketingOptIn.js
"use client";

// Reusable, GDPR/TCPA-friendly marketing opt-in block.
// Both boxes start UNCHECKED — the user must actively consent.
// Ticking the SMS box reveals a phone field (unless you pass showPhone={false}
// because you already collect a phone elsewhere on the form).
//
// Controlled component:
//   const [optIn, setOptIn] = useState({ emailOptIn:false, smsOptIn:false, phone:"" });
//   <MarketingOptIn value={optIn} onChange={setOptIn} />

export const EMAIL_CONSENT_TEXT =
  "Yes, email me marketing, updates, and other business communications from Helpful x Humans. I can unsubscribe anytime.";

export const SMS_CONSENT_TEXT =
  "Yes, text me (SMS) marketing and updates from Helpful x Humans at the number I provide. Msg & data rates may apply. Reply STOP to opt out, HELP for help.";

export default function MarketingOptIn({ value, onChange, showPhone = true }) {
  const v = value || { emailOptIn: false, smsOptIn: false, phone: "" };
  const set = (patch) => onChange({ ...v, ...patch });

  const rowStyle = {
    display: "flex", gap: ".55rem", alignItems: "flex-start",
    fontSize: ".88rem", color: "var(--muted)", cursor: "pointer", lineHeight: 1.4,
  };

  return (
    <div style={{ display: "grid", gap: ".55rem", margin: ".4rem 0" }}>
      <label style={rowStyle}>
        <input
          type="checkbox"
          checked={!!v.emailOptIn}
          onChange={(e) => set({ emailOptIn: e.target.checked })}
          style={{ marginTop: 3, flexShrink: 0 }}
        />
        <span>{EMAIL_CONSENT_TEXT}</span>
      </label>

      <label style={rowStyle}>
        <input
          type="checkbox"
          checked={!!v.smsOptIn}
          onChange={(e) => set({ smsOptIn: e.target.checked })}
          style={{ marginTop: 3, flexShrink: 0 }}
        />
        <span>{SMS_CONSENT_TEXT}</span>
      </label>

      {showPhone && v.smsOptIn && (
        <input
          type="tel"
          value={v.phone || ""}
          onChange={(e) => set({ phone: e.target.value })}
          placeholder="(555) 123-4567"
          required
          style={{
            padding: ".7rem 1rem", border: "1px solid var(--silver)",
            borderRadius: 12, outline: "none", maxWidth: 260,
          }}
        />
      )}
    </div>
  );
}
