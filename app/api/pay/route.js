// app/api/pay/route.js
// POST /api/pay
// Charges $5/day via Authorize.Net, then extends the listing's active window by N days.
//
// SAFETY MODEL:
// - The browser uses Accept.js to turn the card into a one-time "opaqueData" token.
//   Raw card numbers NEVER reach this server, which keeps you out of most PCI scope.
// - This route charges that token, and ONLY if the charge succeeds does it make the
//   listing live. No money taken without listing time, no listing time without money.
//
// ENV (.env.local) — sandbox values while testing, live values when AUTHORIZENET_ENV=live:
//   AUTHORIZENET_ENV=sandbox            (change to "live" to go live)
//   AUTHORIZENET_API_LOGIN_ID=...
//   AUTHORIZENET_TRANSACTION_KEY=...
import { serviceClient } from "@/lib/supabase";

const PRICE_PER_DAY = 5.0;
const FEATURED_PRICE_PER_DAY = 20.0;

export async function POST(request) {
  try {
    const env = (process.env.AUTHORIZENET_ENV || "sandbox").toLowerCase();
    const loginId = process.env.AUTHORIZENET_API_LOGIN_ID;
    const txnKey = process.env.AUTHORIZENET_TRANSACTION_KEY;
    if (!loginId || !txnKey) {
      return Response.json({ error: "Authorize.Net keys aren't set in .env.local yet." }, { status: 500 });
    }

    const { listingId, ownerEmail, days, opaqueData, purpose = "live" } = await request.json();
    const nDays = Math.max(1, Math.min(365, Number(days) || 0));
    const isFeatured = purpose === "featured";
    const perDay = isFeatured ? FEATURED_PRICE_PER_DAY : PRICE_PER_DAY;
    if (!listingId || !ownerEmail) return Response.json({ error: "Missing listing or sign-in." }, { status: 400 });
    if (!opaqueData?.dataDescriptor || !opaqueData?.dataValue) {
      return Response.json({ error: "Card details didn't come through. Please re-enter them." }, { status: 400 });
    }

    const supabase = serviceClient();

    // Verify the person owns this listing before charging anything.
    const { data: listing, error: e1 } = await supabase
      .from("listings").select("id, helper_id, business_name, active_until, featured_until, helpers(email)").eq("id", listingId).single();
    if (e1 || !listing) return Response.json({ error: "Listing not found." }, { status: 404 });
    if ((listing.helpers?.email || "").toLowerCase() !== ownerEmail.toLowerCase()) {
      return Response.json({ error: "You can only pay for your own listing." }, { status: 403 });
    }

    const amount = (perDay * nDays).toFixed(2);
    const endpoint = env === "live"
      ? "https://api.authorize.net/xml/v1/request.api"
      : "https://apitest.authorize.net/xml/v1/request.api";

    // Charge the tokenized card.
    const payload = {
      createTransactionRequest: {
        merchantAuthentication: { name: loginId, transactionKey: txnKey },
        transactionRequest: {
          transactionType: "authCaptureTransaction",
          amount,
          payment: { opaqueData: { dataDescriptor: opaqueData.dataDescriptor, dataValue: opaqueData.dataValue } },
          order: { description: `${isFeatured ? "Featured " : ""}${nDays} day(s): ${listing.business_name}`.slice(0, 255) },
        },
      },
    };

    const resp = await fetch(endpoint, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
    });
    const raw = (await resp.text()).replace(/^\uFEFF/, "");
    let result;
    try { result = JSON.parse(raw); } catch { return Response.json({ error: "Payment processor returned an unreadable response." }, { status: 502 }); }

    const txn = result?.transactionResponse;
    const ok = result?.messages?.resultCode === "Ok" && txn?.responseCode === "1";
    if (!ok) {
      const msg = txn?.errors?.[0]?.errorText
        || result?.messages?.message?.[0]?.text
        || "The card was declined or the payment failed.";
      return Response.json({ error: msg }, { status: 402 });
    }

    // Payment succeeded — extend the relevant window by nDays.
    const now = new Date();
    const update = {};
    if (isFeatured) {
      const base = listing.featured_until && new Date(listing.featured_until) > now ? new Date(listing.featured_until) : now;
      update.featured_from = listing.featured_until && new Date(listing.featured_until) > now ? undefined : now.toISOString();
      update.featured_until = new Date(base.getTime() + nDays * 24 * 60 * 60 * 1000).toISOString();
    } else {
      const base = listing.active_until && new Date(listing.active_until) > now ? new Date(listing.active_until) : now;
      update.active_from = listing.active_until && new Date(listing.active_until) > now ? undefined : now.toISOString();
      update.active_until = new Date(base.getTime() + nDays * 24 * 60 * 60 * 1000).toISOString();
      update.is_approved = true;
    }

    const { error: e2 } = await supabase.from("listings").update(update).eq("id", listingId);
    if (e2) {
      return Response.json({ error: "Payment went through but updating the listing failed. Contact support with transaction ID " + (txn.transId || "?") + "." }, { status: 500 });
    }

    return Response.json({
      ok: true,
      transactionId: txn.transId,
      amount,
      days: nDays,
      purpose,
      activeUntil: update.active_until || listing.active_until,
      featuredUntil: update.featured_until || listing.featured_until,
      mode: env,
    });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
