// app/api/admin/add-listing/route.js
// POST /api/admin/add-listing
// Admin-only. Creates a listing that goes LIVE immediately with NO payment.
// The admin controls how long it stays live (days, or "permanent") and
// whether it's featured. Reuses geocoding so location search works.
//
// SECURITY: gated by the shared admin secret in the x-admin-secret header,
// same as the rest of /api/admin/*.
import { serviceClient } from "@/lib/supabase";
import { geocode } from "@/lib/geocode";

function isAdmin(request) {
  return request.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

// Far-future date used for "permanent" listings (never expires in practice).
const FOREVER = "2099-01-01T00:00:00.000Z";

export async function POST(request) {
  if (!isAdmin(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      businessName,
      websiteUrl = "",
      description = "",
      headquarters = "",
      ownerName = "",          // the person behind the business (optional)
      ownerEmail = "",         // optional contact email for the helper record
      avatarUrl = "",
      headerUrl = "",
      categories = [],         // array of category strings
      mode = "both",           // both | virtual | in_person
      serviceAreaMiles = 25,
      nationwide = false,
      phone = "", hours = "", address = "",
      instagram = "", facebook = "", tiktok = "", twitter = "", youtube = "", linkedin = "",
      // Admin duration controls:
      durationDays = 30,       // how many days live; ignored if permanent = true
      permanent = false,       // if true, active_until = FOREVER
      featured = false,        // show in featured section
      featuredDays = 0,        // how many days featured (if featured = true)
    } = body;

    if (!businessName) {
      return Response.json({ error: "Business name is required." }, { status: 400 });
    }

    const supabase = serviceClient();

    // 1) Create (or reuse) a helper record to own this listing.
    //    Admin-added listings aren't tied to a login, so user_id stays null.
    //    We try to reuse an existing helper by email if one was given.
    let helperId = null;
    const cleanEmail = (ownerEmail || "").trim().toLowerCase();

    if (cleanEmail) {
      const { data: existing } = await supabase
        .from("helpers")
        .select("id")
        .eq("email", cleanEmail)
        .maybeSingle();
      if (existing) helperId = existing.id;
    }

    if (!helperId) {
      const { data: helper, error: helperErr } = await supabase
        .from("helpers")
        .insert({
          name: ownerName || businessName,
          email: cleanEmail || null,
          location_text: headquarters || null,
          // user_id intentionally null — this is an admin-added helper.
        })
        .select("id")
        .single();
      if (helperErr) {
        console.error("\n[admin add-listing helper error]", helperErr, "\n");
        return Response.json({ error: helperErr.message }, { status: 500 });
      }
      helperId = helper.id;
    }

    // 2) Geocode the headquarters so distance-based search works.
    let lat = null, lng = null;
    if (headquarters) {
      try {
        const g = await geocode(headquarters);
        lat = g.lat; lng = g.lng;
      } catch {
        // Geocoding can fail (network/sandbox); listing still goes live,
        // it just won't have precise distance filtering until coords exist.
      }
    }

    // 3) Build the active window. This is the key difference from the public
    //    flow: the admin sets it directly, so the listing is LIVE with no payment.
    const now = new Date();
    const activeFrom = now.toISOString();
    const activeUntil = permanent
      ? FOREVER
      : new Date(now.getTime() + Number(durationDays || 30) * 86400000).toISOString();

    // Featured window (optional).
    let featuredFrom = null, featuredUntil = null;
    if (featured) {
      featuredFrom = now.toISOString();
      featuredUntil = permanent
        ? FOREVER
        : new Date(now.getTime() + Number(featuredDays || durationDays || 30) * 86400000).toISOString();
    }

    // 4) Insert the listing — approved + live immediately.
    const { data, error } = await supabase
      .from("listings")
      .insert({
        helper_id: helperId,
        business_name: businessName,
        website_url: websiteUrl,
        description,
        headquarters,
        avatar_url: avatarUrl,
        header_url: headerUrl,
        categories,
        mode,
        service_area_miles: Number(serviceAreaMiles) || 25,
        nationwide: !!nationwide,
        active_from: activeFrom,
        active_until: activeUntil,
        featured_from: featuredFrom,
        featured_until: featuredUntil,
        phone, hours, address,
        instagram, facebook, tiktok, twitter, youtube, linkedin,
        lat, lng,
        attested_independent: true,
        corp_flags: [],
        corp_score: 0,
        is_approved: true,
        review_status: "approved",
      })
      .select()
      .single();

    if (error) {
      console.error("\n[admin add-listing insert error]", error, "\n");
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      ok: true,
      listing: data,
      message: permanent
        ? "Listing added and live permanently."
        : `Listing added and live for ${durationDays} day(s).`,
    });
  } catch (e) {
    console.error("\n[admin add-listing] Unexpected:", e, "\n");
    return Response.json({ error: "Something went wrong adding the listing." }, { status: 500 });
  }
}
