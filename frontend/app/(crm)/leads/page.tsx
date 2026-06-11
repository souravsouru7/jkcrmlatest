"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { FOLLOW_UP_TYPES, QUALITY_TYPE_VALUES, QUALITY_VALUES, shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { EmptyState, PageHeader, Section, Skeleton, buttonGhost, buttonPrimary, buttonSecondary, inputCls, labelCls, pageWrap, selectCls } from "@/components/CrmDesign";
import type { Lead } from "@/lib/types";
import LeadDetailDrawer, { DETAIL_ORDER, SheetField, normalizePhone, sheetValue } from "@/components/LeadDetailDrawer";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [qualityFilter, setQualityFilter] = useState("All");
  const [qualityTypeFilter, setQualityTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
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

  const locations = useMemo(() => {
    return Array.from(new Set(leads.map((lead) => sheetValue(lead, "Which location is your property in?")).filter(Boolean))).sort();
  }, [leads]);

  const filtered = leads.filter((lead) => {
    const haystack = DETAIL_ORDER.map((field) => sheetValue(lead, field)).join(" ").toLowerCase();
    const quality = sheetValue(lead, "Quality");
    const qualityType = sheetValue(lead, "Quality Type");
    const location = sheetValue(lead, "Which location is your property in?");
    const date = sheetValue(lead, "Date");
    const budget = sheetValue(lead, "What is your estimated interior budget?");
    return (
      haystack.includes(query.toLowerCase()) &&
      (qualityFilter === "All" || quality === qualityFilter) &&
      (qualityTypeFilter === "All" || qualityType === qualityTypeFilter) &&
      (locationFilter === "All" || location === locationFilter) &&
      (!dateFilter || date.includes(dateFilter)) &&
      (!budgetFilter || budget.toLowerCase().includes(budgetFilter.toLowerCase()))
    );
  });

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const lead = await api.createLead(body as Record<string, unknown>);
      setLeads((prev) => [lead as Lead, ...prev]);
    } catch {
      const now = new Date().toISOString();
      const newLead = sheetPayloadToLead(body, now);
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

  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Google Sheet mirror"
        title="Leads"
        subtitle={`${leads.length} total leads. Lead records preserve the exact Google Sheet fields and dropdown values.`}
        action={<button onClick={() => setShowForm(true)} className={buttonPrimary}>+ Add Lead</button>}
      />

      <Section title="Search and filters" subtitle="Filter by Quality, Quality Type, Location, Date, and Budget.">
        <div className="grid grid-cols-1 gap-3 p-4 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <label className={labelCls}>Search</label>
            <input className={inputCls} placeholder="Search exact sheet fields..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <FilterSelect label="Quality" value={qualityFilter} onChange={setQualityFilter} options={["All", ...QUALITY_VALUES]} />
          <FilterSelect label="Quality Type" value={qualityTypeFilter} onChange={setQualityTypeFilter} options={["All", ...QUALITY_TYPE_VALUES]} />
          <FilterSelect label="Location" value={locationFilter} onChange={setLocationFilter} options={["All", ...locations]} />
          <div>
            <label className={labelCls}>Date</label>
            <input className={inputCls} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} placeholder="Date" />
          </div>
          <div className="lg:col-span-2">
            <label className={labelCls}>Budget</label>
            <input className={inputCls} value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} placeholder="Budget text" />
          </div>
        </div>
      </Section>

      <Section title="Lead workspace" subtitle="Each card displays only Google Sheet lead fields, with quick communication actions.">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No leads found" subtitle="Try another exact sheet filter value." />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filtered.map((lead) => {
              const name = sheetValue(lead, "Name");
              const phone = sheetValue(lead, "Phone Number");
              const email = sheetValue(lead, "Email");
              const location = sheetValue(lead, "Which location is your property in?");
              const budget = sheetValue(lead, "What is your estimated interior budget?");
              const quality = sheetValue(lead, "Quality") || "#N/A";
              return (
                <div key={lead.id} onClick={() => setActiveLead(lead)} className="grid cursor-pointer gap-4 px-5 py-4 hover:bg-slate-50 lg:grid-cols-[minmax(260px,1.2fr)_1fr_220px_240px] lg:items-center dark:hover:bg-slate-800/60">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      {(name || "NA").slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{name || "No Name"}</p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">{phone || "No Phone Number"} - {location || "No Location"}</p>
                    </div>
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{sheetValue(lead, "What type of home do you have?") || "No home type"}</p>
                    <p className="truncate text-xs text-slate-500 dark:text-slate-400">{budget || "No budget"} - {shortDate(sheetValue(lead, "Date"))}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge value={quality} />
                    {sheetValue(lead, "Quality Type") && <Badge value={sheetValue(lead, "Quality Type")} />}
                  </div>
                  <div className="flex items-center justify-start gap-2 lg:justify-end" onClick={(e) => e.stopPropagation()}>
                    {phone && <a href={`tel:${phone}`} className="rounded-xl bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700">Call</a>}
                    {phone && <a href={`https://wa.me/${normalizePhone(phone)}`} className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">WhatsApp</a>}
                    {email && <a href={`mailto:${email}`} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Email</a>}
                    <button onClick={() => setLoggingLead(lead)} className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Log</button>
                    <button onClick={() => handleDelete(lead.id)} className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Section>

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

      {showForm && (
        <Modal title="Add Lead" onClose={() => setShowForm(false)} max="max-w-3xl">
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Date"><input name="Date" type="date" className={inputCls} /></Field>
              <Field label="Email"><input name="Email" type="email" className={inputCls} /></Field>
              <Field label="Name"><input name="Name" required className={inputCls} /></Field>
              <Field label="Phone Number"><input name="Phone Number" required className={inputCls} /></Field>
              <Field label="DOB"><input name="DOB" type="date" className={inputCls} /></Field>
              <Field label="What type of home do you have?"><input name="What type of home do you have?" className={inputCls} /></Field>
              <Field label="What is your estimated interior budget?"><input name="What is your estimated interior budget?" className={inputCls} /></Field>
              <Field label="Which location is your property in?"><input name="Which location is your property in?" className={inputCls} /></Field>
              <Field label="Quality"><select name="Quality" className={selectCls}>{QUALITY_VALUES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
              <Field label="Quality Type"><select name="Quality Type" className={selectCls}>{QUALITY_TYPE_VALUES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
              <div className="sm:col-span-2"><Field label="Initial Comments"><textarea name="Initial Comments" rows={3} className={inputCls} /></Field></div>
              <Field label="Call 1"><input name="Call 1" className={inputCls} /></Field>
              <Field label="Call 2"><input name="Call 2" className={inputCls} /></Field>
              <Field label="Call 3"><input name="Call 3" className={inputCls} /></Field>
              <Field label="Call 4"><input name="Call 4" className={inputCls} /></Field>
              <Field label="Call 5"><input name="Call 5" className={inputCls} /></Field>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowForm(false)} className={buttonSecondary}>Cancel</button>
              <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? "Creating..." : "Create Lead"}</button>
            </div>
          </form>
        </Modal>
      )}

      {loggingLead && (
        <Modal title={`Log activity - ${sheetValue(loggingLead, "Name") || "Lead"}`} onClose={() => setLoggingLead(null)}>
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

function sheetPayloadToLead(body: Record<string, FormDataEntryValue>, now: string): Lead {
  const value = (field: SheetField) => String(body[field] || "").trim();
  return {
    id: Date.now(),
    Date: value("Date"),
    Email: value("Email"),
    Name: value("Name"),
    "Phone Number": value("Phone Number"),
    DOB: value("DOB"),
    "What type of home do you have?": value("What type of home do you have?"),
    "What is your estimated interior budget?": value("What is your estimated interior budget?"),
    "Which location is your property in?": value("Which location is your property in?"),
    Quality: value("Quality"),
    "Quality Type": value("Quality Type"),
    "Initial Comments": value("Initial Comments"),
    "Call 1": value("Call 1"),
    "Call 2": value("Call 2"),
    "Call 3": value("Call 3"),
    "Call 4": value("Call 4"),
    "Call 5": value("Call 5"),
    name: value("Name"),
    phone: value("Phone Number"),
    email: value("Email"),
    location: value("Which location is your property in?"),
    source: "Manual Entry",
    project: value("What type of home do you have?"),
    budget: 0,
    estimatedBudget: value("What is your estimated interior budget?"),
    sheetDate: value("Date"),
    dob: value("DOB"),
    quality: value("Quality"),
    qualityType: value("Quality Type"),
    initialComments: value("Initial Comments"),
    call1: value("Call 1"),
    call2: value("Call 2"),
    call3: value("Call 3"),
    call4: value("Call 4"),
    call5: value("Call 5"),
    stage: "New Lead",
    priority: "Warm",
    owner: "Sales Admin",
    nextFollowUp: null,
    lastActivity: "Lead created",
    notes: "",
    lostReason: null,
    createdAt: now,
    updatedAt: now,
  };
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: readonly string[]; onChange: (value: string) => void }) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select className={selectCls} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option}</option>)}
      </select>
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


