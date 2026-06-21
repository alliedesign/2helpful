// app/api/admin/website-requests/route.js
// GET → list all website build requests (admin-only, gated by x-admin-secret).
import { serviceClient } from "@/lib/supabase";

export async function GET(request) {
  try {
    const secret = request.headers.get("x-admin-secret");
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const supabase = serviceClient();
    const { data, error } = await supabase
      .from("website_requests")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ requests: data || [] });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
