import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getAsset, deactivateAsset, reactivateAsset } from "../api";
import { useAuth } from "../auth/AuthContext";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { ArrowLeft, Pencil, Power } from "lucide-react";

export default function AssetDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManage = user?.role === "Agent" || user?.role === "Admin";

  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = () => {
    getAsset(id)
      .then(setAsset)
      .catch((e) => setError(e.response?.status === 404 ? "Asset not found." : e.message))
      .finally(() => setLoading(false));
  };
  useEffect(load, [id]);

  const handleToggleActive = async () => {
    try {
      if (asset.isActive) await deactivateAsset(id);
      else await reactivateAsset(id);
      load();
    } catch (e) {
      alert("Action failed: " + e.message);
    }
  };

  if (loading) return <div className="text-slate-400">Loading…</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => navigate("/assets")} className="flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> Back to Assets
        </button>
        {canManage && (
          <div className="flex gap-2">
            <button onClick={() => navigate(`/assets/${id}/edit`)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Pencil className="h-4 w-4" /> Edit
            </button>
            <button onClick={handleToggleActive} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
              <Power className="h-4 w-4" /> {asset.isActive ? "Retire" : "Reactivate"}
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="font-mono text-sm font-medium text-blue-600">{asset.assetTag}</span>
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${asset.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                {asset.isActive ? "Active" : "Retired"}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-slate-800">{asset.name}</h1>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm">
              <Detail label="Type" value={asset.type} />
              <Detail label="Location" value={asset.location} />
              <Detail label="Serial Number" value={asset.serialNumber} />
              <Detail label="Assigned To" value={asset.assignedToName} />
              <Detail label="Purchase Date" value={fmtDate(asset.purchaseDate)} />
              <Detail label="Warranty Expiry" value={fmtDate(asset.warrantyExpiry)} />
            </div>
          </div>

          {/* Ticket history */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Ticket History</h2>
            <div className="mt-3 space-y-2">
              {asset.tickets.length === 0 && <p className="text-sm text-slate-400">No tickets for this asset.</p>}
              {asset.tickets.map((t) => (
                <div key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-100 px-4 py-3 hover:bg-slate-50">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{t.title}</div>
                    <div className="text-xs text-slate-400">{fmtDate(t.createdAt)}</div>
                  </div>
                  <div className="flex gap-2">
                    <PriorityBadge value={t.priority} />
                    <StatusBadge value={t.status} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-800">Summary</h3>
            <p className="text-sm text-slate-500">{asset.tickets.length} ticket(s) on record.</p>
            <p className="mt-1 text-xs text-slate-400">Added {fmtDate(asset.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="font-medium text-slate-800">{value || "—"}</div>
    </div>
  );
}
function fmtDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}