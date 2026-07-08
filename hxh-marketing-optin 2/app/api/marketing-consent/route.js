// app/api/marketing-consent/route.js
// POST /api/marketing-consent
// Central endpoint used by the signup and review forms to record opt-ins.
// (The subscribe popup uses /api/subscribe, which records consent too.)
import { recordConsent } from "@/lib/marketing";

export async function POST(request) {
  try {
    const b = await request.json();

    const emailOptIn = !!b.emailOptIn;
    const smsOptIn = !!b.smsOptIn;

    // Nothing to record — that's fine, not an error.
    if (!emailOptIn && !smsOptIn) return Response.json({ ok: true, skipped: true });

    if (emailOptIn && !b.email) {
      return Response.json({ error: "Email is required to opt into emails." }, { status: 400 });
    }
    if (smsOptIn && !b.phone) {
      return Response.json({ error: "A phone number is required to opt into texts." }, { status: 400 });
    }

    const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
    const userAgent = request.headers.get("user-agent") || null;

    const res = await recordConsent({
      email: b.email,
      phone: b.phone,
      name: b.name,
      userId: b.userId || null,
      emailOptIn,
      smsOptIn,
      source: b.source || "unknown",
      consentText: b.consentText || "",
      ip,
      userAgent,
    });

    return Response.json(res);
  } catch (e) {
    console.error("[marketing-consent] error:", e);
    return Response.json({ error: "Something went wrong." }, { status: 500 });
  }
}
