// app/api/likes/route.js
// GET  /api/likes?postIds=a,b,c&userId=...  → { counts:{id:n}, liked:[ids user liked] }
// POST /api/likes  { postId, userId }       → toggle like, returns { liked, count }
import { serviceClient } from "@/lib/supabase";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = (searchParams.get("postIds") || "").split(",").filter(Boolean);
    const userId = searchParams.get("userId");
    const supabase = serviceClient();
    if (ids.length === 0) return Response.json({ counts: {}, liked: [] });

    const { data, error } = await supabase.from("post_likes").select("post_id, user_id").in("post_id", ids);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    const counts = {};
    const liked = [];
    for (const row of data || []) {
      counts[row.post_id] = (counts[row.post_id] || 0) + 1;
      if (userId && row.user_id === userId) liked.push(row.post_id);
    }
    return Response.json({ counts, liked });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { postId, userId } = await request.json();
    if (!postId || !userId) return Response.json({ error: "Sign in to like." }, { status: 401 });
    const supabase = serviceClient();
    const { data: existing } = await supabase.from("post_likes").select("post_id").eq("post_id", postId).eq("user_id", userId).maybeSingle();
    let liked;
    if (existing) {
      await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", userId);
      liked = false;
    } else {
      await supabase.from("post_likes").insert({ post_id: postId, user_id: userId });
      liked = true;
    }
    const { count } = await supabase.from("post_likes").select("*", { count: "exact", head: true }).eq("post_id", postId);
    return Response.json({ liked, count: count || 0 });
  } catch (e) {
    return Response.json({ error: e.message || String(e) }, { status: 500 });
  }
}
