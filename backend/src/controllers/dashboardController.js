import store from "../models/store.js";

export function getDashboard(_req, res) {
  const today = new Date().toISOString().slice(0, 10);

  const positiveQuality = (lead) => (lead.quality || lead.Quality || "") === "Positive";
  const qualityValue = (lead) => lead.quality || lead.Quality || "Awaiting Update";
  const qualityTypeValue = (lead) => lead.qualityType || lead["Quality Type"] || "Awaiting Update";
  const temperatureValue = (lead) => lead.leadTemperature || lead.priority || "Warm";
  const activeLeads = store.leads.filter((l) => positiveQuality(l) && !["Won", "Lost"].includes(l.stage));
  const wonLeads = store.leads.filter((l) => l.stage === "Won");
  const positiveLeads = store.leads.filter((l) => qualityValue(l) === "Positive");
  const negativeLeads = store.leads.filter((l) => qualityValue(l) === "Negative");
  const awaitingUpdateLeads = store.leads.filter((l) => qualityValue(l) === "Awaiting Update");
  const convertedLeads = store.leads.filter((l) => l.stage === "Won" || qualityTypeValue(l) === "Converted");

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

  const breakdown = (name, getter) =>
    [...new Set(store.leads.map(getter))].filter(Boolean).map((value) => ({
      [name]: value,
      count: store.leads.filter((lead) => getter(lead) === value).length,
    }));

  const qualityBreakdown = breakdown("quality", qualityValue);
  const qualityTypeBreakdown = breakdown("qualityType", qualityTypeValue);
  const temperatureBreakdown = breakdown("temperature", temperatureValue);
  const salesExecutiveBreakdown = breakdown("salesExecutive", (lead) => lead.owner || "Sales Admin");

  return res.json({
    summary: {
      totalLeads: store.leads.length,
      activeLeads: activeLeads.length,
      positiveLeads: positiveLeads.length,
      negativeLeads: negativeLeads.length,
      hotLeads: store.leads.filter((l) => temperatureValue(l) === "Hot").length,
      warmLeads: store.leads.filter((l) => temperatureValue(l) === "Warm").length,
      coldLeads: store.leads.filter((l) => temperatureValue(l) === "Cold").length,
      awaitingUpdate: awaitingUpdateLeads.length,
      convertedLeads: convertedLeads.length,
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
    qualityBreakdown,
    qualityTypeBreakdown,
    temperatureBreakdown,
    salesExecutiveBreakdown,
    leads: store.leads,
    priorityLeads: store.leads.filter((l) => temperatureValue(l) === "Hot" && positiveQuality(l) && !["Won", "Lost"].includes(l.stage)),
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
