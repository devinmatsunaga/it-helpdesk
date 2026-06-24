import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Ticket, TicketCheck, Monitor,
  Users, BookOpen, BarChart3, Settings, Headphones
} from "lucide-react";
import {useAuth} from "../auth/AuthContext"
import {useNavigate} from "react-router-dom"


const nav = [
  { to: "/",            label: "Dashboard",      icon: LayoutDashboard, end: true },
  { to: "/tickets",     label: "Tickets",        icon: Ticket },
  { to: "/my-tickets",  label: "My Tickets",     icon: TicketCheck },
  { to: "/assets",      label: "Assets",         icon: Monitor },
  { to: "/users",       label: "Users",          icon: Users },
  { to: "/knowledge",   label: "Knowledge Base", icon: BookOpen },
  { to: "/reports",     label: "Reports",        icon: BarChart3 },
  { to: "/settings",    label: "Settings",       icon: Settings },
];

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate()
  return (
    <aside className="flex h-screen w-64 flex-col bg-slate-900 text-slate-300">
      <div className="flex items-center gap-2 px-6 py-5 text-white">
        <Headphones className="h-6 w-6 text-blue-400" />
        <span className="text-lg font-semibold">IT Helpdesk</span>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {nav.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      


      <div className="border-t border-slate-800 px-4 py-4">
  <div className="flex items-center gap-3">
    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
      {user ? initials(user.displayName) : "?"}
    </div>
    <div className="flex-1 text-sm">
      <div className="font-medium text-white">{user?.displayName ?? "Not signed in"}</div>
      <div className="text-xs text-slate-400">{user?.role ?? ""}</div>
    </div>
  </div>
  {user && (
    <button
      onClick = {() => {signOut(); navigate("/login");}}
      className="mt-3 w-full rounded-lg border border-slate-700 py-1.5 text-xs text-slate-300 hover:bg-slate-800"
    >
      Sign Out
    </button>
  )}
</div>
    </aside>
  );

  function initials(name = "") {
    return name.split(" ").map((n) => n[0]).slice(0,2).join("").toUpperCase() || "?";
  }
}