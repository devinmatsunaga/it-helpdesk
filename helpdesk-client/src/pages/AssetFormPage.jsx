import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAsset, createAsset, updateAsset, getUsers } from "../api";
import { Field, TextInput, Select } from "../components/Field";

export default function AssetFormPage() {
  const { id } = useParams();          // present = edit mode, absent = create mode
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    assetTag: "", name: "", type: "", location: "",
    serialNumber: "", purchaseDate: "", warrantyExpiry: "", assignedToUserId: "",
  });
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUsers().then(setUsers).catch(() => {});
    if (isEdit) {
      getAsset(id)
        .then((a) => setForm({
          assetTag: a.assetTag || "",
          name: a.name || "",
          type: a.type || "",
          location: a.location || "",
          serialNumber: a.serialNumber || "",
          // dates come as ISO; trim to yyyy-MM-dd for the date input
          purchaseDate: a.purchaseDate ? a.purchaseDate.slice(0, 10) : "",
          warrantyExpiry: a.warrantyExpiry ? a.warrantyExpiry.slice(0, 10) : "",
          assignedToUserId: a.assignedToUserId ?? "",
        }))
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const update = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.name.trim() || (!isEdit && !form.assetTag.trim())) {
      setError("Asset tag and name are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        type: form.type.trim() || null,
        location: form.location.trim() || null,
        serialNumber: form.serialNumber.trim() || null,
        // empty string → null; date input gives yyyy-MM-dd which the API parses fine
        purchaseDate: form.purchaseDate || null,
        warrantyExpiry: form.warrantyExpiry || null,
        assignedToUserId: form.assignedToUserId ? Number(form.assignedToUserId) : null,
      };
      if (isEdit) {
        await updateAsset(id, payload);
        navigate(`/assets/${id}`);
      } else {
        const created = await createAsset({ ...payload, assetTag: form.assetTag.trim() });
        navigate(`/assets/${created.id}`);
      }
    } catch (e) {
      setError(e.response?.status === 403
        ? "You don't have permission to do this."
        : (e.response?.data?.title || e.message));
      setSaving(false);
    }
  };

  if (loading) return <div className="text-slate-400">Loading…</div>;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-semibold text-slate-800">{isEdit ? "Edit Asset" : "New Asset"}</h1>
      <p className="text-sm text-slate-500">{isEdit ? "Update asset details" : "Register a new asset"}</p>

      <div className="mt-6 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        {error && <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <Field label="Asset Tag" required>
            <TextInput
              value={form.assetTag}
              onChange={update("assetTag")}
              placeholder="e.g. LAP-0042"
              disabled={isEdit}   // tag is fixed after creation
            />
          </Field>
          <Field label="Name" required>
            <TextInput value={form.name} onChange={update("name")} placeholder="e.g. Dell Latitude 5420" />
          </Field>
          <Field label="Type">
            <TextInput value={form.type} onChange={update("type")} placeholder="e.g. Laptop, Printer" />
          </Field>
          <Field label="Location">
            <TextInput value={form.location} onChange={update("location")} placeholder="e.g. Floor 2" />
          </Field>
          <Field label="Serial Number">
            <TextInput value={form.serialNumber} onChange={update("serialNumber")} />
          </Field>
          <Field label="Assigned To">
            <Select value={form.assignedToUserId} onChange={update("assignedToUserId")}>
              <option value="">Unassigned</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.displayName}</option>)}
            </Select>
          </Field>
          <Field label="Purchase Date">
            <TextInput type="date" value={form.purchaseDate} onChange={update("purchaseDate")} />
          </Field>
          <Field label="Warranty Expiry">
            <TextInput type="date" value={form.warrantyExpiry} onChange={update("warrantyExpiry")} />
          </Field>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={() => navigate(isEdit ? `/assets/${id}` : "/assets")} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={saving} className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Create Asset"}
          </button>
        </div>
      </div>
    </div>
  );
}



