// app/api/posts/route.js
// GET    → recent community posts (optional ?category=)
// POST   → create a post (requires userId)
// PUT    → edit your own post
// DELETE → remove your own post
import { serviceClient } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const supabase = serviceClient();
    let query = supabase.from("posts").select("*").order("created_at", { ascending: false }).limit(100);
    if (category && category !== "all") query = query.eq("category", category);
    const { data, error } = await query;
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ posts: data || [] });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      userId, authorName, authorKind = "client", category = "general",
      body: text = "", imageUrl = "", videoUrl = "", linkUrl = "",
    } = body;
    if (!userId) return Response.json({ error: "Please sign in to post." }, { status: 401 });
    if (!authorName || !authorName.trim()) return Response.json({ error: "Please add your name." }, { status: 400 });
    if (!text.trim() && !imageUrl.trim() && !videoUrl.trim() && !linkUrl.trim()) {
      return Response.json({ error: "Write something or add an image, video, or link." }, { status: 400 });
    }
    const supabase = serviceClient();
    const { data, error } = await supabase.from("posts").insert({
      user_id: userId, author_name: authorName, author_kind: authorKind, category,
      body: text, image_url: imageUrl, video_url: videoUrl, link_url: linkUrl,
    }).select().single();
    if (error) { console.error("\n[posts error]", error, "\n"); return Response.json({ error: error.message }, { status: 500 }); }
    return Response.json({ post: data });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const body = await request.json();
    const { postId, userId, ...fields } = body;
    if (!postId || !userId) return Response.json({ error: "postId and sign-in required." }, { status: 400 });
    const supabase = serviceClient();
    const { data: post, error: e1 } = await supabase.from("posts").select("id, user_id").eq("id", postId).single();
    if (e1 || !post) return Response.json({ error: "Post not found." }, { status: 404 });
    if (post.user_id !== userId) return Response.json({ error: "You can only edit your own post." }, { status: 403 });

    const allowed = {};
    if ("body" in fields) allowed.body = fields.body;
    if ("category" in fields) allowed.category = fields.category;
    if ("imageUrl" in fields) allowed.image_url = fields.imageUrl;
    if ("videoUrl" in fields) allowed.video_url = fields.videoUrl;
    if ("linkUrl" in fields) allowed.link_url = fields.linkUrl;
    if (Object.keys(allowed).length === 0) return Response.json({ error: "Nothing to update." }, { status: 400 });

    const { data, error } = await supabase.from("posts").update(allowed).eq("id", postId).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ post: data });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { postId, userId } = await request.json();
    if (!postId || !userId) return Response.json({ error: "postId and sign-in required." }, { status: 400 });
    const supabase = serviceClient();
    const { data: post, error: e1 } = await supabase.from("posts").select("id, user_id").eq("id", postId).single();
    if (e1 || !post) return Response.json({ error: "Post not found." }, { status: 404 });
    if (post.user_id !== userId) return Response.json({ error: "You can only delete your own post." }, { status: 403 });
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
