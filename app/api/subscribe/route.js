// app/api/subscribe/route.js
// POST /api/subscribe  → save the email to Supabase, then notify via Netlify Forms.
import { serviceClient } from "@/lib/supabase";

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Please enter a valid email." }, { status: 400 });
    }
    const clean = email.trim().toLowerCase();

    const supabase = serviceClient();

    // 1) Save to Supabase (your owned list). Treat duplicates as success.
    const { error } = await supabase.from("subscribers").insert({ email: clean });
    if (error && !String(error.message || "").toLowerCase().includes("duplicate")) {
      console.error("\n[subscribe error]", error, "\n");
      return Response.json({ error: "Could not subscribe. Try again." }, { status: 500 });
    }

    // 2) Notify ambixallie@gmail.com via Netlify Forms (fire-and-forget).
    try {
      const base = process.env.URL || "https://helpfulxhumans.com";
      const body = new URLSearchParams({
        "form-name": "subscribers",
        email: clean,
      });
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
