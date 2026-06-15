"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import type { DashboardSummary } from "@/lib/types";

type DashData = {
  summary: DashboardSummary;
  stageBreakdown: { stage: string; count: number; value: number }[];
  sourceBreakdown: { source: string; count: number }[];
  qualityBreakdown: { quality: string; count: number }[];
  qualityTypeBreakdown: { qualityType: string; count: number }[];
  temperatureBreakdown: { temperature: string; count: number }[];
  salesExecutiveBreakdown: { salesExecutive: string; count: number }[];
};

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-slate-800 rounded-lg animate-pulse ${className}`} />;
}

export default function ReportsPage() {
  const [data, setData] = useState<DashData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.dashboard()
      .then((d) => setData(d as DashData))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const s = data?.summary;
  const maxStageCount = Math.max(...(data?.stageBreakdown?.map((r) => r.count) ?? [1]), 1);
  const maxSourceCount = Math.max(...(data?.sourceBreakdown?.map((r) => r.count) ?? [1]), 1);
  const maxStageValue = Math.max(...(data?.stageBreakdown?.map((r) => r.value) ?? [1]), 1);

  const kpis = [
    { label: "Total Leads", value: String(s?.totalLeads ?? 0), sub: "All time", color: "text-white" },
    { label: "Positive Leads", value: String(s?.positiveLeads ?? 0), sub: "Pipeline eligible", color: "text-emerald-400" },
    { label: "Negative Leads", value: String(s?.negativeLeads ?? 0), sub: "Disqualified", color: "text-red-400" },
    { label: "Converted Leads", value: String(s?.convertedLeads ?? 0), sub: "Won or converted", color: "text-teal-400" },
    { label: "Pipeline Value", value: s ? money(s.pipelineValue) : "₹0", sub: "Active deals", color: "text-white" },
    { label: "Won Revenue", value: s ? money(s.wonValue) : "₹0", sub: "Closed won", color: "text-emerald-400" },
    { label: "Conversion Rate", value: s ? `${s.conversion}%` : "0%", sub: "Win rate", color: "text-teal-400" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] space-y-5 p-3 sm:space-y-6 sm:p-6">
      {/* Page header */}
      <div>
        <h1 className="break-words text-2xl font-bold text-white">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Sales performance &amp; pipeline analytics</p>
      </div>

      {/* KPI cards */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4">
          {kpis.map(({ label, value, sub, color }) => (
            <div key={label} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <p className="text-slate-500 text-xs font-medium mb-2">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              <p className="text-slate-600 text-xs mt-1">{sub}</p>
            </div>
          ))}
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <BreakdownCard title="Leads by Quality" subtitle="Current qualification outcome" rows={(data?.qualityBreakdown ?? []).map((row) => ({ label: row.quality, count: row.count }))} loading={loading} />
        <BreakdownCard title="Leads by Temperature" subtitle="Hot, Warm, and Cold classification" rows={(data?.temperatureBreakdown ?? []).map((row) => ({ label: row.temperature, count: row.count }))} loading={loading} />
        <BreakdownCard title="Leads by Quality Type" subtitle="Detailed Google Sheet-style reason" rows={(data?.qualityTypeBreakdown ?? []).map((row) => ({ label: row.qualityType, count: row.count }))} loading={loading} />
        <BreakdownCard title="Sales Executive Report" subtitle="Lead ownership distribution" rows={(data?.salesExecutiveBreakdown ?? []).map((row) => ({ label: row.salesExecutive, count: row.count }))} loading={loading} />

        {/* Pipeline by Stage */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white text-sm">Pipeline by Stage</h2>
            <p className="text-slate-500 text-xs mt-0.5">Lead count and value per stage</p>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-8" />)
            ) : (
              (data?.stageBreakdown ?? []).map((row) => (
                <div key={row.stage}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-400 text-sm">{row.stage}</span>
                    <div className="flex shrink-0 items-center gap-3 text-right sm:gap-4">
                      <span className="text-slate-500 text-xs">{row.count} lead{row.count !== 1 ? "s" : ""}</span>
                      <span className="w-20 text-right text-xs font-semibold text-teal-400 sm:w-24">{money(row.value)}</span>
                    </div>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-teal-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max((row.count / maxStageCount) * 100, row.count > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
            {!loading && !data?.stageBreakdown?.length && (
              <p className="text-slate-600 text-sm text-center py-6">No data yet</p>
            )}
          </div>
        </div>

        {/* Leads by Source */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white text-sm">Leads by Source</h2>
            <p className="text-slate-500 text-xs mt-0.5">Where your leads are coming from</p>
          </div>
          <div className="p-5 space-y-4">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)
            ) : (
              (data?.sourceBreakdown ?? []).map((row) => (
                <div key={row.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-slate-400 text-sm">{row.source}</span>
                    <span className="text-slate-500 text-xs">{row.count} lead{row.count !== 1 ? "s" : ""}</span>
                  </div>
                  <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max((row.count / maxSourceCount) * 100, row.count > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
            {!loading && !data?.sourceBreakdown?.length && (
              <p className="text-slate-600 text-sm text-center py-6">No data yet</p>
            )}
          </div>
        </div>

        {/* Stage Value breakdown */}
        <div className="xl:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800">
            <h2 className="font-semibold text-white text-sm">Revenue by Stage</h2>
            <p className="text-slate-500 text-xs mt-0.5">Budget value distribution across pipeline stages</p>
          </div>
          <div className="p-5 space-y-3">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)
            ) : (
              (data?.stageBreakdown ?? []).filter((r) => r.value > 0).map((row) => (
                <div key={row.stage} className="flex items-center gap-3 sm:gap-4">
                  <p className="w-24 shrink-0 truncate text-sm text-slate-400 sm:w-32">{row.stage}</p>
                  <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-teal-600 to-teal-400 rounded-full transition-all duration-700"
                      style={{ width: `${Math.max((row.value / maxStageValue) * 100, 1)}%` }}
                    />
                  </div>
                  <span className="w-20 shrink-0 text-right text-sm font-semibold text-teal-400 sm:w-28">{money(row.value)}</span>
                </div>
              ))
            )}
            {!loading && !data?.stageBreakdown?.filter((r) => r.value > 0).length && (
              <p className="text-slate-600 text-sm text-center py-6">No revenue data yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function BreakdownCard({ title, subtitle, rows, loading }: {
  title: string;
  subtitle: string;
  rows: { label: string; count: number }[];
  loading: boolean;
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-800">
        <h2 className="font-semibold text-white text-sm">{title}</h2>
        <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>
      </div>
      <div className="p-5 space-y-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-8" />)
        ) : rows.length ? (
          rows.map((row) => (
            <div key={row.label}>
              <div className="mb-1.5 flex items-center justify-between gap-3">
                <span className="min-w-0 truncate text-sm text-slate-400">{row.label}</span>
                <span className="text-slate-500 text-xs">{row.count} lead{row.count !== 1 ? "s" : ""}</span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max((row.count / max) * 100, row.count > 0 ? 2 : 0)}%` }}
                />
              </div>
            </div>
          ))
        ) : (
          <p className="text-slate-600 text-sm text-center py-6">No data yet</p>
        )}
      </div>
    </div>
  );
}
