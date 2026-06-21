// lib/uploadImage.js
"use client";
import { browserClient } from "@/lib/supabase";

// Uploads a File to a Supabase Storage bucket and returns its public URL.
// bucket: "avatars" or "headers" (created during setup).
// Returns { url } on success or { error } on failure.
export async function uploadImage(file, bucket) {
  if (!file) return { error: "No file selected." };
  if (!file.type.startsWith("image/")) return { error: "Please choose an image file." };
  if (file.size > 5 * 1024 * 1024) return { error: "Image must be under 5 MB." };

  const supabase = browserClient();
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  // Unique path so uploads never collide.
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) return { error: error.message };

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { url: data.publicUrl };
}
