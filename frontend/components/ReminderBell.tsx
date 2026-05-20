"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";

type Reminders = Awaited<ReturnType<typeof api.reminders>>;

export default function ReminderBell() {
  const [data, setData] = useState<Reminders | null>(null);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  function load() {
    api.reminders().then(setData).catch(() => {});
  }

  useEffect(() => {
    load();
    const id = setInterval(load, 60000); // refresh every minute
    return () => clearInterval(id);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const total = data?.total ?? 0;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/10 transition"
        title="Reminders"
      >
        <span className="text-base">🔔</span>
        {total > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold px-1">
            {total > 99 ? "99+" : total}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-full top-0 ml-2 w-80 bg-white rounded-xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <p className="font-bold text-sm text-slate-900">Reminders</p>
            {total > 0 && (
              <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full">
                {total} alert{total !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
            {total === 0 && (
              <p className="text-sm text-slate-400 text-center py-8">All clear — no reminders</p>
            )}

            {/* New website leads */}
            {(data?.newWebLeads?.length ?? 0) > 0 && (
              <Section title="New Website Leads" color="teal">
                {data!.newWebLeads.map((l) => (
                  <Link key={l.id} href="/leads" onClick={() => setOpen(false)}>
                    <Row
                      icon="🌐"
                      main={l.name}
                      sub={l.project || "No project specified"}
                      tag={formatTime(l.createdAt)}
                      tagColor="teal"
                    />
                  </Link>
                ))}
              </Section>
            )}

            {/* Overdue follow-ups */}
            {(data?.overdue?.length ?? 0) > 0 && (
              <Section title="Overdue Follow-ups" color="red">
                {data!.overdue.map((f) => (
                  <Link key={f.id} href="/follow-ups" onClick={() => setOpen(false)}>
                    <Row
                      icon="⚠️"
                      main={f.leadName}
                      sub={f.type}
                      tag={`${f.daysOverdue}d overdue`}
                      tagColor="red"
                    />
                  </Link>
                ))}
              </Section>
            )}

            {/* Due today */}
            {(data?.dueToday?.length ?? 0) > 0 && (
              <Section title="Due Today" color="amber">
                {data!.dueToday.map((f) => (
                  <Link key={f.id} href="/follow-ups" onClick={() => setOpen(false)}>
                    <Row
                      icon="📅"
                      main={f.leadName}
                      sub={f.type}
                      tag="Today"
                      tagColor="amber"
                    />
                  </Link>
                ))}
              </Section>
            )}

            {/* Stale leads */}
            {(data?.staleLeads?.length ?? 0) > 0 && (
              <Section title="No Activity (7+ days)" color="slate">
                {data!.staleLeads.map((l) => (
                  <Link key={l.id} href="/leads" onClick={() => setOpen(false)}>
                    <Row
                      icon="💤"
                      main={l.name}
                      sub={l.stage}
                      tag={`${l.daysSinceActivity}d silent`}
                      tagColor="slate"
                    />
                  </Link>
                ))}
              </Section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = {
    red: "text-red-600",
    amber: "text-amber-600",
    teal: "text-teal-600",
    slate: "text-slate-500",
  };
  return (
    <div>
      <p className={`px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-widest ${colors[color] ?? "text-slate-500"}`}>
        {title}
      </p>
      {children}
    </div>
  );
}

function Row({ icon, main, sub, tag, tagColor }: {
  icon: string; main: string; sub: string; tag: string; tagColor: string;
}) {
  const tagColors: Record<string, string> = {
    red: "bg-red-50 text-red-600",
    amber: "bg-amber-50 text-amber-600",
    teal: "bg-teal-50 text-teal-700",
    slate: "bg-slate-100 text-slate-500",
  };
  return (
    <div className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50 transition cursor-pointer">
      <span className="text-base shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{main}</p>
        <p className="text-xs text-slate-400 truncate">{sub}</p>
      </div>
      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded shrink-0 ${tagColors[tagColor] ?? ""}`}>
        {tag}
      </span>
    </div>
  );
}

function formatTime(iso: string) {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (diff < 1) return "just now";
  if (diff < 60) return `${diff}m ago`;
  if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
  return `${Math.floor(diff / 1440)}d ago`;
}
