// lib/marketing.js
// Server-side helper. Records marketing consent in two places:
//   1) marketing_consent_log  — append-only audit trail (proof of consent for CAN-SPAM / TCPA)
//   2) subscribers            — your owned marketing list (upserted by email)
//
// Call this from server routes only (it uses the Supabase service role).
import { serviceClient } from "@/lib/supabase";

export async function recordConsent({
  email,
  phone,
  name,
  emailOptIn = false,
  smsOptIn = false,
  userId = null,
  source = "unknown",     // 'subscribe_popup' | 'signup' | 'review' | ...
  consentText = "",       // exact wording shown to the user
  ip = null,
  userAgent = null,
}) {
  const supabase = serviceClient();
  const cleanEmail = email ? String(email).trim().toLowerCase() : null;
  const cleanPhone = phone ? String(phone).trim() : null;
  const now = new Date().toISOString();

  // 1) Append-only audit log — one row per channel the user actually opted into.
  const logRows = [];
  if (emailOptIn && cleanEmail) {
    logRows.push({
      user_id: userId, email: cleanEmail, phone: cleanPhone, name: name || null,
      channel: "email", opted_in: true, source, consent_text: consentText, ip, user_agent: userAgent,
    });
  }
  if (smsOptIn && cleanPhone) {
    logRows.push({
      user_id: userId, email: cleanEmail, phone: cleanPhone, name: name || null,
      channel: "sms", opted_in: true, source, consent_text: consentText, ip, user_agent: userAgent,
    });
  }
  if (logRows.length) {
    const { error } = await supabase.from("marketing_consent_log").insert(logRows);
    if (error) console.error("[recordConsent] audit log error:", error);
  }

  // 2) Owned marketing list — only add/update if they opted into something.
  if ((emailOptIn && cleanEmail) || (smsOptIn && cleanPhone)) {
    const row = {
      email_opt_in: !!emailOptIn,
      sms_opt_in: !!smsOptIn,
      consent_source: source,
      consent_at: now,
    };
    if (cleanEmail) row.email = cleanEmail;
    if (cleanPhone) row.phone = cleanPhone;   // only set when present, so we never wipe an existing number
    if (name) row.name = name;

    if (cleanEmail) {
      // subscribers.email is UNIQUE -> upsert on it so re-subscribing updates the record.
      const { error } = await supabase.from("subscribers").upsert(row, { onConflict: "email" });
      if (error) console.error("[recordConsent] subscribers upsert error:", error);
    } else {
      const { error } = await supabase.from("subscribers").insert(row);
      if (error) console.error("[recordConsent] subscribers insert error:", error);
    }
  }

  return { ok: true, channels: logRows.map((r) => r.channel) };
}
