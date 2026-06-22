// app/components/ImageDrop.js
"use client";
import { useRef, useState } from "react";
import { uploadImage } from "@/lib/uploadImage";

// Drag-and-drop (or click) image uploader.
// Props:
//   label    – text shown above the drop zone
//   bucket   – "avatars" or "headers"
//   value    – current image URL (shows a preview if set)
//   onChange – called with the new URL after a successful upload
//   round    – if true, preview is a circle (for avatars)
export default function ImageDrop({ label, bucket, value, onChange, round }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  async function handleFile(file) {
    setErr("");
    if (!file) return;
    setBusy(true);
    const { url, error } = await uploadImage(file, bucket);
    setBusy(false);
    if (error) { setErr(error); return; }
    onChange(url);
  }

  function onDrop(e) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file);
  }

  return (
    <div>
      {label && <div style={{ fontSize: ".82rem", color: "var(--muted)", marginBottom: ".35rem" }}>{label}</div>}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        style={{
          border: "2px dashed " + (dragging ? "var(--teal)" : "var(--silver)"),
          background: dragging ? "var(--teal-wash)" : "#fff",
          borderRadius: 12, padding: value ? ".7rem" : "1.3rem 1rem",
          textAlign: "center", cursor: "pointer", transition: "all .15s",
          display: "flex", alignItems: "center", justifyContent: "center", gap: ".8rem",
        }}
      >
        {value ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value} alt="" 
              style={{
                width: round ? 56 : 90, height: 56,
                borderRadius: round ? "50%" : 8, objectFit: "cover",
                border: "1px solid var(--line)",
              }}
            />
            <span style={{ fontSize: ".85rem", color: "var(--teal-deep)", fontWeight: 600 }}>
              {busy ? "Uploading…" : "Change image"}
            </span>
          </>
        ) : (
          <span style={{ fontSize: ".88rem", color: "var(--muted)" }}>
            {busy ? "Uploading…" : "📷 Drag an image here, or click to choose"}
          </span>
        )}
        <input
          ref={inputRef} type="file" accept="image/*" style={{ display: "none" }}
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {err && <div style={{ color: "#b13b3b", fontSize: ".8rem", marginTop: ".3rem" }}>{err}</div>}
    </div>
  );
}
