export async function uploadToCloudinary(file, folder) {
  if (!file) return null;

  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  if (!uploadPreset || !cloudName) {
    throw new Error("Cloudinary environment variables are missing.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.secure_url;
}

// Pulls the public_id (including folder) back out of a Cloudinary
// secure_url, e.g.
//   https://res.cloudinary.com/demo/image/upload/v1699999999/Portfolio/techstack-icons/abc123.png
//   -> "Portfolio/techstack-icons/abc123"
// Returns null for anything that isn't a Cloudinary URL (nothing to
// delete there — e.g. a placeholder image, or already null/empty).
function extractPublicId(url) {
  if (!url || typeof url !== "string") return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+(?:\?.*)?$/);
  return match ? match[1] : null;
}

// Deletes a previously-uploaded image from Cloudinary given its stored
// URL. Safe to call with a non-Cloudinary or empty URL — it just no-ops.
// Never throws: a failed cleanup shouldn't block the admin action that
// triggered it (a Firestore delete/update should still go through even
// if this fails). Returns { ok: true } on success, or { ok: false,
// reason } on failure so the caller can surface it — this used to only
// console.error, which meant a failure was invisible unless you
// happened to have devtools open.
export async function deleteFromCloudinary(url) {
  const publicId = extractPublicId(url);
  if (!publicId) return { ok: true }; // nothing to delete, not a failure

  try {
    const response = await fetch("/api/delete-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicId }),
    });
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      console.error("Cloudinary delete failed:", data);
      return { ok: false, reason: data.error || `HTTP ${response.status}` };
    }
    return { ok: true };
  } catch (err) {
    console.error("Cloudinary delete request failed:", err);
    return { ok: false, reason: err.message };
  }
}
