"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { FOLLOW_UP_TYPES, LEAD_TEMPERATURES, QUALITY_TYPE_VALUES, QUALITY_VALUES, shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { EmptyState, PageHeader, Section, Skeleton, buttonGhost, buttonPrimary, buttonSecondary, inputCls, labelCls, pageWrap, selectCls } from "@/components/CrmDesign";
import type { Lead } from "@/lib/types";
import LeadDetailDrawer, { DETAIL_ORDER, SheetField, normalizePhone, sheetValue } from "@/components/LeadDetailDrawer";

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [qualityFilter, setQualityFilter] = useState("All");
  const [qualityTypeFilter, setQualityTypeFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState("");
  const [budgetFilter, setBudgetFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [activeLead, setActiveLead] = useState<Lead | null>(null);
  const [loggingLead, setLoggingLead] = useState<Lead | null>(null);
  const [updatingLead, setUpdatingLead] = useState<Lead | null>(null);
  const [updateQuality, setUpdateQuality] = useState("Awaiting Update");
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
      (locationFilter.length === 0 || locationFilter.includes(location)) &&
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

  async function handleQualificationUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!updatingLead) return;
    setSaving(true);
    const fd = new FormData(e.currentTarget);
    const body = Object.fromEntries(fd.entries());
    try {
      const result = await api.updateQualification(updatingLead.id, body as Record<string, unknown>);
      setLeads((prev) => prev.map((lead) => lead.id === updatingLead.id ? result.lead as Lead : lead));
    } catch (err: any) {
      alert(err.message || "Failed to update lead");
    } finally {
      setSaving(false);
      setUpdatingLead(null);
    }
  }

  function openUpdateLead(lead: Lead) {
    setUpdateQuality(lead.quality || sheetValue(lead, "Quality") || "Awaiting Update");
    setUpdatingLead(lead);
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
        eyebrow="Lead inbox"
        title="Leads"
        subtitle={`${filtered.length} visible - ${leads.length} total leads`}
        action={<button onClick={() => setShowForm(true)} className={buttonPrimary}>Add Lead</button>}
      />

      <Section title="Filters">
        <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 xl:grid-cols-6">
          <div className="md:col-span-2 xl:col-span-2">
            <label className={labelCls}>Search</label>
            <input className={inputCls} placeholder="Search exact sheet fields..." value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <FilterSelect label="Quality" value={qualityFilter} onChange={setQualityFilter} options={["All", ...QUALITY_VALUES]} />
          <FilterSelect label="Quality Type" value={qualityTypeFilter} onChange={setQualityTypeFilter} options={["All", ...QUALITY_TYPE_VALUES]} />
          <LocationMultiSelect value={locationFilter} onChange={setLocationFilter} options={locations} />
          <div>
            <label className={labelCls}>Date</label>
            <input className={inputCls} value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} placeholder="Date" />
          </div>
          <div className="md:col-span-2 xl:col-span-2">
            <label className={labelCls}>Budget</label>
            <input className={inputCls} value={budgetFilter} onChange={(e) => setBudgetFilter(e.target.value)} placeholder="Budget text" />
          </div>
        </div>
      </Section>

      <Section title="Lead workspace" subtitle="Name, budget, location, quality, temperature, and next action.">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-56" />)}</div>
        ) : filtered.length === 0 ? (
          <EmptyState title="No leads found" subtitle="Try another exact sheet filter value." />
        ) : (
          <div className="grid grid-cols-1 gap-3 p-3 sm:p-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((lead) => {
              const name = sheetValue(lead, "Name");
              const phone = sheetValue(lead, "Phone Number");
              const location = sheetValue(lead, "Which location is your property in?");
              const budget = sheetValue(lead, "What is your estimated interior budget?");
              const quality = sheetValue(lead, "Quality") || "#N/A";
              const qualityType = sheetValue(lead, "Quality Type");
              const project = sheetValue(lead, "What type of home do you have?");
              const temperature = lead.leadTemperature || lead.priority || "Warm";
              const nextFollowup = lead.nextFollowupDate || lead.nextFollowUp;
              return (
                <article key={lead.id} onClick={() => setActiveLead(lead)} className="cursor-pointer rounded-lg border border-slate-200 bg-white p-4 shadow-sm hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-950">
                  <div className="flex min-w-0 items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-sm font-bold text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                      {(name || "NA").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{name || "No Name"}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{phone || "No Phone Number"}</p>
                      </div>
                    </div>
                    <Badge value={temperature} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <LeadFact label="Project" value={project || "Not added"} />
                    <LeadFact label="Budget" value={budget || "Not added"} />
                    <LeadFact label="Location" value={location || "Not added"} />
                    <LeadFact label="Next Follow-up" value={nextFollowup ? shortDate(nextFollowup) : "Not set"} />
                  </div>

                  <div className="mt-4 flex min-w-0 flex-wrap items-center gap-2">
                    <Badge value={quality} />
                    {qualityType && <Badge value={qualityType} />}
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{lead.owner || "Sales Admin"}</span>
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 border-t border-slate-100 pt-4 dark:border-slate-800" onClick={(e) => e.stopPropagation()}>
                    {phone ? <a href={`tel:${phone}`} className="rounded-lg bg-blue-600 px-2 py-2.5 text-center text-xs font-bold text-white hover:bg-blue-700">Call</a> : <span className="rounded-lg bg-slate-100 px-2 py-2.5 text-center text-xs font-bold text-slate-400 dark:bg-slate-800">Call</span>}
                    {phone ? <a href={`https://wa.me/${normalizePhone(phone)}`} className="rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-2.5 text-center text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300">WA</a> : <span className="rounded-lg bg-slate-100 px-2 py-2.5 text-center text-xs font-bold text-slate-400 dark:bg-slate-800">WA</span>}
                    <button onClick={() => openUpdateLead(lead)} className="rounded-lg bg-slate-900 px-2 py-2.5 text-xs font-bold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">Update</button>
                    <button onClick={() => setLoggingLead(lead)} className="rounded-lg border border-slate-200 px-2 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Follow</button>
                  </div>
                </article>
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
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
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
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setLoggingLead(null)} className={buttonSecondary}>Cancel</button>
              <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? "Saving..." : "Save Log"}</button>
            </div>
          </form>
        </Modal>
      )}

      {updatingLead && (
        <Modal title={`Update Lead - ${sheetValue(updatingLead, "Name") || "Lead"}`} onClose={() => setUpdatingLead(null)} max="max-w-3xl">
          <form onSubmit={handleQualificationUpdate} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Quality"><select name="quality" value={updateQuality} onChange={(event) => setUpdateQuality(event.target.value)} className={selectCls}>{QUALITY_VALUES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
              <Field label={updateQuality === "Negative" ? "Dump Reason" : "Quality Type"}><select name="qualityType" defaultValue={updatingLead.qualityType || sheetValue(updatingLead, "Quality Type") || "Awaiting Update"} className={selectCls}>{QUALITY_TYPE_VALUES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
              {updateQuality !== "Negative" && <Field label="Lead Temperature"><select name="leadTemperature" defaultValue={updatingLead.leadTemperature || updatingLead.priority || "Warm"} className={selectCls}>{LEAD_TEMPERATURES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>}
              {updateQuality !== "Negative" && <Field label="Follow-up Type"><select name="followUpType" defaultValue="Call" className={selectCls}>{FOLLOW_UP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>}
              {updateQuality !== "Negative" && <Field label="Next Follow-up Date"><input name="nextFollowupDate" type="date" defaultValue={updatingLead.nextFollowupDate || updatingLead.nextFollowUp || ""} className={inputCls} /></Field>}
              <Field label="Call Outcome"><input name="callOutcome" className={inputCls} placeholder="Connected, no answer, converted..." /></Field>
              {updateQuality === "Negative" && <div className="sm:col-span-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">This lead will move to Negative Leads / Dump automatically. The selected dump reason will be saved as the lost reason.</div>}
              <div className="sm:col-span-2"><Field label={updateQuality === "Negative" ? "Reason Notes" : "Call Notes"}><textarea name="callNotes" rows={3} className={inputCls} placeholder={updateQuality === "Negative" ? "Add rejection details..." : "Conversation summary, requirement, budget, objections..."} /></Field></div>
              <div className="sm:col-span-2"><Field label="Internal Remarks"><textarea name="internalRemarks" rows={2} defaultValue={updatingLead.internalRemarks || ""} className={inputCls} /></Field></div>
              <div className="sm:col-span-2"><Field label="Sales Remarks"><textarea name="salesRemarks" rows={2} defaultValue={updatingLead.salesRemarks || ""} className={inputCls} /></Field></div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Call History</p>
              <div className="mt-3 space-y-2">
                {(updatingLead.callHistory || []).slice(-5).map((call) => (
                  <div key={`${call.callNumber}-${call.date}`} className="rounded-xl bg-white p-3 text-sm dark:bg-slate-900">
                    <p className="font-semibold text-slate-900 dark:text-white">Call {call.callNumber} - {shortDate(call.date)}</p>
                    <p className="text-slate-500 dark:text-slate-400">{call.outcome || "No outcome"} - {call.notes || "No notes"}</p>
                  </div>
                ))}
                {!(updatingLead.callHistory || []).length && <p className="text-sm text-slate-500 dark:text-slate-400">No calls logged yet.</p>}
              </div>
            </div>
            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setUpdatingLead(null)} className={buttonSecondary}>Cancel</button>
              <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? "Updating..." : "Update Lead"}</button>
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
    leadTemperature: "Warm",
    callCount: 0,
    callHistory: [],
    lastCallDate: null,
    nextFollowupDate: null,
    internalRemarks: "",
    salesRemarks: "",
    auditHistory: [],
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

function LeadFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 px-3 py-2 dark:bg-slate-900">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 truncate text-xs font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
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

function LocationMultiSelect({ value, options, onChange }: { value: string[]; options: string[]; onChange: (value: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const filteredOptions = options.filter((option) => option.toLowerCase().includes(search.toLowerCase()));
  const selectedText = value.length === 0 ? "All locations" : `${value.length} selected`;

  function toggle(option: string) {
    onChange(value.includes(option) ? value.filter((item) => item !== option) : [...value, option]);
  }

  return (
    <div className="relative">
      <label className={labelCls}>Location</label>
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className={`${inputCls} flex min-h-[46px] items-center justify-between gap-3 text-left`}
      >
        <span className="min-w-0 truncate">{selectedText}</span>
        <span className="text-xs font-bold text-slate-400">{open ? "Close" : "Select"}</span>
      </button>

      {value.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {value.slice(0, 3).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => toggle(item)}
              className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300"
            >
              {item} x
            </button>
          ))}
          {value.length > 3 && <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">+{value.length - 3}</span>}
          <button type="button" onClick={() => onChange([])} className="rounded-full px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">Clear</button>
        </div>
      )}

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-100 p-3 dark:border-slate-800">
            <input
              className={inputCls}
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search location..."
              autoFocus
            />
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={() => onChange([])} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">All</button>
              <button type="button" onClick={() => onChange(filteredOptions)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800">Select shown</button>
            </div>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {filteredOptions.length ? filteredOptions.map((option) => {
              const checked = value.includes(option);
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => toggle(option)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${checked ? "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300" : "text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-900"}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border text-xs ${checked ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300 dark:border-slate-700"}`}>
                    {checked ? "✓" : ""}
                  </span>
                  <span className="min-w-0 break-words">{option}</span>
                </button>
              );
            }) : (
              <p className="px-3 py-6 text-center text-sm font-semibold text-slate-500 dark:text-slate-400">No locations found</p>
            )}
          </div>
        </div>
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
      <div className={`relative max-h-[92vh] w-full ${max} overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900`}>
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="min-w-0 break-words text-base font-bold text-slate-950 sm:text-lg dark:text-white">{title}</h2>
          <button onClick={onClose} className={buttonGhost}>Close</button>
        </div>
        <div className="p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
