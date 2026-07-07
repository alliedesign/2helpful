// app/api/listings/route.js
// POST /api/listings   → create a listing (runs corp auto-flagging)
// PATCH /api/listings  → record a click-through  { listingId, q }
import { serviceClient } from "@/lib/supabase";
import { corpCheck } from "@/lib/corpCheck";
import { geocode } from "@/lib/geocode";

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      helperId, businessName, websiteUrl, description, headquarters = "", imageUrl = "",
      avatarUrl = "", headerUrl = "",
      categories = [], mode = "both", serviceAreaMiles = 25,
      nationwide = false, paidDays = 0,
      phone = "", hours = "", address = "",
      instagram = "", facebook = "", tiktok = "", twitter = "", youtube = "", linkedin = "",
      attestedIndependent = false,
    } = body;

    if (!helperId || !businessName || !websiteUrl || !description) {
      return Response.json({ error: "Please fill in business name, website, and description." }, { status: 400 });
    }
    if (!avatarUrl) {
      return Response.json({ error: "A profile picture is required to create a listing." }, { status: 400 });
    }
    if (!headerUrl) {
      return Response.json({ error: "A banner photo is required to create a listing." }, { status: 400 });
    }

    // 1) Auto-flag: how likely is this a big corporation?
    const { score, flags, autoApprovable } = await corpCheck({
      websiteUrl, businessName, description, attestedIndependent,
    });

    // 1b) Geocode the headquarters into coordinates so distance
    //     filtering in search actually works.
    const { lat: hqLat, lng: hqLng } = await geocode(headquarters);

    // 2) Decide initial state.
    //    - Clean + attested  → approved immediately (still logged).
    //    - Anything else      → goes to the human review queue.
    const isApproved = autoApprovable;
    const reviewStatus = autoApprovable ? "approved" : "pending";

    // PAYMENT REQUIRED MODEL: new listings are NOT live until paid.
    // We ignore any paidDays from the form — a listing only becomes active
    // through the /api/pay flow, which sets active_from/active_until on success.
    // So every new listing starts with no active window (invisible in search).
    const now = new Date();
    const activeFrom = null;
    const activeUntil = null;

    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("listings")
      .insert({
        helper_id: helperId,
        business_name: businessName,
        website_url: websiteUrl,
        description,
        headquarters,
        image_url: imageUrl,
        avatar_url: avatarUrl,
        header_url: headerUrl,
        categories,
        mode,
        service_area_miles: serviceAreaMiles,
        nationwide: !!nationwide,
        paid_days: 0,
        active_from: activeFrom,
        active_until: activeUntil,
        phone, hours, address,
        instagram, facebook, tiktok, twitter, youtube, linkedin,
        lat: hqLat, lng: hqLng,
        attested_independent: attestedIndependent,
        corp_flags: flags,
        corp_score: score,
        is_approved: isApproved,
        review_status: reviewStatus,
      })
      .select()
      .single();

    if (error) {
      console.error("\n[listing insert error]", error, "\n");
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json({
      listing: data,
      autoApproved: autoApprovable,
      corpScore: score,
      flags,
      message: autoApprovable
        ? "Listing approved and live in search."
        : "Listing submitted — it's in the review queue and will go live once approved.",
    });
  } catch (e) {
    console.error("\n[listing error] Unexpected:", e, "\n");
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function PATCH(request) {
  const { listingId, q = "" } = await request.json();
  if (!listingId) return Response.json({ error: "listingId required" }, { status: 400 });
  const supabase = serviceClient();
  const { error } = await supabase.rpc("record_click", { listing: listingId, q });
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

// PUT /api/listings → edit your own listing (images, nationwide, etc.)
// Requires ownerEmail to match the listing's helper email.
export async function PUT(request) {
  try {
    const body = await request.json();
    const { listingId, ownerEmail, ...fields } = body;
    if (!listingId || !ownerEmail) {
      return Response.json({ error: "listingId and ownerEmail required." }, { status: 400 });
    }
    const supabase = serviceClient();

    // Verify ownership: the listing's helper must have this email.
    const { data: listing, error: e1 } = await supabase
      .from("listings").select("id, helper_id, helpers(email)").eq("id", listingId).single();
    if (e1 || !listing) return Response.json({ error: "Listing not found." }, { status: 404 });
    if ((listing.helpers?.email || "").toLowerCase() !== ownerEmail.toLowerCase()) {
      return Response.json({ error: "You can only edit your own listing." }, { status: 403 });
    }

    // Allow editing the full set of listing fields.
    const allowed = {};
    if ("avatarUrl" in fields) allowed.avatar_url = fields.avatarUrl;
    if ("headerUrl" in fields) allowed.header_url = fields.headerUrl;
    if ("imageUrl" in fields) allowed.image_url = fields.imageUrl;
    if ("nationwide" in fields) allowed.nationwide = !!fields.nationwide;
    if ("businessName" in fields) allowed.business_name = fields.businessName;
    if ("websiteUrl" in fields) allowed.website_url = fields.websiteUrl;
    if ("description" in fields) allowed.description = fields.description;
    if ("mode" in fields) allowed.mode = fields.mode;
    if ("headquarters" in fields) allowed.headquarters = fields.headquarters;
    if ("serviceAreaMiles" in fields) allowed.service_area_miles = Number(fields.serviceAreaMiles);
    if ("categories" in fields) {
      allowed.categories = Array.isArray(fields.categories)
        ? fields.categories
        : String(fields.categories).split(",").map((c) => c.trim()).filter(Boolean);
    }
    for (const k of ["phone","hours","address","instagram","facebook","tiktok","twitter","youtube","linkedin"]) {
      if (k in fields) allowed[k] = fields[k];
    }
    if (Object.keys(allowed).length === 0) {
      return Response.json({ error: "Nothing to update." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("listings").update(allowed).eq("id", listingId).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ listing: data, message: "Saved." });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

// DELETE /api/listings → remove your own listing.
export async function DELETE(request) {
  try {
    const { listingId, ownerEmail } = await request.json();
    if (!listingId || !ownerEmail) {
      return Response.json({ error: "listingId and ownerEmail required." }, { status: 400 });
    }
    const supabase = serviceClient();
    const { data: listing, error: e1 } = await supabase
      .from("listings").select("id, helpers(email)").eq("id", listingId).single();
    if (e1 || !listing) return Response.json({ error: "Listing not found." }, { status: 404 });
    if ((listing.helpers?.email || "").toLowerCase() !== ownerEmail.toLowerCase()) {
      return Response.json({ error: "You can only delete your own listing." }, { status: 403 });
    }
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, message: "Listing deleted." });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
