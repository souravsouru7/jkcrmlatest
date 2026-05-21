"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import type { Quotation, Lead } from "@/lib/types";

const FILTERS = ["all", "draft", "sent", "accepted", "rejected", "expired"] as const;
type Filter = typeof FILTERS[number];

const inputCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/30 transition";
const selectCls =
  "w-full bg-slate-800 border border-slate-700 rounded-lg text-white px-3.5 py-2.5 text-sm outline-none focus:border-teal-500 transition";
const labelCls = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider";

const FILTER_COLOR: Record<string, string> = {
  all:      "bg-teal-500/10 text-teal-400 border-teal-500/20",
  draft:    "bg-slate-600/20 text-slate-400 border-slate-500/20",
  sent:     "bg-blue-500/10 text-blue-400 border-blue-500/20",
  accepted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  rejected: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  expired:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.quotations().then((r) => setQuotes((r as { quotations: Quotation[] }).quotations)).catch(() => {}),
      api.leads().then((r) => setLeads((r as { leads: Lead[] }).leads)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  function leadName(id: number) {
    return leads.find((x) => x.id === id)?.name ?? `Lead #${id}`;
  }

  async function handleStatus(id: number, status: string) {
    await api.updateQuotation(id, { status }).catch(() => {});
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status: status as Quotation["status"] } : q));
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const q = await api.createQuotation(body as Record<string, unknown>);
      setQuotes((prev) => [q as Quotation, ...prev]);
    } catch {
      // silent
    } finally {
      setShowForm(false);
    }
  }

  const visible = filter === "all" ? quotes : quotes.filter((q) => q.status.toLowerCase() === filter);
  const totalValue = visible.reduce((s, q) => s + q.amount, 0);
  const filterCount = (f: string) => f === "all" ? quotes.length : quotes.filter((q) => q.status.toLowerCase() === f).length;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-white">Quotations</h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            {visible.length} quotations ·{" "}
            <span className="text-teal-400 font-medium">{money(totalValue)}</span> total
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="shrink-0 flex items-center gap-2 bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold px-3 sm:px-4 py-2.5 rounded-lg transition shadow-lg shadow-teal-900/30"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          <span className="hidden sm:inline">New Quotation</span>
          <span className="sm:hidden">New</span>
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
              <span className="ml-1.5 text-xs opacity-70">({filterCount(f)})</span>
            )}
          </button>
        ))}
      </div>

      {/* Quotations table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-x-auto">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-14 bg-slate-800 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="p-14 text-center">
            <p className="text-slate-600 text-sm">No quotations found</p>
          </div>
        ) : (
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-slate-800">
                <th className="text-left text-xs font-semibold text-slate-500 px-5 py-3.5">Client</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden sm:table-cell">Quote #</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-4 py-3.5">Amount</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden md:table-cell">Valid Till</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5 hidden lg:table-cell">Discount / Tax</th>
                <th className="text-left text-xs font-semibold text-slate-500 px-4 py-3.5">Status</th>
                <th className="text-right text-xs font-semibold text-slate-500 px-5 py-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {visible.map((q) => (
                <tr key={q.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="font-semibold text-white text-sm">{leadName(q.leadId)}</p>
                  </td>
                  <td className="px-4 py-3.5 hidden sm:table-cell">
                    <span className="text-slate-500 text-xs font-mono">{q.number}</span>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-teal-400 text-sm">{money(q.amount)}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden md:table-cell">
                    <span className="text-slate-400 text-sm">{shortDate(q.validTill)}</span>
                  </td>
                  <td className="px-4 py-3.5 hidden lg:table-cell">
                    <span className="text-slate-500 text-xs">
                      {q.discount ? `−${money(q.discount)}` : "—"}
                      {q.tax ? ` / +${money(q.tax)}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge value={q.status} />
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {q.status === "Draft" && (
                        <button
                          onClick={() => handleStatus(q.id, "Sent")}
                          className="text-xs font-semibold text-blue-400 border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 rounded-lg transition"
                        >
                          Mark Sent
                        </button>
                      )}
                      {q.status === "Sent" && (
                        <>
                          <button
                            onClick={() => handleStatus(q.id, "Accepted")}
                            className="text-xs font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg transition"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatus(q.id, "Rejected")}
                            className="text-xs font-semibold text-rose-400 border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg transition"
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* New Quotation Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
              <h2 className="text-lg font-bold text-white">New Quotation</h2>
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
                <label className={labelCls}>Total Amount (₹) *</label>
                <input name="amount" type="number" required min="0" className={inputCls} placeholder="0" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Discount (₹)</label>
                  <input name="discount" type="number" min="0" defaultValue="0" className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Tax (₹)</label>
                  <input name="tax" type="number" min="0" defaultValue="0" className={inputCls} />
                </div>
              </div>
              <div>
                <label className={labelCls}>Valid Till *</label>
                <input name="validTill" type="date" required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Payment Terms</label>
                <textarea
                  name="terms"
                  rows={2}
                  placeholder="50% advance, balance on completion…"
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
                  Create Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
