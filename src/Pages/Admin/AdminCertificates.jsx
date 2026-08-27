import { useEffect, useState } from "react";
import { db, collection } from "../../firebase";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Pencil, Trash2, X, Loader2, UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import Field from "../../components/admin/Field";

const AdminCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [issuer, setIssuer] = useState("");
  const [order, setOrder] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [existingImg, setExistingImg] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "certificates"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => {
      const orderA = a.Order ?? Infinity;
      const orderB = b.Order ?? Infinity;
      return orderA - orderB;
    });
    setCertificates(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setTitle("");
    setIssuer("");
    setOrder("");
    setImageFile(null);
    setImagePreview("");
    setExistingImg("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (cert) => {
    setEditingId(cert.id);
    setTitle(cert.Title || "");
    setIssuer(cert.Issuer || "");
    setOrder(cert.Order ?? "");
    setImageFile(null);
    setImagePreview(cert.Img || "");
    setExistingImg(cert.Img || "");
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
    setSaving(true);
    setError("");
    try {
      let imgUrl = existingImg;
      if (imageFile) {
        imgUrl = await uploadToCloudinary(imageFile, "Portfolio/certificates");
      }
      if (!imgUrl) throw new Error("Please choose a certificate image.");

      const payload = {
        Img: imgUrl,
        Title: title.trim(),
        Issuer: issuer.trim(),
        Order: order === "" ? null : Number(order),
      };

      if (editingId) {
        await updateDoc(doc(db, "certificates", editingId), payload);
      } else {
        await addDoc(collection(db, "certificates"), payload);
      }

      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save certificate.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this certificate?")) return;
    await deleteDoc(doc(db, "certificates", id));
    await load();
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Certificates</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Certificate
        </button>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      ) : certificates.length === 0 ? (
        <p className="text-gray-400">No certificates yet — add your first one.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {certificates.map((c) => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-3">
              <img src={c.Img} alt={c.Title || "Certificate"} className="w-full h-28 object-cover rounded-lg mb-2" />
              {c.Title && <p className="text-sm font-medium truncate">{c.Title}</p>}
              <p className="text-xs text-gray-500">Order: {c.Order ?? "—"}</p>
              <div className="flex gap-2 mt-2">
                <button onClick={() => openEdit(c)} className="flex-1 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs flex items-center justify-center gap-1">
                  <Pencil className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="flex-1 p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
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
              <h2 className="text-lg font-semibold">{editingId ? "Edit" : "Add"} Certificate</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Image</label>
                {imagePreview && <img src={imagePreview} alt="" className="w-full h-32 object-cover rounded-lg mb-2" />}
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-dashed border-white/20 cursor-pointer text-sm text-gray-300">
                  <UploadCloud className="w-4 h-4" /> Choose image
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>
              <Field label="Title (optional)" value={title} onChange={setTitle} placeholder="AWS Certified Developer" />
              <Field label="Issuer (optional)" value={issuer} onChange={setIssuer} placeholder="Amazon Web Services" />
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
                {saving ? "Saving..." : "Save Certificate"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCertificates;
