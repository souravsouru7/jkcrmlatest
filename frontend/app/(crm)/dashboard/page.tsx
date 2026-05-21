"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import type { Lead, FollowUp, DashboardSummary } from "@/lib/types";

type DashData = {
  summary: DashboardSummary;
  priorityLeads: Lead[];
  upcomingFollowUps: FollowUp[];
  stageBreakdown: { stage: string; count: number; value: number }[];
  sourceBreakdown: { source: string; count: number }[];
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-slate-800 rounded-lg animate-pulse ${className}`} />;
}

const METRIC_ICONS = {
  leads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  ),
  pipeline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75" />
    </svg>
  ),
  won: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  conversion: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  overdue: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
    </svg>
  ),
  visits: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
    </svg>
  ),
};

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then((d) => setData(d as DashData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.summary;

  const metrics = [
    {
      label: "Total Leads",
      value: s?.totalLeads ?? 0,
      sub: "All time",
      icon: METRIC_ICONS.leads,
      color: "teal",
    },
    {
      label: "Pipeline Value",
      value: s ? money(s.pipelineValue) : "₹0",
      sub: "Active deals",
      icon: METRIC_ICONS.pipeline,
      color: "blue",
    },
    {
      label: "Won Revenue",
      value: s ? money(s.wonValue) : "₹0",
      sub: "Closed deals",
      icon: METRIC_ICONS.won,
      color: "emerald",
    },
    {
      label: "Conversion Rate",
      value: s ? `${s.conversion}%` : "0%",
      sub: "Win rate",
      icon: METRIC_ICONS.conversion,
      color: "violet",
    },
    {
      label: "Overdue Follow-ups",
      value: s?.overdue ?? 0,
      sub: "Needs attention",
      icon: METRIC_ICONS.overdue,
      color: s?.overdue ? "rose" : "slate",
      alert: !!(s?.overdue && s.overdue > 0),
    },
    {
      label: "Site Visits Today",
      value: s?.visitsToday ?? 0,
      sub: "Scheduled",
      icon: METRIC_ICONS.visits,
      color: "amber",
    },
  ];

  const colorMap: Record<string, { bg: string; icon: string; value: string }> = {
    teal:    { bg: "bg-teal-500/10 border-teal-500/20",    icon: "text-teal-400",    value: "text-white" },
    blue:    { bg: "bg-blue-500/10 border-blue-500/20",    icon: "text-blue-400",    value: "text-white" },
    emerald: { bg: "bg-emerald-500/10 border-emerald-500/20", icon: "text-emerald-400", value: "text-emerald-400" },
    violet:  { bg: "bg-violet-500/10 border-violet-500/20",  icon: "text-violet-400",  value: "text-white" },
    rose:    { bg: "bg-rose-500/10 border-rose-500/30",    icon: "text-rose-400",    value: "text-rose-400" },
    amber:   { bg: "bg-amber-500/10 border-amber-500/20",   icon: "text-amber-400",   value: "text-white" },
    slate:   { bg: "bg-slate-800 border-slate-700",         icon: "text-slate-500",   value: "text-white" },
  };

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const maxStageValue = Math.max(...(data?.stageBreakdown?.map((r) => r.value) ?? [1]), 1);

  return (
    <div className="p-4 sm:p-6 space-y-5 sm:space-y-6 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5 truncate">{today}</p>
        </div>
        <Link
          href="/leads"
          className="shrink-0 flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-lg transition shadow-lg shadow-teal-900/30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Add Lead</span>
          <span className="sm:hidden">Add</span>
        </Link>
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {metrics.map(({ label, value, sub, icon, color }) => {
            const c = colorMap[color];
            return (
              <div
                key={label}
                className={`rounded-xl border p-4 ${c.bg}`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${c.bg} ${c.icon}`}>
                  {icon}
                </div>
                <p className={`text-xl font-bold leading-none ${c.value}`}>{String(value)}</p>
                <p className="text-slate-400 text-xs font-medium mt-1.5 leading-none">{label}</p>
                <p className="text-slate-600 text-[10px] mt-1">{sub}</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Middle row: Hot Leads + Follow-ups */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4 sm:gap-6">
        {/* Hot Leads table */}
        <div className="xl:col-span-3 bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white text-sm">Hot Leads</h2>
            <Link href="/leads" className="text-teal-400 hover:text-teal-300 text-xs font-medium transition">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12" />)}
            </div>
          ) : (
            <table className="w-full min-w-[380px]">
              <thead>
                <tr className="border-b border-slate-800">
                  <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3">Client</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden md:table-cell">Project</th>
                  <th className="text-right text-xs font-semibold text-slate-500 px-3 py-3">Budget</th>
                  <th className="text-left text-xs font-semibold text-slate-500 px-3 py-3 hidden lg:table-cell">Stage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {(data?.priorityLeads ?? []).slice(0, 6).map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
                          {lead.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-white text-sm truncate">{lead.name}</p>
                          <p className="text-slate-500 text-xs truncate">{lead.location}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3 hidden md:table-cell">
                      <span className="text-slate-400 text-sm">{lead.project}</span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className="font-semibold text-teal-400 text-sm">{money(lead.budget)}</span>
                    </td>
                    <td className="px-3 py-3 hidden lg:table-cell">
                      <Badge value={lead.stage} />
                    </td>
                  </tr>
                ))}
                {!data?.priorityLeads?.length && (
                  <tr>
                    <td colSpan={4} className="px-5 py-10 text-center text-slate-600 text-sm">
                      No hot leads yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Upcoming Follow-ups */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white text-sm">Upcoming Follow-ups</h2>
            <Link href="/follow-ups" className="text-teal-400 hover:text-teal-300 text-xs font-medium transition">
              View all →
            </Link>
          </div>

          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {(data?.upcomingFollowUps ?? []).slice(0, 6).map((f) => (
                <div key={f.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-800/50 transition-colors">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${
                    f.status === "Overdue" ? "bg-rose-400" :
                    f.status === "Completed" ? "bg-emerald-400" : "bg-teal-400"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{f.type}</p>
                    <p className={`text-xs mt-0.5 ${f.status === "Overdue" ? "text-rose-400" : "text-slate-500"}`}>
                      Due: {shortDate(f.due)}
                    </p>
                  </div>
                  <Badge value={f.status} />
                </div>
              ))}
              {!data?.upcomingFollowUps?.length && (
                <p className="px-5 py-10 text-center text-slate-600 text-sm">No pending follow-ups</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Pipeline by Stage */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <h2 className="font-semibold text-white text-sm">Pipeline by Stage</h2>
          <Link href="/pipeline" className="text-teal-400 hover:text-teal-300 text-xs font-medium transition">
            Full pipeline →
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-10" />)}
          </div>
        ) : (
          <div className="p-4 sm:p-5 space-y-3">
            {(data?.stageBreakdown ?? []).filter((r) => r.count > 0).map((row) => (
              <div key={row.stage} className="flex items-center gap-2 sm:gap-4">
                <p className="text-slate-400 text-xs sm:text-sm w-24 sm:w-32 shrink-0 truncate">{row.stage}</p>
                <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all"
                    style={{ width: `${Math.max((row.value / maxStageValue) * 100, 2)}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 sm:gap-3 shrink-0 text-right">
                  <span className="text-slate-500 text-xs hidden sm:inline">{row.count} lead{row.count !== 1 ? "s" : ""}</span>
                  <span className="text-slate-500 text-xs sm:hidden">{row.count}</span>
                  <span className="font-semibold text-teal-400 text-xs sm:text-sm">{money(row.value)}</span>
                </div>
              </div>
            ))}
            {!data?.stageBreakdown?.filter((r) => r.count > 0).length && (
              <p className="text-center text-slate-600 text-sm py-6">No pipeline data yet</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
