// app/api/website-request/route.js
// POST → store a "build me a website" request from a helper.
import { serviceClient } from "@/lib/supabase";

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, businessName = "", phone = "", about = "", budget = "" } = body;
    if (!name || !email) {
      return Response.json({ error: "Please include your name and email." }, { status: 400 });
    }
    const supabase = serviceClient();
    const { error } = await supabase.from("website_requests").insert({
      name, email, business_name: businessName, phone, about, budget,
    });
    if (error) {
      console.error("\n[website-request error]", error, "\n");
      return Response.json({ error: error.message }, { status: 500 });
    }
    // Requests are saved to the website_requests table and reviewed by the
    // Helpful x Humans team (ambixallie@gmail.com). To auto-email each new request,
    // connect an email service (see notes) — until then, check the table in Supabase.
    return Response.json({ ok: true, message: "Thanks! We'll reach out by email to get your site started." });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
