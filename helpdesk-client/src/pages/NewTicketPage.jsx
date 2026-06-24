import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCategories, getUsers, getAssets, createTicket } from "../api";
import { Field, TextInput, TextArea, Select } from "../components/Field";
import { PRIORITY } from "../lib/enums";

export default function NewTicketPage() {
  const navigate = useNavigate();

  // dropdown data
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [assets, setAssets] = useState([]);

  // form state
  const [form, setForm] = useState({
    title: "",
    description: "",
    requesterId: "",
    categoryId: "",
    assetId: "",
    priority: 1, // Medium
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([getCategories(), getUsers(), getAssets()])
      .then(([cats, usrs, asts]) => {
        setCategories(cats);
        setUsers(usrs);
        setAssets(asts);
      })
      .catch((e) => setError(e.message));
  }, []);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async () => {
    setError(null);

    // basic client-side validation
    if (!form.title.trim() || !form.requesterId || !form.categoryId) {
      setError("Title, requester, and category are required.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        requesterId: Number(form.requesterId),
        categoryId: Number(form.categoryId),
        assetId: form.assetId ? Number(form.assetId) : null,
        priority: Number(form.priority),
      };
      const created = await createTicket(payload);
      navigate("/tickets"); // back to the list, where the new ticket appears
    } catch (e) {
      setError(e.response?.data?.title || e.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-800">New Ticket</h1>
      <p className="text-sm text-slate-500">Create a new support request</p>

      <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
        )}

        <Field label="Title" required>
          <TextInput
            value={form.title}
            onChange={update("title")}
            placeholder="Brief summary of the issue"
          />
        </Field>

        <Field label="Description">
          <TextArea
            value={form.description}
            onChange={update("description")}
            placeholder="Describe the problem in detail…"
          />
        </Field>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Requester" required>
            <Select value={form.requesterId} onChange={update("requesterId")}>
              <option value="">Select a requester…</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>{u.displayName}</option>
              ))}
            </Select>
          </Field>

          <Field label="Category" required>
            <Select value={form.categoryId} onChange={update("categoryId")}>
              <option value="">Select a category…</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>

          <Field label="Priority">
            <Select value={form.priority} onChange={update("priority")}>
              {Object.entries(PRIORITY).map(([val, { label }]) => (
                <option key={val} value={val}>{label}</option>
              ))}
            </Select>
          </Field>

          <Field label="Related Asset">
            <Select value={form.assetId} onChange={update("assetId")}>
              <option value="">None</option>
              {assets.map((a) => (
                <option key={a.id} value={a.id}>{a.assetTag} — {a.name}</option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={() => navigate("/tickets")}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Ticket"}
          </button>
        </div>
      </div>
    </div>
  );
}