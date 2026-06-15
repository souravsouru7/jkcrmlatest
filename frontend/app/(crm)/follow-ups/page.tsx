"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { FOLLOW_UP_TYPES, shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { notifyFollowUpDue } from "@/lib/notifications";
import { EmptyState, PageHeader, Section, Skeleton, buttonPrimary, buttonSecondary, inputCls, labelCls, pageWrap, selectCls } from "@/components/CrmDesign";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";
import type { FollowUp, Lead } from "@/lib/types";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [reschedule, setReschedule] = useState<FollowUp | null>(null);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.followUps().then((r) => setFollowUps((r as { followUps: FollowUp[] }).followUps)).catch(() => {}),
      api.leads().then((r) => setLeads((r as { leads: Lead[] }).leads)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  function lead(id: number) {
    return leads.find((item) => item.id === id);
  }

  async function handleComplete(id: number) {
    await api.completeFollowUp(id).catch(() => {});
    setFollowUps((prev) => prev.map((f) => f.id === id ? { ...f, status: "Completed" } : f));
  }

  async function handleDeleteLead(id: number) {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((item) => item.id !== id));
      setFollowUps((prev) => prev.filter((item) => item.leadId !== id));
      setActiveLead(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete lead");
    }
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const f = await api.createFollowUp(body as Record<string, unknown>);
      setFollowUps((prev) => [f as FollowUp, ...prev]);
      const name = leads.find((l) => String(l.id) === String(body.leadId))?.name ?? "Lead";
      await notifyFollowUpDue(name, String(body.type));
    } catch {
    } finally {
      setShowForm(false);
    }
  }

  function handleReschedule(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!reschedule) return;
    const fd = new FormData(e.currentTarget);
    const due = String(fd.get("due"));
    setFollowUps((prev) => prev.map((f) => f.id === reschedule.id ? { ...f, due, status: "Pending" } : f));
    setReschedule(null);
  }

  const grouped = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const dayAfter = new Date(today);
    dayAfter.setDate(today.getDate() + 2);

    return {
      overdue: followUps.filter((f) => f.status === "Overdue"),
      today: followUps.filter((f) => {
        const due = new Date(f.due);
        due.setHours(0, 0, 0, 0);
        return f.status !== "Completed" && due.getTime() === today.getTime();
      }),
      tomorrow: followUps.filter((f) => {
        const due = new Date(f.due);
        due.setHours(0, 0, 0, 0);
        return f.status !== "Completed" && due.getTime() === tomorrow.getTime();
      }),
      upcoming: followUps.filter((f) => {
        const due = new Date(f.due);
        due.setHours(0, 0, 0, 0);
        return f.status !== "Completed" && due.getTime() >= dayAfter.getTime();
      }),
    };
  }, [followUps]);

  const pending = followUps.filter((f) => f.status !== "Completed").length;

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Task inbox"
        title="Follow-ups"
        subtitle={`${pending} open tasks - ${grouped.overdue.length} overdue`}
        action={<button onClick={() => setShowForm(true)} className={buttonPrimary}>Add Follow-up</button>}
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <FollowSection title="Overdue" tone="red" items={grouped.overdue} loading={loading} lead={lead} onOpenLead={setActiveLead} onComplete={handleComplete} onReschedule={setReschedule} />
        <FollowSection title="Today" tone="blue" items={grouped.today} loading={loading} lead={lead} onOpenLead={setActiveLead} onComplete={handleComplete} onReschedule={setReschedule} />
        <FollowSection title="Tomorrow" tone="amber" items={grouped.tomorrow} loading={loading} lead={lead} onOpenLead={setActiveLead} onComplete={handleComplete} onReschedule={setReschedule} />
        <FollowSection title="Upcoming" tone="slate" items={grouped.upcoming} loading={loading} lead={lead} onOpenLead={setActiveLead} onComplete={handleComplete} onReschedule={setReschedule} />
      </div>

      {showForm && (
        <Modal title="Add Follow-up" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Lead *"><select name="leadId" required className={selectCls}><option value="">Select lead</option>{leads.filter((l) => !["Won", "Lost"].includes(l.stage)).map((l) => <option key={l.id} value={l.id}>{l.name} - {l.project}</option>)}</select></Field>
            <Field label="Type"><select name="type" className={selectCls}>{FOLLOW_UP_TYPES.map((type) => <option key={type}>{type}</option>)}</select></Field>
            <Field label="Due Date *"><input name="due" type="date" required className={inputCls} /></Field>
            <Field label="Goal / Outcome"><input name="outcome" className={inputCls} placeholder="What should happen?" /></Field>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setShowForm(false)} className={buttonSecondary}>Cancel</button>
              <button type="submit" className={buttonPrimary}>Save Follow-up</button>
            </div>
          </form>
        </Modal>
      )}

      {reschedule && (
        <Modal title="Reschedule follow-up" onClose={() => setReschedule(null)}>
          <form onSubmit={handleReschedule} className="space-y-4">
            <p className="text-sm text-slate-600 dark:text-slate-300">Move {lead(reschedule.leadId)?.name || `Lead #${reschedule.leadId}`} to a new due date.</p>
            <Field label="New due date"><input name="due" type="date" required defaultValue={reschedule.due.slice(0, 10)} className={inputCls} /></Field>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setReschedule(null)} className={buttonSecondary}>Cancel</button>
              <button type="submit" className={buttonPrimary}>Reschedule</button>
            </div>
          </form>
        </Modal>
      )}

      {activeLead && (
        <LeadDetailDrawer
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onLog={() => {
            setShowForm(true);
            setActiveLead(null);
          }}
          onDelete={() => handleDeleteLead(activeLead.id)}
        />
      )}
    </div>
  );
}

function FollowSection({ title, tone, items, loading, lead, onOpenLead, onComplete, onReschedule }: {
  title: string;
  tone: "red" | "blue" | "amber" | "slate";
  items: FollowUp[];
  loading: boolean;
  lead: (id: number) => Lead | undefined;
  onOpenLead: (lead: Lead) => void;
  onComplete: (id: number) => void;
  onReschedule: (item: FollowUp) => void;
}) {
  const toneCls = {
    red: "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300",
    blue: "bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300",
    amber: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300",
    slate: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  }[tone];

  return (
    <Section title={title} subtitle={`${items.length} item${items.length === 1 ? "" : "s"}`} action={<span className={`rounded-full px-3 py-1 text-xs font-bold ${toneCls}`}>{items.length}</span>}>
      {loading ? (
        <div className="space-y-3 p-5">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : items.length === 0 ? (
        <EmptyState title={`No ${title.toLowerCase()} follow-ups`} />
      ) : (
        <div className="space-y-3 p-4">
          {items.map((f) => {
            const client = lead(f.leadId);
            return (
              <article
                key={f.id}
                onClick={() => client && onOpenLead(client)}
                className={`rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 ${client ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-md" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{client?.name || `Lead #${f.leadId}`}</p>
                    <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">{f.type} - {f.outcome || "No outcome added"}</p>
                  </div>
                  <Badge value={f.status} />
                </div>
                {f.notes && <p className="mt-3 rounded-lg bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">{f.notes}</p>}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Due {shortDate(f.due)}</span>
                  <div className="flex w-full flex-wrap gap-2 sm:w-auto" onClick={(event) => event.stopPropagation()}>
                    {client && <button onClick={() => onOpenLead(client)} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Details</button>}
                    {client && <a href={`tel:${client.phone}`} className="shrink-0 rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Call</a>}
                    <button onClick={() => onComplete(f.id)} className="shrink-0 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Complete</button>
                    <button onClick={() => onReschedule(f)} className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Reschedule</button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label>{<span className={labelCls}>{label}</span>}{children}</label>;
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="min-w-0 break-words text-base font-bold text-slate-950 sm:text-lg dark:text-white">{title}</h2>
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
