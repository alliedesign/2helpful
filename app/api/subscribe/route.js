// app/api/subscribe/route.js
// POST /api/subscribe  → record email (+ optional SMS) consent, then notify via Netlify Forms.
import { recordConsent } from "@/lib/marketing";

export async function POST(request) {
  try {
    const { email, phone, name, emailOptIn = true, smsOptIn = false } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    if (smsOptIn && !phone) {
      return Response.json({ error: "Add a phone number to get texts." }, { status: 400 });
    }

    const clean = email.trim().toLowerCase();
    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
    const userAgent = request.headers.get("user-agent") || null;

    // 1) Save consent to Supabase (audit log + subscribers list). Handles duplicates via upsert.
    await recordConsent({
      email: clean,
      phone,
      name,
      emailOptIn: !!emailOptIn,
      smsOptIn: !!smsOptIn,
      source: "subscribe_popup",
      consentText:
        "Subscribed via helpfulxhumans.com — agreed to receive marketing emails/updates" +
        (smsOptIn ? " and SMS text messages (Msg & data rates may apply; reply STOP to opt out)." : "."),
      ip,
      userAgent,
    });

    // 2) Notify via Netlify Forms (fire-and-forget).
    try {
      const base = process.env.URL || "https://helpfulxhumans.com";
      const body = new URLSearchParams({ "form-name": "subscribers", email: clean });
      await fetch(base + "/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: body.toString(),
      });
    } catch (notifyErr) {
      console.error("\n[subscribe notify error]", notifyErr, "\n");
    }

    return Response.json({ ok: true });
  } catch (e) {
    console.error("\n[subscribe error] Unexpected:", e, "\n");
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
