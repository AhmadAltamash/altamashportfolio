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
