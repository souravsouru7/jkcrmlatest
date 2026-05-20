import type { ReactNode } from "react";

type Props = {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export default function Panel({ title, action, children, className = "" }: Props) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl shadow-sm ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-slate-100">
          {title && <h3 className="font-bold text-slate-900">{title}</h3>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
