"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import { FOLLOW_UP_TYPES, LEAD_TEMPERATURES, QUALITY_TYPE_VALUES, QUALITY_VALUES, shortDate } from "@/lib/utils";
import type { Lead } from "@/lib/types";
import { buttonGhost, buttonPrimary, buttonSecondary, inputCls, labelCls, selectCls } from "@/components/CrmDesign";

export default function UpdateLeadModal({
  lead,
  onClose,
  onSaved,
}: {
  lead: Lead;
  onClose: () => void;
  onSaved: (lead: Lead) => void;
}) {
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSaving(true);
    const body = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const result = await api.updateQualification(lead.id, body as Record<string, unknown>);
      onSaved(result.lead as Lead);
      onClose();
    } catch (err: any) {
      alert(err.message || "Failed to update lead");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-slate-100 bg-white px-4 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="min-w-0 break-words text-base font-bold text-slate-950 sm:text-lg dark:text-white">Update Lead - {lead.name || lead.Name || "Lead"}</h2>
          <button onClick={onClose} className={buttonGhost}>Close</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Quality"><select name="quality" defaultValue={lead.quality || lead.Quality || "Awaiting Update"} className={selectCls}>{QUALITY_VALUES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
            <Field label="Quality Type"><select name="qualityType" defaultValue={lead.qualityType || lead["Quality Type"] || "Awaiting Update"} className={selectCls}>{QUALITY_TYPE_VALUES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
            <Field label="Lead Temperature"><select name="leadTemperature" defaultValue={lead.leadTemperature || lead.priority || "Warm"} className={selectCls}>{LEAD_TEMPERATURES.map((item) => <option key={item} value={item}>{item}</option>)}</select></Field>
            <Field label="Follow-up Type"><select name="followUpType" defaultValue="Call" className={selectCls}>{FOLLOW_UP_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}</select></Field>
            <Field label="Next Follow-up Date"><input name="nextFollowupDate" type="date" defaultValue={lead.nextFollowupDate || lead.nextFollowUp || ""} className={inputCls} /></Field>
            <Field label="Call Outcome"><input name="callOutcome" className={inputCls} placeholder="Connected, no answer, converted..." /></Field>
            <div className="sm:col-span-2"><Field label="Call Notes"><textarea name="callNotes" rows={3} className={inputCls} placeholder="Conversation summary, requirement, budget, objections..." /></Field></div>
            <div className="sm:col-span-2"><Field label="Internal Remarks"><textarea name="internalRemarks" rows={2} defaultValue={lead.internalRemarks || ""} className={inputCls} /></Field></div>
            <div className="sm:col-span-2"><Field label="Sales Remarks"><textarea name="salesRemarks" rows={2} defaultValue={lead.salesRemarks || ""} className={inputCls} /></Field></div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">Call History</p>
            <div className="mt-3 space-y-2">
              {(lead.callHistory || []).slice(-5).map((call) => (
                <div key={`${call.callNumber}-${call.date}`} className="rounded-xl bg-white p-3 text-sm dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-white">Call {call.callNumber} - {shortDate(call.date)}</p>
                  <p className="text-slate-500 dark:text-slate-400">{call.outcome || "No outcome"} - {call.notes || "No notes"}</p>
                </div>
              ))}
              {!(lead.callHistory || []).length && <p className="text-sm text-slate-500 dark:text-slate-400">No calls logged yet.</p>}
            </div>
          </div>
          <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={onClose} className={buttonSecondary}>Cancel</button>
            <button type="submit" disabled={saving} className={buttonPrimary}>{saving ? "Updating..." : "Update Lead"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label><span className={labelCls}>{label}</span>{children}</label>;
}
