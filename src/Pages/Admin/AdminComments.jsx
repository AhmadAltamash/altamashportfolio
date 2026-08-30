import { useEffect, useState } from "react";
import { db, collection } from "../../firebase-comment";
import { getDocs, query, orderBy, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Pencil, Trash2, X, Loader2, UploadCloud, UserCircle2 } from "lucide-react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import Field from "../../components/admin/Field";

const AdminComments = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const q = query(collection(db, "portfolio-comments"), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (comment) => {
    setEditingId(comment.id);
    setName(comment.userName || "");
    setMessage(comment.content || "");
    setImageFile(null);
    setImagePreview(comment.profileImage || "");
    setError("");
    setShowForm(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setImageFile(null);
    setImagePreview("");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    setError("");
    try {
      // imagePreview is only cleared to "" via the Remove Photo button, or
      // stays as the existing Cloudinary URL if left untouched — either way
      // it already reflects the final state unless a new file was picked.
      let profileImageUrl = imagePreview || null;
      if (imageFile) {
        profileImageUrl = await uploadToCloudinary(imageFile, "Portfolio/portfolio-comments-icon");
      }

      await updateDoc(doc(db, "portfolio-comments", editingId), {
        userName: name.trim(),
        content: message.trim(),
        profileImage: profileImageUrl,
      });

      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save comment.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this comment? This can't be undone.")) return;
    await deleteDoc(doc(db, "portfolio-comments", id));
    await load();
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.toDate) return "";
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(timestamp.toDate());
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Comments</h1>
        <span className="text-sm text-gray-400">{comments.length} total</span>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      ) : comments.length === 0 ? (
        <p className="text-gray-400">No comments yet.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
              {c.profileImage ? (
                <img src={c.profileImage} alt={c.userName} className="w-12 h-12 rounded-full object-cover shrink-0" />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <UserCircle2 className="w-6 h-6" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold truncate">{c.userName}</h3>
                  <span className="text-xs text-gray-500 shrink-0">{formatDate(c.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-400 break-words mt-1">{c.content}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => openEdit(c)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10" aria-label="Edit comment">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20" aria-label="Delete comment">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0a0a1a] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Edit Comment</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Profile Photo</label>
                {imagePreview ? (
                  <div className="flex items-center gap-4 mb-2">
                    <img src={imagePreview} alt="" className="w-16 h-16 rounded-full object-cover" />
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-sm"
                    >
                      <X className="w-4 h-4" /> Remove Photo
                    </button>
                  </div>
                ) : null}
                <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-dashed border-white/20 cursor-pointer text-sm text-gray-300">
                  <UploadCloud className="w-4 h-4" /> {imagePreview ? "Replace photo" : "Choose photo"}
                  <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              </div>

              <Field label="Name" value={name} onChange={setName} required />

              <div>
                <label className="block text-sm mb-1">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm resize-none h-28"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Comment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComments;
