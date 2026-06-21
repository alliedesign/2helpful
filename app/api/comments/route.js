// app/api/comments/route.js
// GET  /api/comments?postId=...        → comments for a post
// POST /api/comments  { postId, userId, authorName, body }
// DELETE /api/comments { commentId, userId }
import { serviceClient } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postId = searchParams.get("postId");
    if (!postId) return Response.json({ error: "postId required" }, { status: 400 });
    const supabase = serviceClient();
    const { data, error } = await supabase.from("post_comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ comments: data || [] });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { postId, userId, authorName, body } = await request.json();
    if (!postId || !userId) return Response.json({ error: "Sign in to comment." }, { status: 401 });
    if (!body || !body.trim()) return Response.json({ error: "Write a comment." }, { status: 400 });
    const supabase = serviceClient();
    const { data, error } = await supabase.from("post_comments")
      .insert({ post_id: postId, user_id: userId, author_name: authorName || "Someone", body }).select().single();
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ comment: data });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { commentId, userId } = await request.json();
    if (!commentId || !userId) return Response.json({ error: "Sign in required." }, { status: 400 });
    const supabase = serviceClient();
    const { data: c } = await supabase.from("post_comments").select("id, user_id").eq("id", commentId).single();
    if (!c) return Response.json({ error: "Comment not found." }, { status: 404 });
    if (c.user_id !== userId) return Response.json({ error: "You can only delete your own comment." }, { status: 403 });
    await supabase.from("post_comments").delete().eq("id", commentId);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
