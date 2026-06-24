// Must match the integer order of your C# enums.
export const PRIORITY = {
  0: { label: "Low",      classes: "bg-slate-100 text-slate-700" },
  1: { label: "Medium",   classes: "bg-amber-100 text-amber-700" },
  2: { label: "High",     classes: "bg-orange-100 text-orange-700" },
  3: { label: "Critical", classes: "bg-red-100 text-red-700" },
};

export const STATUS = {
  0: { label: "New",         classes: "bg-blue-100 text-blue-700",    dot: "bg-blue-500" },
  1: { label: "Open",        classes: "bg-indigo-100 text-indigo-700", dot: "bg-indigo-500" },
  2: { label: "In Progress", classes: "bg-violet-100 text-violet-700", dot: "bg-violet-500" },
  3: { label: "On Hold",     classes: "bg-amber-100 text-amber-700",   dot: "bg-amber-500" },
  4: { label: "Resolved",    classes: "bg-green-100 text-green-700",   dot: "bg-green-500" },
  5: { label: "Closed",      classes: "bg-slate-200 text-slate-600",   dot: "bg-slate-400" },
};

export const priorityOf = (v) => PRIORITY[v] ?? { label: String(v), classes: "bg-slate-100 text-slate-700" };
export const statusOf   = (v) => STATUS[v]   ?? { label: String(v), classes: "bg-slate-100 text-slate-700", dot: "bg-slate-400" };