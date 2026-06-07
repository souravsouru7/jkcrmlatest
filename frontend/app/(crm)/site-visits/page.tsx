"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { ScopeSheetModal } from "@/components/ScopeSheetModal";
import { notifySiteVisitReminder } from "@/lib/notifications";
import { EmptyState, PageHeader, Section, Skeleton, buttonPrimary, buttonSecondary, inputCls, labelCls, pageWrap, selectCls } from "@/components/CrmDesign";
import type { Lead, ScopeSheet, SiteVisit } from "@/lib/types";

const FILTERS = ["all", "scheduled", "completed", "rescheduled", "cancelled"] as const;
type Filter = typeof FILTERS[number];

export default function SiteVisitsPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [scopeVisit, setScopeVisit] = useState<SiteVisit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.siteVisits().then((r) => setVisits((r as { visits: SiteVisit[] }).visits)).catch(() => {}),
      api.leads().then((r) => setLeads((r as { leads: Lead[] }).leads)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  function lead(id: number) {
    return leads.find((item) => item.id === id);
  }

  async function handleStatus(id: number, status: string) {
    await api.updateSiteVisit(id, { status }).catch(() => {});
    setVisits((prev) => prev.map((visit) => visit.id === id ? { ...visit, status: status as SiteVisit["status"] } : visit));
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const visit = await api.createSiteVisit(body as Record<string, unknown>);
      setVisits((prev) => [visit as SiteVisit, ...prev]);
      const name = leads.find((item) => String(item.id) === String(body.leadId))?.name ?? "Client";
      await notifySiteVisitReminder(name, String(body.address));
    } catch {
    } finally {
      setShowForm(false);
    }
  }

  function handleScopeSheetSaved(visitId: number, sheet: ScopeSheet) {
    setVisits((prev) => prev.map((visit) => visit.id === visitId ? { ...visit, scopeSheet: sheet } : visit));
  }

  const visible = filter === "all" ? visits : visits.filter((visit) => visit.status.toLowerCase().replace(" ", "-") === filter || visit.status.toLowerCase() === filter);
  const scheduled = visits.filter((visit) => visit.status === "Scheduled");
  const completed = visits.filter((visit) => visit.status === "Completed");
  const today = new Date().toISOString().slice(0, 10);
  const todayVisits = scheduled.filter((visit) => visit.date?.slice(0, 10) === today);

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Site visit calendar"
        title="Site Visits"
        subtitle={`${scheduled.length} scheduled - ${todayVisits.length} today - ${completed.length} completed`}
        action={<button onClick={() => setShowForm(true)} className={buttonPrimary}>+ Schedule Visit</button>}
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[380px_1fr]">
        <Section title="Weekly visit planner" subtitle="Calendar-first overview for managers.">
          <div className="grid grid-cols-7 gap-2 p-4">
            {Array.from({ length: 7 }).map((_, index) => {
              const day = new Date();
              day.setDate(day.getDate() + index);
              const key = day.toISOString().slice(0, 10);
              const count = scheduled.filter((visit) => visit.date?.slice(0, 10) === key).length;
              return (
                <div key={key} className={`rounded-2xl border p-3 text-center ${index === 0 ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10" : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"}`}>
                  <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">{day.toLocaleDateString("en-IN", { weekday: "short" })}</p>
                  <p className="mt-1 text-lg font-bold text-slate-950 dark:text-white">{day.getDate()}</p>
                  <p className="mt-1 text-xs font-semibold text-blue-600 dark:text-blue-400">{count} visit{count === 1 ? "" : "s"}</p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Daily visits" subtitle="One tap to start, complete, reschedule, or open scope sheet.">
          <div className="flex gap-2 overflow-x-auto border-b border-slate-100 p-4 dark:border-slate-800">
            {FILTERS.map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-semibold capitalize ${filter === item ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
                {item}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>
          ) : visible.length === 0 ? (
            <EmptyState title="No site visits found" />
          ) : (
            <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2">
              {visible.map((visit) => {
                const client = lead(visit.leadId);
                return (
                  <article key={visit.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{client ? `${client.name} - ${client.project}` : `Lead #${visit.leadId}`}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{shortDate(visit.date)} - {visit.assignedTo}</p>
                      </div>
                      <Badge value={visit.status} />
                    </div>
                    <div className="mt-4 rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Map Location</p>
                      <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{visit.address}</p>
                    </div>
                    {visit.notes && <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">{visit.notes}</p>}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(visit.address)}`} target="_blank" rel="noreferrer" className={buttonSecondary}>Open Map</a>
                      <button onClick={() => setScopeVisit(visit)} className={buttonSecondary}>{visit.scopeSheet ? "View Scope" : "Fill Scope"}</button>
                      {visit.status === "Scheduled" && (
                        <>
                          <button onClick={() => handleStatus(visit.id, "Completed")} className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">Start / Complete</button>
                          <button onClick={() => handleStatus(visit.id, "Rescheduled")} className="rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-amber-600">Reschedule</button>
                        </>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      {showForm && (
        <Modal title="Schedule Site Visit" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Lead *"><select name="leadId" required className={selectCls}><option value="">Select lead</option>{leads.filter((l) => !["Won", "Lost"].includes(l.stage)).map((l) => <option key={l.id} value={l.id}>{l.name} - {l.project}</option>)}</select></Field>
            <Field label="Visit Date *"><input name="date" type="date" required className={inputCls} /></Field>
            <Field label="Property Address *"><input name="address" required placeholder="Full address with pincode" className={inputCls} /></Field>
            <Field label="Notes"><textarea name="notes" rows={3} placeholder="What to bring, scope, special instructions..." className={inputCls} /></Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className={buttonSecondary}>Cancel</button>
              <button type="submit" className={buttonPrimary}>Schedule Visit</button>
            </div>
          </form>
        </Modal>
      )}

      {scopeVisit && (
        <ScopeSheetModal
          visit={scopeVisit}
          onClose={() => setScopeVisit(null)}
          onSaved={(sheet) => {
            handleScopeSheetSaved(scopeVisit.id, sheet);
            setScopeVisit(null);
          }}
        />
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label>{<span className={labelCls}>{label}</span>}{children}</label>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
