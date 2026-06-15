"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { EmptyState, Section, Skeleton, StatCard, buttonPrimary, buttonSecondary, pageWrap } from "@/components/CrmDesign";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";
import type { DashboardSummary, FollowUp, Lead } from "@/lib/types";

type DashData = {
  summary: DashboardSummary;
  leads: Lead[];
  priorityLeads: Lead[];
  upcomingFollowUps: FollowUp[];
  stageBreakdown: { stage: string; count: number; value: number }[];
  sourceBreakdown: { source: string; count: number }[];
};

function TaskRow({ followUp, lead, onOpenLead }: { followUp: FollowUp; lead?: Lead; onOpenLead: (lead: Lead) => void }) {
  const overdue = followUp.status === "Overdue";
  return (
    <div
      onClick={() => lead && onOpenLead(lead)}
      className={`flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${lead ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""}`}
    >
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
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
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

  async function handleDeleteLead(id: number) {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    try {
      await api.deleteLead(id);
      setData((prev) => prev ? {
        ...prev,
        leads: prev.leads.filter((lead) => lead.id !== id),
        priorityLeads: prev.priorityLeads.filter((lead) => lead.id !== id),
        upcomingFollowUps: prev.upcomingFollowUps.filter((followUp) => followUp.leadId !== id),
      } : prev);
      setActiveLead(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete lead");
    }
  }

  return (
    <div className={pageWrap}>
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">{today}</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl dark:text-white">Sales Command Center</h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Start with the next call, follow-up, visit, or quote.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Link href="/follow-ups" className={buttonSecondary}>Tasks</Link>
            <Link href="/leads" className={buttonPrimary}>Add Lead</Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          <TodayChip label="Open" value={(s?.pending ?? 0) + todayVisits} />
          <TodayChip label="Overdue" value={overdue} tone={overdue ? "red" : "green"} />
          <TodayChip label="Visits" value={todayVisits} />
        </div>
      </section>

      {loading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-36" />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard href="/leads" label="New Leads" value={s?.totalLeads ?? 0} sub="All enquiries" tone="blue" />
          <StatCard href="/pipeline" label="Positive Leads" value={s?.positiveLeads ?? 0} sub="Pipeline ready" tone="green" />
          <StatCard href="/follow-ups" label="Pending Follow-ups" value={s?.pending ?? 0} sub="Calls and reminders" tone="amber" />
          <StatCard href="/site-visits" label="Today's Site Visits" value={todayVisits} sub="Field schedule" tone="slate" />
          <StatCard href="/quotations" label="Quotes Pending" value={data?.stageBreakdown?.find((row) => row.stage === "Quotation")?.count ?? 0} sub="Quote follow-up" tone="blue" />
          <StatCard href="/reports" label="Won This Month" value={s ? money(s.wonValue) : money(0)} sub="Closed revenue" tone="green" />
        </div>
      )}

      {!loading && (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
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
          title="Work queue"
          subtitle="Calls and follow-ups due next."
          action={<Link href="/follow-ups" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">Open follow-ups</Link>}
          className="xl:col-span-5"
        >
          {loading ? (
            <div className="space-y-3 p-4">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : data?.upcomingFollowUps?.length ? (
            <div className="space-y-3 p-4">
              {data.upcomingFollowUps.slice(0, 7).map((f) => (
                <TaskRow key={f.id} followUp={f} lead={allLeads.find((lead) => lead.id === f.leadId)} onOpenLead={setActiveLead} />
              ))}
            </div>
          ) : (
            <EmptyState title="No pending follow-ups" subtitle="Your team has a clean queue." />
          )}
        </Section>

        <Section
          title="Hot leads"
          subtitle="Quick contact for high-intent leads."
          action={<Link href="/leads" className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">View leads</Link>}
          className="xl:col-span-4"
        >
          {loading ? (
            <div className="space-y-3 p-5">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : hotLeads.length ? (
            <div className="space-y-3 p-4">
              {hotLeads.slice(0, 6).map((lead) => (
                <div key={lead.id} onClick={() => setActiveLead(lead)} className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-xs font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{lead.project} - {lead.location}</p>
                  </div>
                  <div className="flex gap-2" onClick={(event) => event.stopPropagation()}>
                    <button onClick={() => setActiveLead(lead)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Details</button>
                    <a href={`tel:${lead.phone}`} className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Call</a>
                    <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">WA</a>
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

      {activeLead && (
        <LeadDetailDrawer
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onLog={() => {
            setActiveLead(null);
            window.location.href = "/follow-ups";
          }}
          onDelete={() => handleDeleteLead(activeLead.id)}
        />
      )}
    </div>
  );
}

function TodayChip({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "red" | "green" }) {
  const toneCls = {
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    red: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  }[tone];

  return (
    <div className={`rounded-lg px-3 py-3 ${toneCls}`}>
      <p className="text-xl font-black leading-none">{value}</p>
      <p className="mt-1 truncate text-[11px] font-bold uppercase tracking-wide">{label}</p>
    </div>
  );
}
