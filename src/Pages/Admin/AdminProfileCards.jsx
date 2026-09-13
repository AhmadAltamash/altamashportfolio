import { useEffect, useState } from "react";
import { db, collection } from "../../firebase";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Pencil, Trash2, X, Loader2, UploadCloud } from "lucide-react";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary";
import Field from "../../components/admin/Field";

const AdminProfileCards = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [order, setOrder] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  // Tracked separately from imagePreview, which gets overwritten with a
  // temporary blob: URL as soon as a new file is picked — this is the
  // only place the real Cloudinary URL (needed to clean it up on
  // replace) survives past that point.
  const [existingImg, setExistingImg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "profileCards"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => {
      const orderA = a.Order ?? Infinity;
      const orderB = b.Order ?? Infinity;
      return orderA - orderB;
    });
    setCards(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setOrder("");
    setImageFile(null);
    setImagePreview("");
    setExistingImg("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (card) => {
    setEditingId(card.id);
    setOrder(card.Order ?? "");
    setImageFile(null);
    setImagePreview(card.Img || "");
    setExistingImg(card.Img || "");
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
    if (!editingId && !imageFile) {
      setError("Choose a photo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      let imgUrl = imagePreview || null;
      if (imageFile) {
        imgUrl = await uploadToCloudinary(imageFile, "Portfolio/profile-cards");
        // Replacing an existing photo — clean up the orphaned old one.
        if (editingId && existingImg) {
          const result = await deleteFromCloudinary(existingImg);
          if (!result.ok) {
            alert(`Saved, but couldn't remove the old photo from Cloudinary: ${result.reason}. You may need to delete it manually from your Cloudinary media library.`);
          }
        }
      }

      const payload = {
        Img: imgUrl,
        Order: order === "" ? null : Number(order),
      };

      if (editingId) {
        await updateDoc(doc(db, "profileCards", editingId), payload);
      } else {
        await addDoc(collection(db, "profileCards"), payload);
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

  const handleDelete = async (card) => {
    if (!window.confirm("Remove this photo from the homepage card?")) return;
    await deleteDoc(doc(db, "profileCards", card.id));
    const result = await deleteFromCloudinary(card.Img);
    if (!result.ok) {
      alert(`Removed, but couldn't delete the photo from Cloudinary: ${result.reason}. You may need to delete it manually from your Cloudinary media library.`);
    }
    await load();
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-2xl font-bold">Homepage Card Photos</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-medium text-sm"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      <p className="text-sm text-gray-400 mb-6">
        These photos appear on the rotating 3D card on your homepage. Lower order shows first.
      </p>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      ) : cards.length === 0 ? (
        <p className="text-gray-400">No photos yet — add your first one.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {cards.map((c) => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <img src={c.Img} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />
              <p className="text-xs text-gray-500">Order: {c.Order ?? "—"}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Edit">
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => handleDelete(c)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" aria-label="Delete">
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
              <h2 className="text-lg font-semibold">{editingId ? "Edit" : "Add"} Card Photo</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Photo</label>
                {imagePreview && (
                  <img src={imagePreview} alt="" className="w-full h-40 object-cover rounded-lg mb-2" />
                )}
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-dashed border-white/20 cursor-pointer text-sm text-gray-300">
                  <UploadCloud className="w-4 h-4" /> {imagePreview ? "Replace photo" : "Choose photo"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

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

export default AdminProfileCards;
