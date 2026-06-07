"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { FOLLOW_UP_TYPES, shortDate, STAGES, SOURCES, money } from "@/lib/utils";
import Badge from "@/components/Badge";
import { EmptyState, PageHeader, Section, Skeleton, buttonGhost, buttonPrimary, buttonSecondary, inputCls, labelCls, pageWrap, selectCls } from "@/components/CrmDesign";
import type { Lead, Stage } from "@/lib/types";

const PRIORITY_DOT: Record<string, string> = {
  Hot: "bg-red-500",
  Warm: "bg-amber-500",
  Cold: "bg-slate-400",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [loggingLead, setLoggingLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const r = await api.leads();
      setLeads((r as { leads: Lead[] }).leads);
    } catch {
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }

  const filtered = leads.filter((lead) => {
    const matchesQuery = [lead.name, lead.phone, lead.email, lead.location, lead.source, lead.project, lead.stage, lead.priority]
      .join(" ")
      .toLowerCase()
      .includes(query.toLowerCase());
    return matchesQuery && (stageFilter === "All" || lead.stage === stageFilter);
  });

  async function handleStage(id: number, stage: string) {
    await api.updateStage(id, stage).catch(() => {});
    setLeads((prev) => prev.map((lead) => lead.id === id ? { ...lead, stage: stage as Stage } : lead));
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const lead = await api.createLead(body as Record<string, unknown>);
      setLeads((prev) => [lead as Lead, ...prev]);
    } catch {
      const newLead: Lead = {
        id: Date.now(),
        name: String(body.name),
        phone: String(body.phone),
        email: String(body.email || ""),
        location: String(body.location),
        source: String(body.source),
        project: String(body.project),
        budget: Number(body.budget),
        stage: (body.stage as Stage) || "New Lead",
        priority: (body.priority as Lead["priority"]) || "Warm",
        owner: "Sales Admin",
        nextFollowUp: String(body.nextFollowUp || ""),
        lastActivity: "Lead created",
        notes: String(body.notes || ""),
        lostReason: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setLeads((prev) => [newLead, ...prev]);
    } finally {
      setSaving(false);
      setShowForm(false);
    }
  }

  async function handleLogInteraction(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!loggingLead) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const due = String(fd.get("due") || new Date().toISOString().slice(0, 10));
    const type = String(fd.get("type") || "Call");
    const outcome = String(fd.get("outcome") || "").trim();
    const notes = String(fd.get("notes") || "").trim();
    try {
      await api.createFollowUp({ leadId: loggingLead.id, type, due, outcome, notes });
      setLeads((prev) => prev.map((lead) => lead.id === loggingLead.id ? { ...lead, nextFollowUp: due, lastActivity: `${type} logged`, updatedAt: new Date().toISOString() } : lead));
    } catch {
      setLeads((prev) => prev.map((lead) => lead.id === loggingLead.id ? { ...lead, nextFollowUp: due } : lead));
    } finally {
      setSaving(false);
      setLoggingLead(null);
    }
  }

  const pipelineValue = filtered.reduce((sum, lead) => sum + (lead.budget || 0), 0);
  const hotCount = leads.filter((lead) => lead.priority === "Hot").length;

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Lead management"
        title="Leads"
        subtitle={`${leads.length} total leads - ${hotCount} hot - ${money(pipelineValue)} visible pipeline`}
        action={<button onClick={() => setShowForm(true)} className={buttonPrimary}>+ Add Lead</button>}
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto]">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <input className={inputCls} placeholder="Search client, city, source, phone, stage..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {["All", ...STAGES].map((stage) => (
            <button key={stage} onClick={() => setStageFilter(stage)} className={`shrink-0 rounded-xl border px-4 py-2.5 text-sm font-semibold ${stageFilter === stage ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
              {stage}
            </button>
          ))}
        </div>
      </div>

      <Section title="Lead workspace" subtitle="Open a client for one-screen history, communication, quotation, and notes.">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No leads found" subtitle="Try another filter or add your first lead." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((lead) => (
              <div key={lead.id} onClick={() => setActiveLead(lead)} className="grid cursor-pointer gap-4 px-5 py-4 hover:bg-slate-50 lg:grid-cols-[minmax(260px,1.4fr)_1fr_220px_220px] lg:items-center dark:hover:bg-slate-800/60">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                    {lead.name.slice(0, 2).toUpperCase()}
                    <span className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${PRIORITY_DOT[lead.priority] ?? "bg-slate-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{lead.name}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{lead.phone} - {lead.location}</p>
                  </div>
                </div>

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{lead.project}</p>
                  <p className="truncate text-xs text-slate-500 dark:text-slate-400">{lead.source} - {lead.owner}</p>
                </div>

                <div className="flex items-center gap-2">
                  <select value={lead.stage} onClick={(e) => e.stopPropagation()} onChange={(e) => handleStage(lead.id, e.target.value)} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-blue-600 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
                    {STAGES.map((stage) => <option key={stage} value={stage}>{stage}</option>)}
                  </select>
                  <Badge value={lead.priority} />
                </div>

                <div className="flex items-center justify-start gap-2 lg:justify-end" onClick={(e) => e.stopPropagation()}>
                  <a href={`tel:${lead.phone}`} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Call</a>
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">WhatsApp</a>
                  <button onClick={() => setLoggingLead(lead)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Log</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {activeLead && (
        <LeadDetailDrawer lead={activeLead} onClose={() => setActiveLead(null)} onLog={() => { setLoggingLead(activeLead); setActiveLead(null); }} />
      )}

      {showForm && (
        <Modal title="Add Sales Lead" onClose={() => setShowForm(false)} max="max-w-2xl">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Client Name *"><input name="name" required className={inputCls} placeholder="Full name" /></Field>
              <Field label="Phone *"><input name="phone" required className={inputCls} placeholder="+91 98765 43210" /></Field>
              <Field label="Email"><input name="email" type="email" className={inputCls} placeholder="client@example.com" /></Field>
              <Field label="Location / City *"><input name="location" required className={inputCls} placeholder="Mumbai, Delhi..." /></Field>
              <Field label="Project Type *"><input name="project" required className={inputCls} placeholder="Residential, commercial..." /></Field>
              <Field label="Expected Budget *"><input name="budget" type="number" min="0" required className={inputCls} placeholder="500000" /></Field>
              <Field label="Next Follow-up *"><input name="nextFollowUp" type="date" required className={inputCls} /></Field>
              <Field label="Source *"><select name="source" required className={selectCls}>{SOURCES.map((source) => <option key={source}>{source}</option>)}</select></Field>
              <Field label="Stage"><select name="stage" className={selectCls}>{STAGES.map((stage) => <option key={stage}>{stage}</option>)}</select></Field>
              <Field label="Priority"><select name="priority" className={selectCls}>{["Hot", "Warm", "Cold"].map((priority) => <option key={priority}>{priority}</option>)}</select></Field>
              <div className="sm:col-span-2"><Field label="Notes"><textarea name="notes" rows={3} className={inputCls} placeholder="Requirements, timeline, decision maker..." /></Field></div>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className={buttonSecondary}>Cancel</button>
              <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? "Creating..." : "Create Lead"}</button>
            </div>
          </form>
        </Modal>
      )}

      {loggingLead && (
        <Modal title={`Log activity - ${loggingLead.name}`} onClose={() => setLoggingLead(null)}>
          <form onSubmit={handleLogInteraction} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Activity"><select name="type" defaultValue="Call" className={selectCls}>{FOLLOW_UP_TYPES.map((type) => <option key={type}>{type}</option>)}</select></Field>
              <Field label="Next Follow-up"><input name="due" type="date" required defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} /></Field>
            </div>
            <Field label="Outcome"><input name="outcome" className={inputCls} placeholder="Connected, asked for quote, no answer..." /></Field>
            <Field label="Notes"><textarea name="notes" rows={3} className={inputCls} placeholder="Conversation details and commitment..." /></Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setLoggingLead(null)} className={buttonSecondary}>Cancel</button>
              <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? "Saving..." : "Save Log"}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label>{<span className={labelCls}>{label}</span>}{children}</label>;
}

function Modal({ title, children, onClose, max = "max-w-xl" }: { title: string; children: React.ReactNode; onClose: () => void; max?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative max-h-[90vh] w-full ${max} overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900`}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
          <button onClick={onClose} className={buttonGhost}>Close</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function LeadDetailDrawer({ lead, onClose, onLog }: { lead: Lead; onClose: () => void; onLog: () => void }) {
  const updates = [lead.initialComments, lead.call1, lead.call2, lead.call3, lead.call4, lead.call5, lead.call6, lead.notes].filter(Boolean);
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Customer profile</p>
              <h2 className="mt-1 truncate text-2xl font-bold text-slate-950 dark:text-white">{lead.name}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lead.project} - {lead.location}</p>
            </div>
            <button onClick={onClose} className={buttonGhost}>Close</button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <a href={`tel:${lead.phone}`} className={buttonPrimary}>Call</a>
            <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700">WhatsApp</a>
            {lead.email && <a href={`mailto:${lead.email}`} className={buttonSecondary}>Email</a>}
            <button onClick={onLog} className={buttonSecondary}>Log Follow-up</button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Mini label="Stage" value={<Badge value={lead.stage} />} />
            <Mini label="Priority" value={<Badge value={lead.priority} />} />
            <Mini label="Budget" value={lead.estimatedBudget || money(lead.budget || 0)} />
            <Mini label="Next Follow-up" value={shortDate(lead.nextFollowUp)} />
          </div>

          <Section title="Timeline activity feed" subtitle="Calls, notes, scope updates, quote events, and follow-up history.">
            {updates.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {updates.map((item, index) => (
                  <div key={index} className="flex gap-3 px-5 py-4">
                    <div className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{index === 0 ? "Initial requirement" : `Activity ${index}`}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState title="No activity yet" subtitle="Log a call or follow-up to build the timeline." />
            )}
          </Section>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Info title="Follow-up History" lines={[lead.lastActivity || "No recent activity", `Next: ${shortDate(lead.nextFollowUp)}`]} />
            <Info title="Site Visit History" lines={[lead.stage === "Site Visit" ? "Site visit stage active" : "No visit linked on this screen", "Schedule from Site Visits"]} />
            <Info title="Scope Sheet" lines={[lead.sheetDate ? `Sheet date: ${lead.sheetDate}` : "Scope sheet available after site visit", lead.quality || "Requirements not scored"]} />
            <Info title="Quotations" lines={[lead.stage === "Quotation" ? "Quotation in progress" : "No quote linked on this screen", "Create quote from Quotations"]} />
          </div>
        </div>
      </aside>
    </div>
  );
}

function Mini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</p>
      <div className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{value}</div>
    </div>
  );
}

function Info({ title, lines }: { title: string; lines: string[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
      <div className="mt-3 space-y-2">
        {lines.map((line) => <p key={line} className="text-sm text-slate-500 dark:text-slate-400">{line}</p>)}
      </div>
    </div>
  );
}
