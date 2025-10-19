// src/lib/api.js
const API_BASE = import.meta.env.VITE_API_BASE; // e.g. https://abc123.execute-api.us-west-2.amazonaws.com/prod

export async function getUploadUrl(filename, contentType) {
  const r = await fetch(`${API_BASE}/upload-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename, contentType })
  });
  if (!r.ok) throw new Error("Failed to get upload URL");
  return r.json(); // { uploadUrl, fileKey, resultUrl }
}
