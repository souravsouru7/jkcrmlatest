import store from "../models/store.js";

const STATUSES = ["Scheduled", "Completed", "Rescheduled", "Cancelled", "No Show"];

export function getSiteVisits(req, res) {
  const { status, leadId, date } = req.query;
  let visits = [...store.visits];

  if (status) visits = visits.filter((v) => v.status === status);
  if (leadId) visits = visits.filter((v) => v.leadId === Number(leadId));
  if (date) visits = visits.filter((v) => v.date === date);

  visits.sort((a, b) => b.date.localeCompare(a.date));
  return res.json({ visits, total: visits.length });
}

export function createSiteVisit(req, res) {
  const { leadId, date, address, notes, assignedTo } = req.body;

  if (!leadId || !date || !address) {
    return res.status(400).json({ error: "leadId, date and address are required" });
  }
  const lead = store.leads.find((l) => l.id === Number(leadId));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const visit = {
    id: Date.now(),
    leadId: Number(leadId),
    date: String(date),
    address: String(address).trim(),
    status: "Scheduled",
    notes: notes ? String(notes).trim() : "",
    assignedTo: assignedTo || req.user.name || "Sales Admin",
    createdAt: new Date().toISOString(),
  };

  store.visits.unshift(visit);

  lead.lastActivity = `Site visit scheduled for ${date}`;
  lead.stage = "Site Visit";
  lead.updatedAt = new Date().toISOString();

  return res.status(201).json(visit);
}

export function updateSiteVisit(req, res) {
  const visit = store.visits.find((v) => v.id === Number(req.params.id));
  if (!visit) return res.status(404).json({ error: "Site visit not found" });

  const allowed = ["date", "address", "status", "notes", "assignedTo"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) visit[key] = req.body[key];
  });

  if (req.body.status === "Completed") {
    const lead = store.leads.find((l) => l.id === visit.leadId);
    if (lead) {
      lead.lastActivity = `Site visit completed — ${visit.date}`;
      lead.updatedAt = new Date().toISOString();
    }
  }

  return res.json(visit);
}
