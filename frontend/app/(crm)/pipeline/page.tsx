"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money, shortDate, STAGES, FOLLOW_UP_TYPES } from "@/lib/utils";
import Badge from "@/components/Badge";
import { EmptyState, PageHeader, Skeleton, buttonGhost, buttonPrimary, buttonSecondary, inputCls, labelCls, pageWrap, selectCls } from "@/components/CrmDesign";
import LeadDetailDrawer from "@/components/LeadDetailDrawer";
import UpdateLeadModal from "@/components/UpdateLeadModal";
import type { Lead, Stage } from "@/lib/types";

const PIPELINE_STAGES: Stage[] = ["New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation", "Won"];

const STAGE_TONE: Record<string, string> = {
  "New Lead": "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300",
  Contacted: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300",
  Qualified: "border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-500/20 dark:bg-violet-500/10 dark:text-violet-300",
  "Site Visit": "border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-300",
  Quotation: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300",
  Negotiation: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300",
  Won: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-300",
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [draggingId, setDraggingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [loggingLead, setLoggingLead] = useState<Lead | null>(null);
  const [updatingLead, setUpdatingLead] = useState<Lead | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.leads()
      .then((r) => setLeads((r as { leads: Lead[] }).leads))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function moveLead(id: number, stage: Stage) {
    await api.updateStage(id, stage).catch(() => {});
    setLeads((prev) => prev.map((lead) => lead.id === id ? { ...lead, stage } : lead));
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this lead? This action cannot be undone.")) return;
    try {
      await api.deleteLead(id);
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      setActiveLead(null);
    } catch (err: any) {
      alert(err.message || "Failed to delete lead");
    }
  }

  async function handleLogInteraction(e: React.FormEvent<HTMLFormElement>) {
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

  const isPositive = (lead: Lead) => (lead.quality || lead.Quality || "") === "Positive";
  const pipelineStage = (lead: Lead): Stage => isPositive(lead) && lead.stage === "New Lead" ? "Contacted" : lead.stage;
  const activeLeads = leads.filter((lead) => isPositive(lead) && PIPELINE_STAGES.includes(pipelineStage(lead)));
  const totalValue = activeLeads.reduce((sum, lead) => sum + (lead.budget || 0), 0);
  const wonValue = leads.filter((lead) => lead.stage === "Won").reduce((sum, lead) => sum + (lead.budget || 0), 0);

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Kanban pipeline"
        title="Pipeline"
        subtitle={`${activeLeads.length} active opportunities - ${money(totalValue)} pipeline - ${money(wonValue)} won`}
        action={<a href="/leads" className={buttonPrimary}>+ Add Lead</a>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Metric label="Average Deal" value={money(activeLeads.length ? totalValue / activeLeads.length : 0)} />
        <Metric label="Won Revenue" value={money(wonValue)} />
        <Metric label="Conversion Signal" value={`${leads.length ? Math.round((leads.filter((l) => l.stage === "Won").length / leads.length) * 100) : 0}%`} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80" />)}</div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="grid min-w-[1120px] grid-cols-7 gap-3 lg:gap-4">
            {PIPELINE_STAGES.map((stage) => {
              const stageLeads = leads.filter((lead) => isPositive(lead) && pipelineStage(lead) === stage);
              const value = stageLeads.reduce((sum, lead) => sum + (lead.budget || 0), 0);
              return (
                <section
                  key={stage}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={() => {
                    if (draggingId) moveLead(draggingId, stage);
                    setDraggingId(null);
                  }}
                  className="min-h-[520px] rounded-lg border border-slate-200 bg-slate-100/70 p-3 dark:border-slate-800 dark:bg-slate-900/60"
                >
                  <div className={`mb-3 rounded-lg border p-3 ${STAGE_TONE[stage]}`}>
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-bold">{stage}</p>
                      <span className="rounded-full bg-white/70 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-950/50 dark:text-slate-200">{stageLeads.length}</span>
                    </div>
                    <p className="mt-1 text-xs font-semibold opacity-80">{money(value)}</p>
                  </div>

                  {stageLeads.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-xs font-semibold text-slate-400 dark:border-slate-700">
                      Drop leads here
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {stageLeads.map((lead) => (
                        <article
                          key={lead.id}
                          draggable
                          onDragStart={() => setDraggingId(lead.id)}
                          onDragEnd={() => setDraggingId(null)}
                          onClick={() => setActiveLead(lead)}
                          className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{lead.name}</p>
                              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{lead.project}</p>
                            </div>
                            <Badge value={lead.priority} className="text-[10px]" />
                          </div>
                          <p className="mt-4 text-lg font-bold tracking-tight text-slate-950 dark:text-white">{money(lead.budget || 0)}</p>
                          <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                            <span className="truncate text-xs text-slate-500 dark:text-slate-400">{lead.location}</span>
                            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">{shortDate(lead.nextFollowUp)}</span>
                          </div>
                          <select value={pipelineStage(lead)} onClick={(e) => e.stopPropagation()} onChange={(e) => moveLead(lead.id, e.target.value as Stage)} className="mt-3 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
                            {STAGES.map((item) => <option key={item}>{item}</option>)}
                          </select>
                          <button onClick={(e) => { e.stopPropagation(); setUpdatingLead(lead); }} className="mt-2 w-full rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Update Lead</button>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}

      {!loading && activeLeads.length === 0 && <EmptyState title="No active pipeline" subtitle="Create leads or move existing leads into pipeline stages." />}

      {activeLead && (
        <LeadDetailDrawer
          lead={activeLead}
          onClose={() => setActiveLead(null)}
          onLog={() => {
            setLoggingLead(activeLead);
            setActiveLead(null);
          }}
          onDelete={() => handleDelete(activeLead.id)}
        />
      )}

      {loggingLead && (
        <Modal title={`Log activity - ${loggingLead.name || "Lead"}`} onClose={() => setLoggingLead(null)}>
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

      {updatingLead && (
        <UpdateLeadModal
          lead={updatingLead}
          onClose={() => setUpdatingLead(null)}
          onSaved={(updated) => setLeads((prev) => prev.map((lead) => lead.id === updated.id ? updated : lead))}
        />
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

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-2xl font-bold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}
