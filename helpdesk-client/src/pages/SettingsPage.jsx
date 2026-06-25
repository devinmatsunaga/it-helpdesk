import { usePreferences } from "../preferences/PreferencesContext";
import { useAuth } from "../auth/AuthContext";
import { User, Palette, List, Layout } from "lucide-react";

export default function SettingsPage() {
  const { prefs, update } = usePreferences();
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Settings</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400">Your personal preferences</p>

      {/* Profile */}
      <Section icon={User} title="Profile">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
            {initials(user?.displayName)}
          </div>
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-100">{user?.displayName}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{user?.username} · {user?.role}</div>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-400">Profile details are managed in Active Directory.</p>
      </Section>

      {/* Theme */}
      <Section icon={Palette} title="Appearance">
        <Label>Theme</Label>
        <div className="flex gap-2">
          {["light", "dark", "system"].map((t) => (
            <button
              key={t}
              onClick={() => update("theme", t)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium capitalize ${
                prefs.theme === t
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Label className="mt-4">Compact mode</Label>
        <Toggle checked={prefs.compact} onChange={(v) => update("compact", v)} label="Tighter table spacing" />
      </Section>

      {/* List preferences */}
      <Section icon={List} title="Lists">
        <Label>Default page size</Label>
        <div className="flex gap-2">
          {[10, 25, 50].map((n) => (
            <button
              key={n}
              onClick={() => update("pageSize", n)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                prefs.pageSize === n
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {n}
            </button>
          ))}
        </div>

        <Label className="mt-4">Default tickets view</Label>
        <div className="flex gap-2">
          {[["all", "All tickets"], ["unassigned", "Unassigned"]].map(([val, lbl]) => (
            <button
              key={val}
              onClick={() => update("defaultTicketView", val)}
              className={`rounded-lg border px-4 py-2 text-sm font-medium ${
                prefs.defaultTicketView === val
                  ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {lbl}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}

function Section({ icon: Icon, title, children }) {
  return (
    <div className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-800 dark:text-slate-100">
        <Icon className="h-4 w-4 text-blue-500" /> {title}
      </h2>
      {children}
    </div>
  );
}
function Label({ children, className = "" }) {
  return <div className={`mb-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 ${className}`}>{children}</div>;
}
function Toggle({ checked, onChange, label }) {
  return (
    <button onClick={() => onChange(!checked)} className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
      <span className={`relative h-5 w-9 rounded-full transition ${checked ? "bg-blue-600" : "bg-slate-300 dark:bg-slate-600"}`}>
        <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${checked ? "left-[1.125rem]" : "left-0.5"}`} />
      </span>
      {label}
    </button>
  );
}
function initials(name = "") {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase() || "?";
}