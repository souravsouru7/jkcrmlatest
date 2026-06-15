"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money } from "@/lib/utils";
import { EmptyState, PageHeader, Section, Skeleton, StatCard, pageWrap } from "@/components/CrmDesign";
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
  const maxStageCount = Math.max(...(data?.stageBreakdown?.map((row) => row.count) ?? [1]), 1);
  const maxStageValue = Math.max(...(data?.stageBreakdown?.map((row) => row.value) ?? [1]), 1);
  const maxSourceCount = Math.max(...(data?.sourceBreakdown?.map((row) => row.count) ?? [1]), 1);

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Executive analytics"
        title="Reports"
        subtitle="Conversion, source performance, sales ownership, and revenue movement."
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, index) => <Skeleton key={index} className="h-32" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
          <StatCard label="Total Leads" value={s?.totalLeads ?? 0} sub="All enquiries" tone="slate" />
          <StatCard label="Positive" value={s?.positiveLeads ?? 0} sub="Pipeline eligible" tone="green" />
          <StatCard label="Negative" value={s?.negativeLeads ?? 0} sub="Disqualified" tone="red" />
          <StatCard label="Converted" value={s?.convertedLeads ?? 0} sub="Won or converted" tone="green" />
          <StatCard label="Pipeline" value={s ? money(s.pipelineValue) : money(0)} sub="Active value" tone="blue" />
          <StatCard label="Won Revenue" value={s ? money(s.wonValue) : money(0)} sub="Closed won" tone="green" />
          <StatCard label="Conversion" value={`${s?.conversion ?? 0}%`} sub="Lead to won" tone="blue" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <BreakdownCard title="Quality" subtitle="Lead qualification outcome" rows={(data?.qualityBreakdown ?? []).map((row) => ({ label: row.quality, count: row.count }))} loading={loading} tone="blue" />
        <BreakdownCard title="Temperature" subtitle="Hot, Warm, and Cold distribution" rows={(data?.temperatureBreakdown ?? []).map((row) => ({ label: row.temperature, count: row.count }))} loading={loading} tone="amber" />
        <BreakdownCard title="Quality Type" subtitle="Reason and status breakdown" rows={(data?.qualityTypeBreakdown ?? []).map((row) => ({ label: row.qualityType, count: row.count }))} loading={loading} tone="slate" />
        <BreakdownCard title="Sales Executive" subtitle="Lead ownership distribution" rows={(data?.salesExecutiveBreakdown ?? []).map((row) => ({ label: row.salesExecutive, count: row.count }))} loading={loading} tone="green" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Section title="Pipeline by stage" subtitle="Lead count and estimated value per stage.">
          <div className="space-y-4 p-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12" />)
            ) : data?.stageBreakdown?.length ? (
              data.stageBreakdown.map((row) => (
                <MetricRow
                  key={row.stage}
                  label={row.stage}
                  meta={`${row.count} lead${row.count === 1 ? "" : "s"} - ${money(row.value)}`}
                  percent={row.count ? (row.count / maxStageCount) * 100 : 0}
                  tone="blue"
                />
              ))
            ) : (
              <EmptyState title="No pipeline data" />
            )}
          </div>
        </Section>

        <Section title="Lead source" subtitle="Where enquiries are coming from.">
          <div className="space-y-4 p-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12" />)
            ) : data?.sourceBreakdown?.length ? (
              data.sourceBreakdown.map((row) => (
                <MetricRow
                  key={row.source}
                  label={row.source}
                  meta={`${row.count} lead${row.count === 1 ? "" : "s"}`}
                  percent={row.count ? (row.count / maxSourceCount) * 100 : 0}
                  tone="green"
                />
              ))
            ) : (
              <EmptyState title="No source data" />
            )}
          </div>
        </Section>

        <Section title="Revenue by stage" subtitle="Budget value distribution across the sales journey." className="xl:col-span-2">
          <div className="space-y-4 p-4">
            {loading ? (
              Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-12" />)
            ) : data?.stageBreakdown?.some((row) => row.value > 0) ? (
              data.stageBreakdown.filter((row) => row.value > 0).map((row) => (
                <MetricRow
                  key={row.stage}
                  label={row.stage}
                  meta={money(row.value)}
                  percent={(row.value / maxStageValue) * 100}
                  tone="amber"
                />
              ))
            ) : (
              <EmptyState title="No revenue data" />
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

function BreakdownCard({ title, subtitle, rows, loading, tone }: {
  title: string;
  subtitle: string;
  rows: { label: string; count: number }[];
  loading: boolean;
  tone: "blue" | "green" | "amber" | "slate";
}) {
  const max = Math.max(...rows.map((row) => row.count), 1);
  return (
    <Section title={title} subtitle={subtitle}>
      <div className="space-y-4 p-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12" />)
        ) : rows.length ? (
          rows.map((row) => (
            <MetricRow
              key={row.label}
              label={row.label || "Unknown"}
              meta={`${row.count} lead${row.count === 1 ? "" : "s"}`}
              percent={row.count ? (row.count / max) * 100 : 0}
              tone={tone}
            />
          ))
        ) : (
          <EmptyState title="No data yet" />
        )}
      </div>
    </Section>
  );
}

function MetricRow({ label, meta, percent, tone }: { label: string; meta: string; percent: number; tone: "blue" | "green" | "amber" | "slate" }) {
  const color = {
    blue: "bg-blue-600",
    green: "bg-emerald-600",
    amber: "bg-amber-500",
    slate: "bg-slate-500",
  }[tone];

  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="min-w-0 truncate text-sm font-semibold text-slate-800 dark:text-slate-100">{label}</span>
        <span className="shrink-0 text-right text-xs font-semibold text-slate-500 dark:text-slate-400">{meta}</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(percent, percent > 0 ? 3 : 0)}%` }} />
      </div>
    </div>
  );
}
