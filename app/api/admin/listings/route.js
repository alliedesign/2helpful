// app/api/admin/listings/route.js
// Admin listing management — gated by the shared admin secret.
//   GET    → all listings (newest first) with the fields the panel needs
//   PATCH  → update one listing's controls (live window, featured, fields)
//   DELETE → remove a listing entirely
//
// Unlike /api/listings (which checks owner email), this works on ANY listing
// because the admin owns the whole site.
import { serviceClient } from "@/lib/supabase";

function isAdmin(request) {
  return request.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

const FOREVER = "2099-01-01T00:00:00.000Z";

export async function GET(request) {
  if (!isAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("listings")
    .select("id, business_name, website_url, description, mode, headquarters, nationwide, avatar_url, header_url, categories, is_approved, review_status, active_from, active_until, featured_from, featured_until, created_at, helpers(name, email)")
    .order("created_at", { ascending: false });
  if (error) return Response.json({ error: error.message }, { status: 500 });

  const now = Date.now();
  const listings = (data || []).map((l) => {
    const liveUntil = l.active_until ? new Date(l.active_until).getTime() : null;
    const featUntil = l.featured_until ? new Date(l.featured_until).getTime() : null;
    return {
      ...l,
      is_live: !!(l.active_from && new Date(l.active_from).getTime() <= now && liveUntil && liveUntil >= now),
      is_featured: !!(featUntil && featUntil >= now),
      helper_name: l.helpers?.name || "",
      helper_email: l.helpers?.email || "",
    };
  });
  return Response.json({ listings });
}

export async function PATCH(request) {
  if (!isAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { listingId, action, ...fields } = body;
    if (!listingId) return Response.json({ error: "listingId required." }, { status: 400 });

    const supabase = serviceClient();
    const now = new Date();
    const update = {};

    // Quick actions ---------------------------------------------------------
    if (action === "makeLive") {
      const days = Number(fields.days) || 30;
      update.active_from = now.toISOString();
      update.active_until = fields.permanent
        ? FOREVER
        : new Date(now.getTime() + days * 86400000).toISOString();
      update.is_approved = true;
      update.review_status = "approved";
    } else if (action === "endLive") {
      update.active_from = null;
      update.active_until = null;
    } else if (action === "feature") {
      const days = Number(fields.days) || 30;
      const until = fields.permanent ? FOREVER : new Date(now.getTime() + days * 86400000).toISOString();
      update.featured_from = now.toISOString();
      update.featured_until = until;
      // Featuring ALWAYS makes it live too, so it appears in search automatically.
      update.active_from = now.toISOString();
      update.active_until = until;
      update.is_approved = true;
      update.review_status = "approved";
    } else if (action === "unfeature") {
      update.featured_from = null;
      update.featured_until = null;
    }

    // Editable fields -------------------------------------------------------
    if ("businessName" in fields) update.business_name = fields.businessName;
    if ("websiteUrl" in fields) update.website_url = fields.websiteUrl;
    if ("description" in fields) update.description = fields.description;
    if ("mode" in fields) update.mode = fields.mode;
    if ("headquarters" in fields) update.headquarters = fields.headquarters;
    if ("nationwide" in fields) update.nationwide = !!fields.nationwide;
    if ("avatarUrl" in fields) update.avatar_url = fields.avatarUrl;
    if ("headerUrl" in fields) update.header_url = fields.headerUrl;
    if ("categories" in fields) {
      update.categories = Array.isArray(fields.categories)
        ? fields.categories
        : String(fields.categories).split(",").map((c) => c.trim()).filter(Boolean);
    }

    if (Object.keys(update).length === 0) {
      return Response.json({ error: "Nothing to update." }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("listings").update(update).eq("id", listingId).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true, listing: data });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!isAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { listingId } = await request.json();
    if (!listingId) return Response.json({ error: "listingId required." }, { status: 400 });
    const supabase = serviceClient();
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
