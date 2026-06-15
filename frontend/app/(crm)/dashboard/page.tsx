"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { EmptyState, PageHeader, Section, Skeleton, StatCard, buttonPrimary, buttonSecondary, pageWrap } from "@/components/CrmDesign";
import type { DashboardSummary, FollowUp, Lead } from "@/lib/types";

type DashData = {
  summary: DashboardSummary;
  leads: Lead[];
  priorityLeads: Lead[];
  upcomingFollowUps: FollowUp[];
  stageBreakdown: { stage: string; count: number; value: number }[];
  sourceBreakdown: { source: string; count: number }[];
};

function TaskRow({ followUp, lead }: { followUp: FollowUp; lead?: Lead }) {
  const overdue = followUp.status === "Overdue";
  return (
    <div className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60">
      <div className={`h-2.5 w-2.5 rounded-full ${overdue ? "bg-red-500" : "bg-blue-600"}`} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{lead?.name || `Lead #${followUp.leadId}`}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{followUp.type} - {followUp.outcome || "No outcome logged"}</p>
      </div>
      <div className="text-right">
        <Badge value={followUp.status} />
        <p className={`mt-1 text-xs font-medium ${overdue ? "text-red-600 dark:text-red-300" : "text-slate-500 dark:text-slate-400"}`}>{shortDate(followUp.due)}</p>
      </div>
    </div>
  );
}

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
  const allLeads = data?.leads ?? [];
  const hotLeads = data?.priorityLeads?.length ? data.priorityLeads : allLeads.filter((lead) => lead.priority === "Hot").slice(0, 6);
  const todayVisits = s?.visitsToday ?? 0;
  const overdue = s?.overdue ?? 0;
  const maxStageValue = Math.max(...(data?.stageBreakdown?.map((row) => row.value) ?? [1]), 1);
  const today = new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Executive dashboard"
        title="Sales command center"
        subtitle={`${today} - prioritize the next best action across leads, visits, quotes, and revenue.`}
        action={
          <>
            <Link href="/follow-ups" className={buttonSecondary}>Review Tasks</Link>
            <Link href="/leads" className={buttonPrimary}>+ Add Lead</Link>
          </>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-7">
          <StatCard href="/follow-ups" label="Today's Tasks" value={(s?.pending ?? 0) + todayVisits} sub="Calls, visits, quote work" tone="blue" />
          <StatCard href="/follow-ups" label="Overdue Follow-ups" value={overdue} sub={overdue ? "Needs immediate action" : "All clear"} tone={overdue ? "red" : "green"} />
          <StatCard href="/leads" label="Hot Leads" value={hotLeads.length} sub="High-intent prospects" tone="amber" />
          <StatCard href="/site-visits" label="Upcoming Site Visits" value={todayVisits} sub="Scheduled today" tone="slate" />
          <StatCard href="/pipeline" label="Pipeline Value" value={s ? money(s.pipelineValue) : money(0)} sub="Active opportunity value" tone="blue" />
          <StatCard href="/reports" label="Conversion Rate" value={`${s?.conversion ?? 0}%`} sub="Lead to won" tone="green" />
          <StatCard href="/reports" label="Revenue Won" value={s ? money(s.wonValue) : money(0)} sub="Closed business" tone="green" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-8">
          <StatCard href="/leads" label="Total Leads" value={s?.totalLeads ?? 0} sub="All enquiries" tone="slate" />
          <StatCard href="/pipeline" label="Positive Leads" value={s?.positiveLeads ?? 0} sub="Pipeline eligible" tone="green" />
          <StatCard href="/negative-leads" label="Negative Leads" value={s?.negativeLeads ?? 0} sub="Not progressing" tone="red" />
          <StatCard href="/leads" label="Hot Leads" value={s?.hotLeads ?? 0} sub="Temperature" tone="amber" />
          <StatCard href="/leads" label="Warm Leads" value={s?.warmLeads ?? 0} sub="Temperature" tone="blue" />
          <StatCard href="/leads" label="Cold Leads" value={s?.coldLeads ?? 0} sub="Temperature" tone="slate" />
          <StatCard href="/follow-up-pending" label="Awaiting Update" value={s?.awaitingUpdate ?? 0} sub="Follow-up pending" tone="blue" />
          <StatCard href="/reports" label="Converted Leads" value={s?.convertedLeads ?? 0} sub="Won or converted" tone="green" />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <Section
          title="Priority work queue"
          subtitle="Overdue and upcoming follow-ups, ordered for the next conversation."
          action={<Link href="/follow-ups" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">Open follow-ups</Link>}
          className="xl:col-span-5"
        >
          {loading ? (
            <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : data?.upcomingFollowUps?.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {data.upcomingFollowUps.slice(0, 7).map((f) => (
                <TaskRow key={f.id} followUp={f} lead={allLeads.find((lead) => lead.id === f.leadId)} />
              ))}
            </div>
          ) : (
            <EmptyState title="No pending follow-ups" subtitle="Your team has a clean queue." />
          )}
        </Section>

        <Section
          title="Hot leads"
          subtitle="High conversion opportunities with quick contact actions."
          action={<Link href="/leads" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">View leads</Link>}
          className="xl:col-span-4"
        >
          {loading ? (
            <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : hotLeads.length ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {hotLeads.slice(0, 6).map((lead) => (
                <div key={lead.id} className="flex items-center gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/60">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{lead.project} - {lead.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <a href={`tel:${lead.phone}`} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Call</a>
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">WA</a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No hot leads yet" subtitle="Mark strong opportunities as Hot to surface them here." />
          )}
        </Section>

        <Section title="Conversion health" subtitle="Stage value and movement signals." className="xl:col-span-3">
          {loading ? (
            <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10" />)}</div>
          ) : (
            <div className="space-y-4 p-5">
              {(data?.stageBreakdown ?? []).filter((row) => row.count > 0).slice(0, 7).map((row) => (
                <div key={row.stage}>
                  <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">{row.stage}</span>
                    <span className="text-slate-500 dark:text-slate-400">{row.count} - {money(row.value)}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div className="h-full rounded-full bg-blue-600" style={{ width: `${Math.max((row.value / maxStageValue) * 100, 4)}%` }} />
                  </div>
                </div>
              ))}
              {!data?.stageBreakdown?.some((row) => row.count > 0) && <EmptyState title="No pipeline data" />}
            </div>
          )}
        </Section>
      </div>
    </div>
  );
}
