import crypto from "node:crypto";

// Deletes one Cloudinary asset. Runs server-side (Vercel serverless
// function) specifically because Cloudinary's destroy endpoint requires
// a signature built from your API secret — that secret must never reach
// browser code, so this can't be done directly from the admin panel's
// client-side JS. The client only ever sends a public_id here; this
// function does the actual signed request to Cloudinary.
//
// Needs two environment variables set in your Vercel project (Settings >
// Environment Variables) — NOT prefixed with VITE_, so Vite never bundles
// them into client-side code:
//   CLOUDINARY_API_KEY
//   CLOUDINARY_API_SECRET
// (Find both on your Cloudinary dashboard's home page, under "API Keys".)
//
// Reuses your existing VITE_CLOUDINARY_CLOUD_NAME for which account to
// hit — no need to duplicate that one.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { publicId } = req.body || {};
  if (!publicId || typeof publicId !== "string") {
    return res.status(400).json({ error: "publicId is required" });
  }

  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary server-side env vars (CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET).");
    return res.status(500).json({ error: "Server is not configured for Cloudinary deletion." });
  }

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    // Cloudinary's signature: SHA-1 of the exact param string (sorted,
    // excluding file/api_key/signature itself) plus the API secret
    // appended directly, no separator.
    const signatureBase = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto.createHash("sha1").update(signatureBase).digest("hex");

    const form = new URLSearchParams({
      public_id: publicId,
      timestamp: String(timestamp),
      api_key: apiKey,
      signature,
    });

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
      { method: "POST", body: form }
    );

    const data = await response.json();

    // Cloudinary returns 200 with result: "not found" for an already-
    // gone asset — treat that as success too, not an error, since the
    // end state (asset doesn't exist) is exactly what was wanted.
    if (!response.ok || (data.result !== "ok" && data.result !== "not found")) {
      console.error("Cloudinary destroy failed:", data);
      return res.status(502).json({ error: "Cloudinary deletion failed", detail: data });
    }

    return res.status(200).json({ result: data.result });
  } catch (err) {
    console.error("Cloudinary delete error:", err);
    return res.status(500).json({ error: err.message });
  }
}
