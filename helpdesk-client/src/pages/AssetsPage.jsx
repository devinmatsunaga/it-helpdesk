import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getAssetsPaged, getAssetTypes } from "../api";
import { useAuth } from "../auth/AuthContext";
import { Monitor, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";

export default function AssetsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const canManage = user?.role === "Agent" || user?.role === "Admin";

  const [data, setData] = useState({ items: [], totalCount: 0, page: 1, totalPages: 1 });
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter/sort/page state
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [assignment, setAssignment] = useState("");
  const [sortBy, setSortBy] = useState("tag");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { getAssetTypes().then(setTypes).catch(() => {}); }, []);

  const load = useCallback(() => {
    setLoading(true);
    getAssetsPaged({ search, type, status, assignment, sortBy, sortDir, page, pageSize })
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [search, type, status, assignment, sortBy, sortDir, page]);

  // Debounce so typing in search doesn't fire a request per keystroke
  useEffect(() => {
    const handle = setTimeout(load, 250);
    return () => clearTimeout(handle);
  }, [load]);

  // Any filter change resets to page 1 (except when page itself changes)
  useEffect(() => { setPage(1); }, [search, type, status, assignment, sortBy, sortDir]);

  const toggleSort = (field) => {
    if (sortBy === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortBy(field); setSortDir("asc"); }
  };

  const sortIndicator = (field) => sortBy === field ? (sortDir === "asc" ? " ▲" : " ▼") : "";

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Assets</h1>
          <p className="text-sm text-slate-500">{data.totalCount} total</p>
        </div>
        {canManage && (
          <button onClick={() => navigate("/assets/new")} className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
            <Plus className="h-4 w-4" /> New Asset
          </button>
        )}
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tag or name…"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none focus:border-blue-400"
          />
        </div>

        <select value={type} onChange={(e) => setType(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="retired">Retired</option>
        </select>

        <select value={assignment} onChange={(e) => setAssignment(e.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm">
          <option value="">All assignments</option>
          <option value="assigned">Assigned</option>
          <option value="unassigned">Unassigned</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading…</div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="cursor-pointer px-6 py-3 font-medium hover:text-slate-700" onClick={() => toggleSort("tag")}>
                  Asset Tag{sortIndicator("tag")}
                </th>
                <th className="cursor-pointer px-6 py-3 font-medium hover:text-slate-700" onClick={() => toggleSort("name")}>
                  Name{sortIndicator("name")}
                </th>
                <th className="px-6 py-3 font-medium">Type</th>
                <th className="px-6 py-3 font-medium">Location</th>
                <th className="px-6 py-3 font-medium">Assigned To</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.items.map((a) => (
                <tr key={a.id} onClick={() => navigate(`/assets/${a.id}`)} className="cursor-pointer hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <span className="flex items-center gap-2 font-mono text-xs font-medium text-blue-600">
                      <Monitor className="h-4 w-4 text-slate-400" />{a.assetTag}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-800">{a.name}</td>
                  <td className="px-6 py-4 text-slate-600">{a.type || "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{a.location || "—"}</td>
                  <td className="px-6 py-4 text-slate-600">{a.assignedToName || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${a.isActive ? "bg-green-100 text-green-700" : "bg-slate-200 text-slate-500"}`}>
                      {a.isActive ? "Active" : "Retired"}
                    </span>
                  </td>
                </tr>
              ))}
              {data.items.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No assets match your filters.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {data.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Page {data.page} of {data.totalPages} ({data.totalCount} assets)
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={data.page <= 1}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={data.page >= data.totalPages}
              className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}