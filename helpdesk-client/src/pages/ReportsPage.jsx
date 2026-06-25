import { useEffect, useState, useCallback } from "react";
import { getReportSummary } from "../api";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, Legend
} from "recharts";
import { RefreshCw, Ticket, CheckCircle, Clock, Timer } from "lucide-react";

export default function ReportsPage() {
  // Default range: last 30 days
  const today = new Date().toISOString().slice(0, 10);
  const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);

  const [from, setFrom] = useState(monthAgo);
  const [to, setTo] = useState(today);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getReportSummary(from, to)
      .then(setData)
      .catch((e) => setError(e.response?.status === 403 ? "Reports are restricted to agents." : e.message))
      .finally(() => setLoading(false));
  }, [from, to]);

  useEffect(() => { load(); }, [load]);

  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Reports</h1>
          <p className="text-sm text-slate-500">Helpdesk analytics and trends</p>
        </div>

        {/* Date range picker */}
        <div className="flex items-center gap-2 text-sm">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400" />
          <span className="text-slate-400">to</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 outline-none focus:border-blue-400" />
          <button onClick={load} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-600 hover:bg-slate-50">
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loading && !data ? (
        <div className="text-slate-400">Loading…</div>
      ) : data ? (
        <>
          {/* Stat cards */}
          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard icon={Ticket} label="Total Tickets" value={data.totalTickets} color="text-blue-600" />
            <StatCard icon={Clock} label="Open" value={data.openTickets} color="text-amber-600" />
            <StatCard icon={CheckCircle} label="Resolved" value={data.resolvedTickets} color="text-green-600" />
            <StatCard icon={Timer} label="Avg Days to Close" value={data.avgDaysToClose} color="text-violet-600" />
          </div>

          {/* Volume over time */}
          <ChartCard title="Ticket Volume Over Time">
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.volumeOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Agent performance */}
            <ChartCard title="Agent Performance">
              {data.agentPerformance.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.agentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="agentName" tick={{ fontSize: 11 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="assigned" fill="#93c5fd" name="Assigned" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="resolved" fill="#3b82f6" name="Resolved" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            {/* Category trends */}
            <ChartCard title="Tickets by Category">
              {data.categoryTrends.length === 0 ? (
                <Empty />
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={data.categoryTrends} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                    <YAxis type="category" dataKey="category" width={80} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </ChartCard>
          </div>
        </>
      ) : null}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <Icon className={`h-5 w-5 ${color}`} />
      </div>
      <div className="mt-2 text-3xl font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="mb-4 text-sm font-semibold text-slate-700">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return <div className="flex h-[280px] items-center justify-center text-sm text-slate-400">No data for this range.</div>;
}