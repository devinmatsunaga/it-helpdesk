import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArticle, createArticle, updateArticle, getArticleCategories } from "../api";
import { Field, TextInput, TextArea, Select } from "../components/Field";

export default function ArticleFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({ title: "", body: "", articleCategoryId: "", isPublished: false });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getArticleCategories().then(setCategories).catch(() => {});
    if (isEdit) {
      getArticle(id)
        .then((a) => setForm({
          title: a.title, body: a.body,
          articleCategoryId: a.articleCategoryId, isPublished: a.isPublished,
        }))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const handleSubmit = async () => {
    setError(null);
    if (!form.title.trim() || !form.body.trim() || !form.articleCategoryId) {
      setError("Title, body, and category are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        body: form.body,
        articleCategoryId: Number(form.articleCategoryId),
        isPublished: form.isPublished,
      };
      const result = isEdit ? await updateArticle(id, payload) : await createArticle(payload);
      navigate(`/knowledge/${isEdit ? id : result.id}`);
    } catch (e) {
      setError(e.response?.status === 403 ? "Only agents can manage articles." : e.message);
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-800">{isEdit ? "Edit Article" : "New Article"}</h1>
      <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <Field label="Title" required>
          <TextInput value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Article title" />
        </Field>

        <Field label="Category" required>
          <Select value={form.articleCategoryId} onChange={(e) => setForm({ ...form, articleCategoryId: e.target.value })}>
            <option value="">Select a category…</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
        </Field>

        <Field label="Body (Markdown supported)" required>
          <TextArea
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            placeholder="Write your article in Markdown…"
            style={{ minHeight: 300, fontFamily: "monospace" }}
          />
        </Field>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.isPublished}
            onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
          />
          Published (uncheck to save as draft)
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => navigate("/knowledge")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Article"}
          </button>
        </div>
      </div>
    </div>
  );
}