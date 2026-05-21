"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { ScopeSheetModal } from "@/components/ScopeSheetModal";
import { notifySiteVisitReminder } from "@/lib/notifications";
import type { SiteVisit, Lead, ScopeSheet } from "@/lib/types";

const FILTERS = ["all", "scheduled", "completed", "rescheduled", "cancelled"] as const;
type Filter = typeof FILTERS[number];

const inputCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition";
const selectCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 transition";
const labelCls =
  "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

const FILTER_COLOR: Record<string, string> = {
  all:         "bg-teal-500/10 text-teal-400 border-teal-500/20",
  scheduled:   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  completed:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rescheduled: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  cancelled:   "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

export default function SiteVisitsPage() {
  const [visits, setVisits] = useState<SiteVisit[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [scopeVisit, setScopeVisit] = useState<SiteVisit | null>(null);

  useEffect(() => {
    Promise.all([
      api.siteVisits().then((r) => setVisits((r as { visits: SiteVisit[] }).visits)).catch(() => {}),
      api.leads().then((r) => setLeads((r as { leads: Lead[] }).leads)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  function leadName(id: number) {
    const l = leads.find((x) => x.id === id);
    return l ? `${l.name} — ${l.project}` : `Lead #${id}`;
  }

  async function handleStatus(id: number, status: string) {
    await api.updateSiteVisit(id, { status }).catch(() => {});
    setVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: status as SiteVisit["status"] } : v))
    );
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const v = await api.createSiteVisit(body as Record<string, unknown>);
      setVisits((prev) => [v as SiteVisit, ...prev]);
      const name =
        leads.find((l) => String(l.id) === String(body.leadId))?.name ?? "Client";
      await notifySiteVisitReminder(name, String(body.address));
    } catch {
      // silent
    } finally {
      setShowForm(false);
    }
  }

  function handleScopeSheetSaved(visitId: number, sheet: ScopeSheet) {
    setVisits((prev) =>
      prev.map((v) => (v.id === visitId ? { ...v, scopeSheet: sheet } : v))
    );
  }

  const visible =
    filter === "all"
      ? visits
      : visits.filter(
          (v) =>
            v.status.toLowerCase().replace(" ", "-") === filter ||
            v.status.toLowerCase() === filter
        );

  const filterCount = (f: string) =>
    f === "all"
      ? visits.length
      : visits.filter((v) => v.status.toLowerCase() === f).length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Site Visits</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {visits.filter((v) => v.status === "Scheduled").length} scheduled
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-lg transition shadow-lg shadow-teal-900/30"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            className="w-4 h-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
          <span className="hidden sm:inline">Schedule Visit</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg border text-sm font-medium capitalize transition ${
              filter === f
                ? FILTER_COLOR[f]
                : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            {f}
            {filterCount(f) > 0 && (
              <span className="ml-1.5 text-xs opacity-70">
                ({filterCount(f)})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Visits table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-14 bg-slate-800 rounded-lg animate-pulse"
              />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="p-14 text-center">
            <p className="text-slate-600 text-sm">No site visits found</p>
          </div>
        ) : (
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5">
                  Lead / Project
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden md:table-cell">
                  Address
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5">
                  Date
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden lg:table-cell">
                  Assigned To
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5">
                  Status
                </th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5">
                  Scope Sheet
                </th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visible.map((visit) => (
                <tr
                  key={visit.id}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white text-sm">
                      {leadName(visit.leadId)}
                    </p>
                    {visit.notes && (
                      <p className="text-slate-500 text-xs mt-0.5 truncate max-w-[200px]">
                        {visit.notes}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">
                      {visit.address}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-slate-400 text-sm">
                      {shortDate(visit.date)}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-slate-500 text-sm">
                      {visit.assignedTo}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge value={visit.status} />
                  </td>
                  <td className="px-4 py-3.5">
                    <button
                      onClick={() => setScopeVisit(visit)}
                      className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition ${
                        visit.scopeSheet
                          ? "bg-teal-500/15 text-teal-400 border-teal-500/30 hover:bg-teal-500/25"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700"
                      }`}
                    >
                      {visit.scopeSheet ? (
                        <>
                          <svg
                            viewBox="0 0 14 14"
                            fill="none"
                            className="w-3 h-3"
                          >
                            <path
                              d="M2 7l3 3 7-7"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          View / Edit
                        </>
                      ) : (
                        <>
                          <svg
                            viewBox="0 0 14 14"
                            fill="none"
                            className="w-3 h-3"
                          >
                            <path
                              d="M7 2v10M2 7h10"
                              stroke="currentColor"
                              strokeWidth={1.5}
                              strokeLinecap="round"
                            />
                          </svg>
                          Fill Sheet
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {visit.status === "Scheduled" && (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatus(visit.id, "Completed")}
                          className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition"
                        >
                          Completed
                        </button>
                        <button
                          onClick={() => handleStatus(visit.id, "Rescheduled")}
                          className="text-xs font-semibold text-amber-400 border border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 px-3 py-1.5 rounded-lg transition"
                        >
                          Reschedule
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Schedule Site Visit Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <h2 className="text-lg font-bold text-white">
                Schedule Site Visit
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="text-slate-500 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreate} className="px-6 py-5 space-y-4">
              <div>
                <label className={labelCls}>Lead *</label>
                <select name="leadId" required className={selectCls}>
                  <option value="">Select lead</option>
                  {leads
                    .filter((l) => !["Won", "Lost"].includes(l.stage))
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name} — {l.project}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Visit Date *</label>
                <input
                  name="date"
                  type="date"
                  required
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Property Address *</label>
                <input
                  name="address"
                  type="text"
                  required
                  placeholder="Full address with pincode"
                  className={inputCls}
                />
              </div>
              <div>
                <label className={labelCls}>Notes</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="What to bring, scope, special instructions…"
                  className={`${inputCls} resize-none`}
                />
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
                  Schedule Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Scope Sheet Modal */}
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
