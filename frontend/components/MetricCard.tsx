type Props = {
  label: string;
  value: string | number;
  sub?: string;
  tone?: "default" | "danger" | "success" | "warning";
};

const toneMap = {
  default: "text-slate-900",
  danger: "text-rose-600",
  success: "text-green-700",
  warning: "text-amber-600",
};

export default function MetricCard({ label, value, sub, tone = "default" }: Props) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${toneMap[tone]}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
