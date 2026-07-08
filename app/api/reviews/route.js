// app/api/reviews/route.js
// GET    /api/reviews?listingId=...     → reviews + summary
// POST   /api/reviews                   → create or update your review (upsert)
// DELETE /api/reviews                   → delete your review
import { serviceClient } from "@/lib/supabase";
import { recordConsent } from "@/lib/marketing";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const listingId = searchParams.get("listingId");
    if (!listingId) return Response.json({ error: "listingId required" }, { status: 400 });
    const supabase = serviceClient();
    const { data, error } = await supabase.from("listing_reviews")
      .select("*").eq("listing_id", listingId).order("updated_at", { ascending: false });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const reviews = data || [];
    const total = reviews.length;
    const avg = total ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / total) * 10) / 10 : null;
    return Response.json({ reviews, avg, total });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { listingId, userId, authorName, rating, body, email, phone, emailOptIn, smsOptIn } = await request.json();
    if (!listingId || !userId) return Response.json({ error: "Please sign in to leave a review." }, { status: 401 });
    const r = Number(rating);
    if (!(r >= 1 && r <= 5)) return Response.json({ error: "Pick a star rating from 1 to 5." }, { status: 400 });
    const supabase = serviceClient();
    const optedIn = !!emailOptIn || !!smsOptIn;
    // Upsert: one review per user per listing; re-posting edits it.
    const row = {
      listing_id: listingId, user_id: userId, author_name: authorName || "Someone",
      rating: r, body: body || "", updated_at: new Date().toISOString(),
    };
    // Only touch the marketing columns when the user actually opted in this time,
    // so editing a review later never silently erases an earlier consent.
    if (optedIn) {
      row.email = email || null;
      row.phone = phone || null;
      row.email_opt_in = !!emailOptIn;
      row.sms_opt_in = !!smsOptIn;
      row.marketing_consent_at = new Date().toISOString();
    }
    const { data, error } = await supabase.from("listing_reviews")
      .upsert(row, { onConflict: "listing_id,user_id" })
      .select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });

    // Record marketing consent to the audit log + subscribers list.
    if (optedIn) {
      const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || null;
      const userAgent = request.headers.get("user-agent") || null;
      await recordConsent({
        email, phone, name: authorName, userId,
        emailOptIn: !!emailOptIn, smsOptIn: !!smsOptIn,
        source: "review",
        consentText: "Opted in while leaving a review on helpfulxhumans.com.",
        ip, userAgent,
      });
    }
    return Response.json({ review: data });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { listingId, userId } = await request.json();
    if (!listingId || !userId) return Response.json({ error: "Sign in required." }, { status: 400 });
    const supabase = serviceClient();
    await supabase.from("listing_reviews").delete().eq("listing_id", listingId).eq("user_id", userId);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
