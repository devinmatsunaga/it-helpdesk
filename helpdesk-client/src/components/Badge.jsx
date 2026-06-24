export function PriorityBadge({ value }) {
  const p = priorityOf(value);
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${p.classes}`}>
      {p.label}
    </span>
  );
}

export function StatusBadge({ value }) {
  const s = statusOf(value);
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${s.classes}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}

import { priorityOf, statusOf } from "../lib/enums";