import { useEffect, useState } from "react";
import { getAssets } from "../api";
import { Monitor } from "lucide-react";

export default function AssetsPage() {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAssets()
      .then(setAssets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Assets</h1>
        <p className="text-sm text-slate-500">Tracked equipment and devices</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && <div className="p-8 text-center text-slate-400">Loading assets…</div>}
        {error && <div className="p-8 text-center text-red-500">Error: {error}</div>}
        {!loading && !error && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Asset Tag</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Location</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {assets.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 font-mono text-xs font-medium text-blue-600">
                      <Monitor className="h-4 w-4 text-slate-400" />
                      {a.assetTag}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{a.name}</td>
                  <td className="px-6 py-4 text-slate-600">{a.location || "—"}</td>
                </tr>
              ))}
              {assets.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No assets yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}