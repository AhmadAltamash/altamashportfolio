import { useEffect, useState } from "react";
import { db, collection } from "../../firebase";
import { getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { Plus, Pencil, Trash2, X, Loader2, GripVertical } from "lucide-react";
import Field from "../../components/admin/Field";

const emptyForm = { company: "", role: "", duration: "", bullets: "" };

const AdminExperience = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    const snap = await getDocs(collection(db, "experience"));
    const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    setItems(list);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setShowForm(true);
  };

  const openEdit = (item) => {
    setEditingId(item.id);
    setForm({
      company: item.company || "",
      role: item.role || "",
      duration: item.duration || "",
      bullets: (item.bullets || []).join("\n"),
    });
    setError("");
    setShowForm(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const payload = {
        company: form.company.trim(),
        role: form.role.trim(),
        duration: form.duration.trim(),
        bullets: form.bullets.split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 6),
        order: editingId
          ? items.find((i) => i.id === editingId)?.order ?? items.length
          : items.length,
      };

      if (editingId) {
        await updateDoc(doc(db, "experience", editingId), payload);
      } else {
        await addDoc(collection(db, "experience"), payload);
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this experience entry?")) return;
    await deleteDoc(doc(db, "experience", id));
    await load();
  };

  const move = async (index, dir) => {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    const reordered = [...items];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setItems(reordered);
    await Promise.all(
      reordered.map((item, i) => updateDoc(doc(db, "experience", item.id), { order: i }))
    );
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Work Experience</h1>
        <button
          onClick={openNew}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 text-sm font-medium hover:scale-105 transition-transform"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </button>
      </div>

      {loading ? (
        <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
      ) : items.length === 0 ? (
        <p className="text-gray-400">No experience entries yet.</p>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div key={item.id} className="bg-white/5 border border-white/10 rounded-xl p-4 flex gap-4">
              <div className="flex flex-col justify-center gap-1 shrink-0">
                <button disabled={index === 0} onClick={() => move(index, -1)} className="disabled:opacity-20 text-gray-400 hover:text-white">▲</button>
                <GripVertical className="w-4 h-4 text-gray-600 mx-auto" />
                <button disabled={index === items.length - 1} onClick={() => move(index, 1)} className="disabled:opacity-20 text-gray-400 hover:text-white">▼</button>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold">{item.role} · {item.company}</h3>
                  <span className="text-xs text-gray-400 shrink-0">{item.duration}</span>
                </div>
                <ul className="mt-2 space-y-1 text-sm text-gray-400 list-disc list-inside">
                  {(item.bullets || []).map((b, i) => <li key={i}>{b}</li>)}
                </ul>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => openEdit(item)} className="p-2 rounded-lg bg-white/5 hover:bg-white/10">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20">
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
              <h2 className="text-lg font-semibold">{editingId ? "Edit" : "Add"} Experience</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>

            {error && <p className="text-sm text-red-400 mb-3">{error}</p>}

            <form onSubmit={handleSave} className="space-y-4">
              <Field label="Company" value={form.company} onChange={(v) => setForm({ ...form, company: v })} required />
              <Field label="Your role" value={form.role} onChange={(v) => setForm({ ...form, role: v })} required />
              <Field label="Duration" value={form.duration} onChange={(v) => setForm({ ...form, duration: v })} placeholder="Jan 2024 – Present" required />
              <div>
                <label className="block text-sm mb-1">Description (one bullet per line, up to 6)</label>
                <textarea
                  value={form.bullets}
                  onChange={(e) => setForm({ ...form, bullets: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-white/5 border border-white/10 text-sm resize-none h-32"
                  placeholder={"Built and shipped the payments module\nReduced API latency by 40%"}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 font-medium disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save Experience"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminExperience;
