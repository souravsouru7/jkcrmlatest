import store from "../models/store.js";

const STAGES = ["New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation", "Won", "Lost"];
const PRIORITIES = ["Hot", "Warm", "Cold"];

export function getLeads(req, res) {
  const { stage, priority, search } = req.query;
  let leads = [...store.leads];

  if (stage) leads = leads.filter((l) => l.stage === stage);
  if (priority) leads = leads.filter((l) => l.priority === priority);
  if (search) {
    const term = String(search).toLowerCase();
    leads = leads.filter((l) =>
      [l.name, l.phone, l.location, l.source, l.project, l.stage].join(" ").toLowerCase().includes(term)
    );
  }

  return res.json({ leads, total: leads.length });
}

export function getLeadById(req, res) {
  const lead = store.leads.find((l) => l.id === Number(req.params.id));
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  return res.json(lead);
}

export function createLead(req, res) {
  const { name, phone, location, source, project, budget, stage, priority, nextFollowUp, notes, email } = req.body;

  if (!name || !phone || !location || !source || !project) {
    return res.status(400).json({ error: "name, phone, location, source and project are required" });
  }

  const now = new Date().toISOString();
  const lead = {
    id: Date.now(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : "",
    location: String(location).trim(),
    source: String(source).trim(),
    project: String(project).trim(),
    budget: Number(budget) || 0,
    stage: STAGES.includes(stage) ? stage : "New Lead",
    priority: PRIORITIES.includes(priority) ? priority : "Warm",
    owner: req.user.name || "Sales Admin",
    nextFollowUp: nextFollowUp || null,
    lastActivity: "Lead created",
    notes: notes ? String(notes).trim() : "",
    lostReason: null,
    createdAt: now,
    updatedAt: now,
  };

  store.leads.unshift(lead);

  // Auto-create first follow-up
  store.followUps.unshift({
    id: Date.now() + 1,
    leadId: lead.id,
    type: "First Call",
    due: lead.nextFollowUp,
    status: "Pending",
    outcome: "Qualify requirement and budget",
    notes: "",
    createdAt: now,
  });

  return res.status(201).json(lead);
}

export function updateLead(req, res) {
  const lead = store.leads.find((l) => l.id === Number(req.params.id));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const allowed = ["name", "phone", "email", "location", "source", "project", "budget", "priority", "owner", "nextFollowUp", "notes", "lostReason"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) lead[key] = req.body[key];
  });
  lead.updatedAt = new Date().toISOString();

  return res.json(lead);
}

export function updateStage(req, res) {
  const lead = store.leads.find((l) => l.id === Number(req.params.id));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const { stage, lostReason } = req.body;
  if (!STAGES.includes(stage)) return res.status(400).json({ error: "Invalid stage" });

  lead.stage = stage;
  lead.lastActivity = `Moved to ${stage}`;
  if (stage === "Lost" && lostReason) lead.lostReason = lostReason;
  lead.updatedAt = new Date().toISOString();

  return res.json(lead);
}

export function deleteLead(req, res) {
  const idx = store.leads.findIndex((l) => l.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: "Lead not found" });
  store.leads.splice(idx, 1);
  return res.json({ message: "Lead deleted" });
}
