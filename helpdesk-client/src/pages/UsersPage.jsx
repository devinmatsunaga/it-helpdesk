import { useEffect, useState } from "react";
import { getUsers } from "../api";

const ROLE = {
  0: { label: "Requester", classes: "bg-slate-100 text-slate-700" },
  1: { label: "Agent",     classes: "bg-blue-100 text-blue-700" },
  2: { label: "Admin",     classes: "bg-violet-100 text-violet-700" },
};

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getUsers()
      .then(setUsers)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
        <p className="text-sm text-slate-500">People in the system</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {loading && <div className="p-8 text-center text-slate-400">Loading users…</div>}
        {error && <div className="p-8 text-center text-red-500">Error: {error}</div>}
        {!loading && !error && (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((u) => {
                const role = ROLE[u.role] ?? { label: String(u.role), classes: "bg-slate-100 text-slate-700" };
                return (
                  <tr key={u.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-[10px] font-semibold text-white">
                          {initials(u.displayName)}
                        </span>
                        <span className="font-medium text-slate-800">{u.displayName}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-600">{u.email}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${role.classes}`}>
                        {role.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {users.length === 0 && (
                <tr><td colSpan={3} className="px-6 py-8 text-center text-slate-400">No users yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}