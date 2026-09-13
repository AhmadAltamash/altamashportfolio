import { useEffect, useState } from "react";
import { db, collection } from "../../firebase";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Pencil, Trash2, X, Loader2, UploadCloud } from "lucide-react";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary";
import Field from "../../components/admin/Field";

const AdminTechStack = () => {
  const [stacks, setStacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [language, setLanguage] = useState("");
  const [order, setOrder] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  // Tracked separately from imagePreview, which gets overwritten with a
  // temporary blob: URL as soon as a new file is picked — this is the
  // only place the real Cloudinary URL (needed to clean it up on
  // replace) survives past that point.
  const [existingIcon, setExistingIcon] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "techstack"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => {
      const orderA = a.Order ?? Infinity;
      const orderB = b.Order ?? Infinity;
      return orderA - orderB;
    });
    setStacks(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setLanguage("");
    setOrder("");
    setImageFile(null);
    setImagePreview("");
    setExistingIcon("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (stack) => {
    setEditingId(stack.id);
    setLanguage(stack.Language || "");
    setOrder(stack.Order ?? "");
    setImageFile(null);
    setImagePreview(stack.Icon || "");
    setExistingIcon(stack.Icon || "");
    setError("");
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!language.trim()) {
      setError("Give it a name (e.g. React, Docker).");
      return;
    }
    if (!editingId && !imageFile) {
      setError("Choose an icon.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let iconUrl = imagePreview || null;
      if (imageFile) {
        iconUrl = await uploadToCloudinary(imageFile, "Portfolio/techstack-icons");
        // Replacing an existing icon — clean up the orphaned old one.
        if (editingId && existingIcon) {
          const result = await deleteFromCloudinary(existingIcon);
          if (!result.ok) {
            alert(`Saved, but couldn't remove the old icon from Cloudinary: ${result.reason}. You may need to delete it manually from your Cloudinary media library.`);
          }
        }
      }

      const payload = {
        Language: language.trim(),
        Icon: iconUrl,
        Order: order === "" ? null : Number(order),
      };

      if (editingId) {
        await updateDoc(doc(db, "techstack", editingId), payload);
      } else {
        await addDoc(collection(db, "techstack"), payload);
      }

      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (stack) => {
    if (!window.confirm("Remove this from your tech stack?")) return;
    await deleteDoc(doc(db, "techstack", stack.id));
    const result = await deleteFromCloudinary(stack.Icon);
    if (!result.ok) {
      alert(`Removed, but couldn't delete its icon from Cloudinary: ${result.reason}. You may need to delete it manually from your Cloudinary media library.`);
    }
    await load();
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Tech Stack</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      ) : stacks.length === 0 ? (
        <p className="text-gray-400">No tech stack items yet — add your first one.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {stacks.map((s) => (
            <div key={s.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-col items-center text-center gap-2">
              <img src={s.Icon} alt={s.Language} className="w-12 h-12 object-contain" />
              <p className="text-sm font-medium truncate w-full">{s.Language}</p>
              <p className="text-xs text-gray-500">Order: {s.Order ?? "—"}</p>
              <div className="flex gap-2 mt-1">
                <button onClick={() => openEdit(s)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(s)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" aria-label="Delete">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">{editingId ? "Edit" : "Add"} Tech Stack Item</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Icon</label>
                {imagePreview && (
                  <img src={imagePreview} alt="" className="w-14 h-14 object-contain mb-2 bg-white/5 rounded-lg p-2" />
                )}
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-dashed border-white/20 cursor-pointer text-sm text-gray-300">
                  <UploadCloud className="w-4 h-4" /> {imagePreview ? "Replace icon" : "Choose icon"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <Field label="Name" value={language} onChange={setLanguage} placeholder="React JS" required />
              <Field
                label="Display order (lower = shows first, leave blank for last)"
                type="number"
                value={order}
                onChange={setOrder}
                placeholder="1"
              />

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTechStack;
