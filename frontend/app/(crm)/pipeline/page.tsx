"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { money, shortDate, STAGES } from "@/lib/utils";
import Badge from "@/components/Badge";
import type { Lead, Stage } from "@/lib/types";

const PIPELINE_STAGES: Stage[] = [
  "New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation",
];

const STAGE_COLOR: Record<string, string> = {
  "New Lead":    "bg-slate-500/10 text-slate-400 border-slate-500/20",
  "Contacted":   "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Qualified":   "bg-violet-500/10 text-violet-400 border-violet-500/20",
  "Site Visit":  "bg-amber-500/10 text-amber-400 border-amber-500/20",
  "Quotation":   "bg-orange-500/10 text-orange-400 border-orange-500/20",
  "Negotiation": "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [activeStage, setActiveStage] = useState<Stage>("New Lead");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.leads()
      .then((r) => setLeads((r as { leads: Lead[] }).leads))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function handleStage(id: number, stage: string) {
    await api.updateStage(id, stage).catch(() => {});
    setLeads((prev) => prev.map((l) => l.id === id ? { ...l, stage: stage as Stage } : l));
  }

  const stageLeads = leads.filter((l) => l.stage === activeStage);
  const stageValue = stageLeads.reduce((s, l) => s + l.budget, 0);
  const totalPipeline = leads
    .filter((l) => PIPELINE_STAGES.includes(l.stage))
    .reduce((s, l) => s + l.budget, 0);

  return (
    <div className="p-6 space-y-5 max-w-[1400px] mx-auto">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Pipeline</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {leads.filter((l) => PIPELINE_STAGES.includes(l.stage)).length} active leads ·{" "}
            <span className="text-teal-400 font-medium">{money(totalPipeline)}</span> total value
          </p>
        </div>
      </div>

      {/* Stage selector tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PIPELINE_STAGES.map((stage) => {
          const count = leads.filter((l) => l.stage === stage).length;
          const value = leads.filter((l) => l.stage === stage).reduce((s, l) => s + l.budget, 0);
          const isActive = activeStage === stage;
          return (
            <button
              key={stage}
              onClick={() => setActiveStage(stage)}
              className={`shrink-0 flex flex-col items-start px-4 py-3 rounded-xl border text-left transition min-w-[130px] ${
                isActive
                  ? `${STAGE_COLOR[stage]} border-current`
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <span className="text-xs font-semibold">{stage}</span>
              <div className="flex items-center gap-2 mt-1.5">
                <span className={`text-lg font-bold leading-none ${isActive ? "" : "text-white"}`}>{count}</span>
                <span className="text-[10px] opacity-70">{money(value)}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Stage summary bar */}
      <div className={`flex items-center justify-between rounded-xl border px-5 py-4 ${STAGE_COLOR[activeStage] || "bg-slate-900 border-slate-800"}`}>
        <div>
          <p className="font-semibold text-white text-base">{activeStage}</p>
          <p className="text-slate-400 text-sm mt-0.5">{stageLeads.length} lead{stageLeads.length !== 1 ? "s" : ""} in this stage</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 mb-0.5">Stage value</p>
          <p className="font-bold text-teal-400 text-xl">{money(stageValue)}</p>
        </div>
      </div>

      {/* Lead cards grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-900 border border-slate-800 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : stageLeads.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 border-dashed rounded-xl p-14 text-center">
          <p className="text-slate-600 text-sm">No leads in {activeStage}</p>
          <p className="text-slate-700 text-xs mt-1">Move leads here from other stages</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {stageLeads.map((lead) => (
            <div key={lead.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-colors">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 font-bold text-xs shrink-0">
                    {lead.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-white text-sm leading-none">{lead.name}</p>
                    <p className="text-slate-500 text-xs mt-1">{lead.project} · {lead.location}</p>
                  </div>
                </div>
                <Badge value={lead.priority} className="shrink-0 text-[10px]" />
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className="font-bold text-teal-400 text-base">{money(lead.budget)}</span>
                {lead.nextFollowUp && (
                  <span className="text-slate-500 text-xs">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-3.5 h-3.5 inline mr-1 -mt-0.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                    </svg>
                    {shortDate(lead.nextFollowUp)}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                <span className="text-slate-600 text-xs shrink-0">Move to:</span>
                <select
                  value={lead.stage}
                  onChange={(e) => handleStage(lead.id, e.target.value)}
                  className="flex-1 bg-transparent text-teal-400 text-xs font-semibold outline-none py-0.5 cursor-pointer hover:text-teal-300 transition"
                >
                  {STAGES.map((s) => (
                    <option key={s} value={s} className="bg-slate-900 text-white">{s}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
