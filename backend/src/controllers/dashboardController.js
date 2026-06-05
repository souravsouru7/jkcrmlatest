import store from "../models/store.js";

export function getDashboard(_req, res) {
  const today = new Date().toISOString().slice(0, 10);

  const activeLeads = store.leads.filter((l) => !["Won", "Lost"].includes(l.stage));
  const wonLeads = store.leads.filter((l) => l.stage === "Won");

  const pipelineValue = activeLeads.reduce((s, l) => s + l.budget, 0);
  const wonValue = wonLeads.reduce((s, l) => s + l.budget, 0);
  const quoteValue = store.quotations.reduce((s, q) => s + q.amount, 0);

  const overdue = store.followUps.filter((f) => f.status === "Overdue").length;
  const pending = store.followUps.filter((f) => f.status === "Pending").length;
  const visitsToday = store.visits.filter((v) => v.date === today).length;

  const conversion = store.leads.length
    ? Math.round((wonLeads.length / store.leads.length) * 100)
    : 0;

  const stageBreakdown = ["New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation", "Won", "Lost"].map(
    (stage) => {
      const stageLeads = store.leads.filter((l) => l.stage === stage);
      return { stage, count: stageLeads.length, value: stageLeads.reduce((s, l) => s + l.budget, 0) };
    }
  );

  const sourceBreakdown = [...new Set(store.leads.map((l) => l.source))].map((source) => ({
    source,
    count: store.leads.filter((l) => l.source === source).length,
  }));

  return res.json({
    summary: {
      totalLeads: store.leads.length,
      activeLeads: activeLeads.length,
      pipelineValue,
      wonValue,
      quoteValue,
      overdue,
      pending,
      visitsToday,
      conversion,
    },
    stageBreakdown,
    sourceBreakdown,
    leads: store.leads,
    priorityLeads: store.leads.filter((l) => l.priority === "Hot" && !["Won", "Lost"].includes(l.stage)),
    upcomingFollowUps: store.followUps
      .filter((f) => f.status === "Pending")
      .sort((a, b) => (a.due || "").localeCompare(b.due || ""))
      .slice(0, 5),
  });
}

export function getCrmData(_req, res) {
  return res.json({
    leads: store.leads,
    followUps: store.followUps,
    visits: store.visits,
    quotations: store.quotations,
  });
}
