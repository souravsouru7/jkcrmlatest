type BadgeProps = { value: string; className?: string };

const MAP: Record<string, string> = {
  hot: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  overdue: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  warm: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  pending: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  cold: "bg-slate-700/50 text-white/40 border-white/10",
  won: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  completed: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  accepted: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  sent: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  draft: "bg-slate-700/50 text-white/40 border-white/10",
  scheduled: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  lost: "bg-slate-700/50 text-white/30 border-white/10",
  rejected: "bg-rose-500/15 text-rose-400 border-rose-500/30",
  expired: "bg-slate-700/50 text-white/30 border-white/10",
  rescheduled: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  "no show": "bg-rose-500/15 text-rose-400 border-rose-500/30",
  negotiation: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  "new lead": "bg-sky-500/15 text-sky-400 border-sky-500/30",
  contacted: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
  qualified: "bg-violet-500/15 text-violet-400 border-violet-500/30",
  "site visit": "bg-teal-500/15 text-teal-400 border-teal-500/30",
  quotation: "bg-blue-500/15 text-blue-400 border-blue-500/30",
};

export default function Badge({ value, className = "" }: BadgeProps) {
  const cls = MAP[value.toLowerCase()] ?? "bg-slate-700/50 text-white/40 border-white/10";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold whitespace-nowrap ${cls} ${className}`}>
      {value}
    </span>
  );
}
