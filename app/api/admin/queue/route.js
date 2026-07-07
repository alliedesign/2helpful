// app/api/admin/queue/route.js
// GET   /api/admin/queue            → pending listings, worst-looking first
// POST  /api/admin/queue            → { listingId, decision: 'approve'|'reject' }
//
// SECURITY: gate this behind an admin check. The simple version below uses a
// shared admin secret in the header. For production, switch to a real admin
// role on the user (e.g. a `is_admin` column on helpers, checked from the
// user's session) — noted inline.
import { serviceClient } from "@/lib/supabase";

function isAdmin(request) {
  return request.headers.get("x-admin-secret") === process.env.ADMIN_SECRET;
}

export async function GET(request) {
  if (!isAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = serviceClient();
  const { data, error } = await supabase
    .from("listings")
    .select("*, helpers(name, email, location_text)")
    .eq("review_status", "pending")
    .order("corp_score", { ascending: false })  // most suspicious first
    .order("created_at", { ascending: true });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ queue: data ?? [] });
}

export async function POST(request) {
  if (!isAdmin(request)) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const { listingId, decision } = await request.json();
  if (!["approve", "reject"].includes(decision)) {
    return Response.json({ error: "decision must be approve or reject" }, { status: 400 });
  }
  const supabase = serviceClient();
  const { error } = await supabase
    .from("listings")
    .update({
      review_status: decision === "approve" ? "approved" : "rejected",
      is_approved: decision === "approve",
    })
    .eq("id", listingId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
