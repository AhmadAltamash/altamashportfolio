import { useEffect, useState } from "react";
import { db } from "../../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UploadCloud, Loader2, Save } from "lucide-react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import Field from "../../components/admin/Field";

const SETTINGS_DOC = doc(db, "site-settings", "main");

const AdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [cvUrl, setCvUrl] = useState("");
  const [yearsOfExperience, setYearsOfExperience] = useState("");
  const [tagline, setTagline] = useState("");

  useEffect(() => {
    (async () => {
      const snap = await getDoc(SETTINGS_DOC);
      if (snap.exists()) {
        const data = snap.data();
        setAvatarUrl(data.avatarUrl || "");
        setAvatarPreview(data.avatarUrl || "");
        setCvUrl(data.cvUrl || "");
        setYearsOfExperience(data.yearsOfExperience ?? "");
        setTagline(data.tagline || "");
      }
      setLoading(false);
    })();
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      let finalAvatarUrl = avatarUrl;
      if (avatarFile) {
        finalAvatarUrl = await uploadToCloudinary(avatarFile, "Portfolio/about");
      }

      await setDoc(SETTINGS_DOC, {
        avatarUrl: finalAvatarUrl,
        cvUrl: cvUrl.trim(),
        yearsOfExperience: yearsOfExperience === "" ? null : Number(yearsOfExperience),
        tagline: tagline.trim(),
      });

      setAvatarUrl(finalAvatarUrl);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />;

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Site Settings</h1>
      {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm mb-1">About-me avatar</label>
          {avatarPreview && (
            <img src={avatarPreview} alt="" className="w-24 h-24 rounded-full object-cover mb-2 border-2 border-white/10" />
          )}
          <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-dashed border-white/20 cursor-pointer text-sm text-gray-300 w-fit">
            <UploadCloud className="w-4 h-4" /> Choose image
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
          </label>
        </div>

        <Field
          label="CV / Resume link"
          value={cvUrl}
          onChange={setCvUrl}
          placeholder="https://drive.google.com/..."
        />

        <Field
          label="Years of experience (shown in the About stats)"
          type="number"
          value={yearsOfExperience}
          onChange={setYearsOfExperience}
          placeholder="2"
        />

        <div>
          <label className="block text-sm mb-1">Tagline (optional, shown under your name)</label>
          <textarea
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm resize-none h-20"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-medium disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : (<><Save className="w-4 h-4" /> Save Settings</>)}
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
