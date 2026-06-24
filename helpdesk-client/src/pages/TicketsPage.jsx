import { useEffect, useState } from "react";
import { getTickets } from "../api";
import { PriorityBadge, StatusBadge } from "../components/Badge";
import { useNavigate } from "react-router-dom";


export default function TicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getTickets()
      .then(setTickets)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Tickets</h1>
          <p className="text-sm text-slate-500">All support requests</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && <div className="p-8 text-center text-slate-400">Loading tickets…</div>}
        {error && <div className="p-8 text-center text-red-500">Error: {error}</div>}
        {!loading && !error && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">ID</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Requester</th>
                <th className="px-6 py-3 font-medium">Category</th>
                <th className="px-6 py-3 font-medium">Priority</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} onClick={() => navigate(`/tickets/${t.id}`)} className="cursor-pointer hover:bg-slate-50">
                  <td className="px-6 py-4 font-mono text-xs text-slate-400">#{t.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{t.title}</td>
                  <td className="px-6 py-4 text-slate-600">{t.requesterName}</td>
                  <td className="px-6 py-4 text-slate-600">{t.categoryName}</td>
                  <td className="px-6 py-4"><PriorityBadge value={t.priority} /></td>
                  <td className="px-6 py-4"><StatusBadge value={t.status} /></td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-400">No tickets yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}