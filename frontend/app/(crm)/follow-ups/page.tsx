"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { shortDate, FOLLOW_UP_TYPES } from "@/lib/utils";
import Badge from "@/components/Badge";
import { notifyFollowUpDue } from "@/lib/notifications";
import type { FollowUp, Lead } from "@/lib/types";

const FILTERS = ["all", "overdue", "pending", "completed"] as const;
type Filter = typeof FILTERS[number];

const inputCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition";
const selectCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 transition";
const labelCls = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

const STATUS_COLOR: Record<string, string> = {
  overdue:   "bg-rose-500/10 text-rose-400 border-rose-500/20",
  pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  all:       "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.followUps().then((r) => setFollowUps((r as { followUps: FollowUp[] }).followUps)).catch(() => {}),
      api.leads().then((r) => setLeads((r as { leads: Lead[] }).leads)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  function leadName(id: number) {
    return leads.find((l) => l.id === id)?.name ?? `Lead #${id}`;
  }

  async function handleComplete(id: number) {
    await api.completeFollowUp(id).catch(() => {});
    setFollowUps((prev) => prev.map((f) => f.id === id ? { ...f, status: "Completed" } : f));
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
      // silent
    } finally {
      setShowForm(false);
    }
  }

  const counts = {
    all: followUps.length,
    overdue: followUps.filter((f) => f.status === "Overdue").length,
    pending: followUps.filter((f) => f.status === "Pending").length,
    completed: followUps.filter((f) => f.status === "Completed").length,
  };

  const visible = filter === "all" ? followUps : followUps.filter((f) => f.status.toLowerCase() === filter);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Follow-ups</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {counts.overdue > 0
              ? <span className="text-rose-400 font-medium">{counts.overdue} overdue</span>
              : "All clear"}
            {" · "}{counts.pending} pending
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition shadow-lg shadow-teal-900/30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Follow-up
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition ${
              filter === f
                ? STATUS_COLOR[f]
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {f}
            {counts[f] > 0 && (
              <span className="ml-1.5 text-xs opacity-70">({counts[f]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Follow-up list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="p-14 text-center">
            <p className="text-slate-600 text-sm">No follow-ups in this category</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5">Lead</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden sm:table-cell">Type</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5">Due Date</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden md:table-cell">Outcome</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visible.map((f) => (
                <tr
                  key={f.id}
                  className={`hover:bg-slate-800/40 transition-colors ${
                    f.status === "Overdue" ? "bg-rose-500/5" : ""
                  }`}
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white text-sm">{leadName(f.leadId)}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-teal-400 text-sm font-medium">{f.type}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-sm font-medium ${f.status === "Overdue" ? "text-rose-400" : "text-slate-400"}`}>
                      {shortDate(f.due)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-slate-500 text-sm">{f.outcome || "—"}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge value={f.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {f.status !== "Completed" && (
                      <button
                        onClick={() => handleComplete(f.id)}
                        className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition"
                      >
                        Mark Done
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Follow-up Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">Add Follow-up</h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className={labelCls}>Lead *</label>
                <select name="leadId" required className={selectCls}>
                  <option value="">Select lead</option>
                  {leads.filter((l) => !["Won", "Lost"].includes(l.stage)).map((l) => (
                    <option key={l.id} value={l.id}>{l.name} — {l.project}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Type</label>
                <select name="type" className={selectCls}>
                  {FOLLOW_UP_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Due Date *</label>
                <input name="due" type="date" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Goal / Outcome</label>
                <input name="outcome" type="text" placeholder="What should happen?" className={inputCls} />
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
                  className="flex-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold py-2.5 rounded-lg transition text-sm shadow-lg shadow-teal-900/30"
                >
                  Save Follow-up
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
