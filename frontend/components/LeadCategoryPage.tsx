"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { shortDate } from "@/lib/utils";
import Badge from "@/components/Badge";
import { EmptyState, PageHeader, Section, Skeleton, buttonSecondary, pageWrap } from "@/components/CrmDesign";
import type { Lead } from "@/lib/types";
import { normalizePhone } from "@/components/LeadDetailDrawer";
import UpdateLeadModal from "@/components/UpdateLeadModal";

export default function LeadCategoryPage({
  title,
  subtitle,
  quality,
}: {
  title: string;
  subtitle: string;
  quality: string;
}) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [updatingLead, setUpdatingLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.leads({ quality })
      .then((r) => setLeads((r as { leads: Lead[] }).leads))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, [quality]);

  return (
    <div className={pageWrap}>
      <PageHeader eyebrow="Lead qualification" title={title} subtitle={`${leads.length} leads - ${subtitle}`} />
      <Section title={title} subtitle="Leads are routed here from the Update Lead workflow.">
        {loading ? (
          <div className="space-y-3 p-5">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : leads.length === 0 ? (
          <EmptyState title={`No ${title.toLowerCase()} found`} />
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 lg:grid-cols-2 xl:grid-cols-3">
            {leads.map((lead) => (
              <article key={lead.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-950 dark:text-white">{lead.name || lead.Name || "No Name"}</p>
                    <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{lead.project || lead["What type of home do you have?"] || "No project"} - {lead.location || lead["Which location is your property in?"] || "No location"}</p>
                  </div>
                  <Badge value={lead.leadTemperature || lead.priority || "Warm"} />
                </div>
                <div className="mt-4 grid grid-cols-1 gap-3 text-xs sm:grid-cols-2">
                  <Info label="Quality Type" value={lead.qualityType || lead["Quality Type"] || "-"} />
                  <Info label="Calls" value={String(lead.callCount || 0)} />
                  <Info label="Last Call" value={shortDate(lead.lastCallDate)} />
                  <Info label="Next Follow-up" value={shortDate(lead.nextFollowupDate || lead.nextFollowUp)} />
                </div>
                {lead.salesRemarks && <p className="mt-4 rounded-xl bg-slate-50 p-3 text-sm text-slate-600 dark:bg-slate-900 dark:text-slate-300">{lead.salesRemarks}</p>}
                <div className="mt-5 flex flex-wrap gap-2">
                  {lead.phone && <a href={`tel:${lead.phone}`} className={buttonSecondary}>Call</a>}
                  {lead.phone && <a href={`https://wa.me/${normalizePhone(lead.phone)}`} className={buttonSecondary}>WhatsApp</a>}
                  <button onClick={() => setUpdatingLead(lead)} className={buttonSecondary}>Update Lead</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
      {updatingLead && (
        <UpdateLeadModal
          lead={updatingLead}
          onClose={() => setUpdatingLead(null)}
          onSaved={(updated) => setLeads((prev) => prev.map((lead) => lead.id === updated.id ? updated : lead).filter((lead) => (lead.quality || lead.Quality || "") === quality))}
        />
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-900">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
