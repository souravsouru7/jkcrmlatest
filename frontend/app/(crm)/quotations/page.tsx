"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money, shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { EmptyState, PageHeader, Section, Skeleton, buttonPrimary, buttonSecondary, inputCls, labelCls, pageWrap, selectCls } from "@/components/CrmDesign";
import type { Lead, Quotation } from "@/lib/types";

const FILTERS = ["all", "draft", "sent", "accepted", "rejected"] as const;
type Filter = typeof FILTERS[number];

const STATUS_TONE: Record<string, string> = {
  Draft: "border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50",
  Sent: "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10",
  Accepted: "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10",
  Rejected: "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10",
  Expired: "border-amber-200 bg-amber-50 dark:border-amber-500/20 dark:bg-amber-500/10",
};

export default function QuotationsPage() {
  const [quotes, setQuotes] = useState<Quotation[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [showForm, setShowForm] = useState(false);
  const [preview, setPreview] = useState<Quotation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.quotations().then((r) => setQuotes((r as { quotations: Quotation[] }).quotations)).catch(() => {}),
      api.leads().then((r) => setLeads((r as { leads: Lead[] }).leads)).catch(() => {}),
    ]).finally(() => setLoading(false));
  }, []);

  function lead(id: number) {
    return leads.find((item) => item.id === id);
  }

  async function handleStatus(id: number, status: Quotation["status"]) {
    await api.updateQuotation(id, { status }).catch(() => {});
    setQuotes((prev) => prev.map((q) => q.id === id ? { ...q, status } : q));
  }

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const q = await api.createQuotation(body as Record<string, unknown>);
      setQuotes((prev) => [q as Quotation, ...prev]);
    } catch {
    } finally {
      setShowForm(false);
    }
  }

  const visible = filter === "all" ? quotes : quotes.filter((q) => q.status.toLowerCase() === filter);
  const draftValue = quotes.filter((q) => q.status === "Draft").reduce((sum, q) => sum + q.amount, 0);
  const sentValue = quotes.filter((q) => q.status === "Sent").reduce((sum, q) => sum + q.amount, 0);
  const acceptedValue = quotes.filter((q) => q.status === "Accepted").reduce((sum, q) => sum + q.amount, 0);
  const rejectedValue = quotes.filter((q) => q.status === "Rejected").reduce((sum, q) => sum + q.amount, 0);

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Quotation finance desk"
        title="Quotations"
        subtitle={`${quotes.length} quotations - ${money(acceptedValue)} accepted - ${money(sentValue)} waiting for client decision`}
        action={<button onClick={() => setShowForm(true)} className={buttonPrimary}>+ Create Quote</button>}
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <AmountCard label="Draft" value={draftValue} count={quotes.filter((q) => q.status === "Draft").length} tone="slate" />
        <AmountCard label="Sent" value={sentValue} count={quotes.filter((q) => q.status === "Sent").length} tone="blue" />
        <AmountCard label="Accepted" value={acceptedValue} count={quotes.filter((q) => q.status === "Accepted").length} tone="green" />
        <AmountCard label="Rejected" value={rejectedValue} count={quotes.filter((q) => q.status === "Rejected").length} tone="red" />
      </div>

      <Section
        title="Quote register"
        subtitle="Finance-app style view with status actioning and professional preview."
        action={
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((item) => (
              <button key={item} onClick={() => setFilter(item)} className={`shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold capitalize ${filter === item ? "border-blue-600 bg-blue-600 text-white" : "border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"}`}>
                {item}
              </button>
            ))}
          </div>
        }
      >
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : visible.length === 0 ? (
          <EmptyState title="No quotations found" subtitle="Create a quote from a qualified lead." />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 xl:grid-cols-3">
            {visible.map((quote) => {
              const client = lead(quote.leadId);
              return (
                <article key={quote.id} className={`rounded-2xl border p-5 shadow-sm ${STATUS_TONE[quote.status] ?? STATUS_TONE.Draft}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{client?.name || `Lead #${quote.leadId}`}</p>
                      <p className="mt-1 font-mono text-xs text-slate-500 dark:text-slate-400">{quote.number}</p>
                    </div>
                    <Badge value={quote.status} />
                  </div>

                  <div className="mt-5 rounded-2xl bg-white/80 p-4 dark:bg-slate-950/70">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Quote Amount</p>
                    <p className="mt-1 text-3xl font-bold tracking-tight text-slate-950 dark:text-white">{money(quote.amount)}</p>
                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">Discount <strong className="text-slate-800 dark:text-slate-200">{quote.discount ? money(quote.discount) : money(0)}</strong></span>
                      <span className="text-slate-500 dark:text-slate-400">Tax <strong className="text-slate-800 dark:text-slate-200">{quote.tax ? money(quote.tax) : money(0)}</strong></span>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3 text-xs">
                    <span className="font-semibold text-slate-500 dark:text-slate-400">Valid till {shortDate(quote.validTill)}</span>
                    <button onClick={() => setPreview(quote)} className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">Preview</button>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {quote.status === "Draft" && <button onClick={() => handleStatus(quote.id, "Sent")} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Send</button>}
                    {quote.status === "Sent" && (
                      <>
                        <button onClick={() => handleStatus(quote.id, "Accepted")} className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">Accept</button>
                        <button onClick={() => handleStatus(quote.id, "Rejected")} className="rounded-xl bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700">Reject</button>
                      </>
                    )}
                    <button onClick={() => setPreview(quote)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">PDF Preview</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Section>

      {showForm && (
        <Modal title="Create Quotation" onClose={() => setShowForm(false)}>
          <form onSubmit={handleCreate} className="space-y-4">
            <Field label="Lead *"><select name="leadId" required className={selectCls}><option value="">Select lead</option>{leads.filter((l) => !["Won", "Lost"].includes(l.stage)).map((l) => <option key={l.id} value={l.id}>{l.name} - {l.project}</option>)}</select></Field>
            <Field label="Total Amount *"><input name="amount" type="number" required min="0" className={inputCls} placeholder="0" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Discount"><input name="discount" type="number" min="0" defaultValue="0" className={inputCls} /></Field>
              <Field label="Tax"><input name="tax" type="number" min="0" defaultValue="0" className={inputCls} /></Field>
            </div>
            <Field label="Valid Till *"><input name="validTill" type="date" required className={inputCls} /></Field>
            <Field label="Payment Terms"><textarea name="terms" rows={3} placeholder="50% advance, balance on completion..." className={inputCls} /></Field>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className={buttonSecondary}>Cancel</button>
              <button type="submit" className={buttonPrimary}>Create Quote</button>
            </div>
          </form>
        </Modal>
      )}

      {preview && <QuotePreview quote={preview} lead={lead(preview.leadId)} onClose={() => setPreview(null)} />}
    </div>
  );
}

function AmountCard({ label, value, count, tone }: { label: string; value: number; count: number; tone: "slate" | "blue" | "green" | "red" }) {
  const tones = {
    slate: "bg-slate-900 text-white dark:bg-slate-800",
    blue: "bg-blue-600 text-white",
    green: "bg-emerald-600 text-white",
    red: "bg-red-600 text-white",
  };
  return (
    <div className={`rounded-2xl p-5 shadow-sm ${tones[tone]}`}>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      <p className="mt-3 text-3xl font-bold tracking-tight">{money(value)}</p>
      <p className="mt-2 text-xs font-semibold opacity-75">{count} quote{count === 1 ? "" : "s"}</p>
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
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">{title}</h2>
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function QuotePreview({ quote, lead, onClose }: { quote: Quotation; lead?: Lead; onClose: () => void }) {
  const net = Math.max(quote.amount - (quote.discount || 0) + (quote.tax || 0), 0);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-slate-950 dark:text-white">Professional Quote Preview</h2>
            <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-400">{quote.number}</p>
          </div>
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Close</button>
        </div>

        <div className="p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white">JK</div>
                <p className="mt-4 text-lg font-bold text-slate-950 dark:text-white">JK Interiors</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Interior design, execution, and turnkey services</p>
              </div>
              <div className="text-left sm:text-right">
                <Badge value={quote.status} />
                <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">Valid till {shortDate(quote.validTill)}</p>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Prepared For</p>
                <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">{lead?.name || `Lead #${quote.leadId}`}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lead?.project || "Interior project"}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{lead?.location || ""}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Commercial Summary</p>
                <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{money(net)}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Inclusive of configured discount and tax</p>
              </div>
            </div>

            <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              {[
                ["Base quote", money(quote.amount)],
                ["Discount", quote.discount ? `-${money(quote.discount)}` : money(0)],
                ["Tax", quote.tax ? `+${money(quote.tax)}` : money(0)],
                ["Payable amount", money(net)],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between border-b border-slate-100 px-5 py-4 last:border-b-0 dark:border-slate-800">
                  <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">{label}</span>
                  <span className="text-sm font-bold text-slate-950 dark:text-white">{value}</span>
                </div>
              ))}
            </div>

            {quote.terms && (
              <div className="mt-6 rounded-2xl bg-white p-4 dark:bg-slate-900">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Payment Terms</p>
                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">{quote.terms}</p>
              </div>
            )}
          </div>

          <div className="mt-5 flex justify-end gap-3">
            <button onClick={() => window.print()} className={buttonSecondary}>PDF Download</button>
            <button onClick={onClose} className={buttonPrimary}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}
