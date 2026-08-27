import { useEffect, useState } from "react";
import { db, collection } from "../../firebase";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Pencil, Trash2, X, Loader2, UploadCloud } from "lucide-react";
import { uploadToCloudinary } from "../../utils/cloudinary";
import Field from "../../components/admin/Field";

const emptyForm = {
  Title: "",
  Description: "",
  Img: "",
  Link: "",
  Github: "",
  TechStack: "",   // comma-separated in the form, array in Firestore
  Features: "",    // one per line in the form, array in Firestore
  Order: "",       // lower shows first; blank/unset sorts to the end
};

const AdminProjects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "projects"));
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    data.sort((a, b) => {
      const orderA = a.Order ?? Infinity;
      const orderB = b.Order ?? Infinity;
      return orderA - orderB;
    });
    setProjects(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImageFile(null);
    setImagePreview("");
    setError("");
    setShowForm(true);
  };

  const openEdit = (project) => {
    setEditingId(project.id);
    setForm({
      Title: project.Title || "",
      Description: project.Description || "",
      Img: project.Img || "",
      Link: project.Link || "",
      Github: project.Github || "",
      TechStack: (project.TechStack || []).join(", "),
      Features: (project.Features || []).join("\n"),
      Order: project.Order ?? "",
    });
    setImageFile(null);
    setImagePreview(project.Img || "");
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
      let imgUrl = form.Img;
      if (imageFile) {
        imgUrl = await uploadToCloudinary(imageFile, "Portfolio/projects");
      }

      const payload = {
        Title: form.Title.trim(),
        Description: form.Description.trim(),
        Img: imgUrl,
        Link: form.Link.trim(),
        Github: form.Github.trim(),
        TechStack: form.TechStack.split(",").map((s) => s.trim()).filter(Boolean),
        Features: form.Features.split("\n").map((s) => s.trim()).filter(Boolean),
        Order: form.Order === "" ? null : Number(form.Order),
      };

      if (editingId) {
        await updateDoc(doc(db, "projects", editingId), payload);
      } else {
        await addDoc(collection(db, "projects"), payload);
      }

      setShowForm(false);
      await load();
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save project.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this project? This can't be undone.")) return;
    await deleteDoc(doc(db, "projects", id));
    await load();
  };

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      ) : projects.length === 0 ? (
        <p className="text-gray-400">No projects yet — add your first one.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {projects.map((p) => (
            <div key={p.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
              {p.Img && (
                <img src={p.Img} alt={p.Title} className="w-20 h-20 object-cover rounded-lg shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{p.Title}</h3>
                <p className="text-sm text-gray-400 line-clamp-2">{p.Description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  Order: {p.Order ?? "—"}
                </p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => openEdit(p)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
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
              <h2 className="text-lg font-semibold">{editingId ? "Edit" : "Add"} Project</h2>
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

              <Field label="Title" value={form.Title} onChange={(v) => setForm({ ...form, Title: v })} required />
              <Field
                label="Display order (lower = shows first, leave blank for last)"
                type="number"
                value={form.Order}
                onChange={(v) => setForm({ ...form, Order: v })}
                placeholder="1"
              />
              <div>
                <label className="block text-sm mb-1">Description</label>
                <textarea
                  value={form.Description}
                  onChange={(e) => setForm({ ...form, Description: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm resize-none h-20"
                  required
                />
              </div>
              <Field label="Live demo link" value={form.Link} onChange={(v) => setForm({ ...form, Link: v })} />
              <Field label="GitHub link (leave as 'Private' to hide source)" value={form.Github} onChange={(v) => setForm({ ...form, Github: v })} />
              <Field label="Tech stack (comma separated)" value={form.TechStack} onChange={(v) => setForm({ ...form, TechStack: v })} placeholder="React, Node.js, MongoDB" />
              <div>
                <label className="block text-sm mb-1">Key features (one per line)</label>
                <textarea
                  value={form.Features}
                  onChange={(e) => setForm({ ...form, Features: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm resize-none h-24"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Project"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProjects;
