"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money, shortDate, STAGES, SOURCES } from "@/lib/utils";
import Badge from "@/components/Badge";
import type { Lead, Stage } from "@/lib/types";

const PRIORITY_DOT: Record<string, string> = {
  Hot:  "bg-rose-400",
  Warm: "bg-amber-400",
  Cold: "bg-slate-500",
};

const inputCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition";
const selectCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 transition";
const labelCls = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
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

  const filtered = leads.filter((l) =>
    [l.name, l.phone, l.location, l.source, l.project, l.stage, l.priority]
      .join(" ").toLowerCase().includes(query.toLowerCase())
  );

  async function handleStage(id: number, stage: string) {
    await api.updateStage(id, stage).catch(() => {});
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, stage: stage as Stage } : l));
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
        id: Date.now(), name: String(body.name), phone: String(body.phone), email: "",
        location: String(body.location), source: String(body.source), project: String(body.project),
        budget: Number(body.budget), stage: (body.stage as Stage) || "New Lead",
        priority: (body.priority as Lead["priority"]) || "Warm", owner: "Sales Admin",
        nextFollowUp: String(body.nextFollowUp), lastActivity: "Lead created",
        notes: String(body.notes || ""), lostReason: null,
        createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      };
      setLeads((prev) => [newLead, ...prev]);
    } finally {
      setSaving(false);
      setShowForm(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">{leads.length} total leads</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-lg transition shadow-lg shadow-teal-900/30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">Add Lead</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Search + filters bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 pl-9 pr-4 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition"
            placeholder="Search name, city, stage…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <p className="text-slate-500 text-sm">{filtered.length} results</p>
      </div>

      {/* Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-slate-800">
              <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5">Client</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden md:table-cell">Project</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden lg:table-cell">Source</th>
              <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3.5">Budget</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden xl:table-cell">Follow-up</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5">Stage</th>
              <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden sm:table-cell">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  <td colSpan={7} className="px-5 py-3">
                    <div className="h-8 bg-slate-800 rounded animate-pulse" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-16 text-center text-slate-600 text-sm">
                  {query ? `No leads matching "${query}"` : "No leads yet. Add your first lead."}
                </td>
              </tr>
            ) : (
              filtered.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-800/40 transition-colors">
                  {/* Client */}
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
                        {lead.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-white text-sm truncate">{lead.name}</p>
                        <p className="text-slate-500 text-xs truncate">{lead.phone} · {lead.location}</p>
                      </div>
                    </div>
                  </td>
                  {/* Project */}
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">{lead.project}</span>
                  </td>
                  {/* Source */}
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-slate-500 text-xs bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full">{lead.source}</span>
                  </td>
                  {/* Budget */}
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-semibold text-teal-400 text-sm">{money(lead.budget)}</span>
                  </td>
                  {/* Follow-up */}
                  <td className="px-4 py-3.5 hidden xl:table-cell">
                    <span className="text-slate-500 text-sm">
                      {lead.nextFollowUp ? shortDate(lead.nextFollowUp) : "—"}
                    </span>
                  </td>
                  {/* Stage */}
                  <td className="px-4 py-3.5">
                    <select
                      value={lead.stage}
                      onChange={(e) => handleStage(lead.id, e.target.value)}
                      className="bg-transparent text-xs font-medium outline-none py-1 text-slate-300 hover:text-white transition cursor-pointer"
                    >
                      {STAGES.map((s) => (
                        <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                      ))}
                    </select>
                  </td>
                  {/* Priority */}
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full shrink-0 ${PRIORITY_DOT[lead.priority] ?? "bg-slate-500"}`} />
                      <span className="text-slate-400 text-xs">{lead.priority}</span>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Lead Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-white">Add Sales Lead</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-4 sm:px-6 py-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className={labelCls}>Client Name *</label>
                  <input name="name" type="text" required className={inputCls} placeholder="Full name" />
                </div>
                <div>
                  <label className={labelCls}>Phone *</label>
                  <input name="phone" type="text" required className={inputCls} placeholder="+91 98765 43210" />
                </div>
                <div>
                  <label className={labelCls}>Email</label>
                  <input name="email" type="email" className={inputCls} placeholder="email@example.com" />
                </div>
                <div>
                  <label className={labelCls}>Location / City *</label>
                  <input name="location" type="text" required className={inputCls} placeholder="Mumbai, Delhi…" />
                </div>
                <div>
                  <label className={labelCls}>Project Type *</label>
                  <input name="project" type="text" required className={inputCls} placeholder="Residential, Commercial…" />
                </div>
                <div>
                  <label className={labelCls}>Expected Budget (₹) *</label>
                  <input name="budget" type="number" required min="0" className={inputCls} placeholder="500000" />
                </div>
                <div>
                  <label className={labelCls}>Next Follow-up Date *</label>
                  <input name="nextFollowUp" type="date" required className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Source *</label>
                  <select name="source" required className={selectCls}>
                    {SOURCES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Stage</label>
                  <select name="stage" className={selectCls}>
                    {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Priority</label>
                  <select name="priority" className={selectCls}>
                    {["Hot", "Warm", "Cold"].map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className={labelCls}>Notes</label>
                  <textarea
                    name="notes"
                    rows={3}
                    placeholder="Requirements, timeline, decision maker…"
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg transition text-sm disabled:opacity-60 shadow-lg shadow-teal-900/30"
                >
                  {saving ? "Creating…" : "Create Lead"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
