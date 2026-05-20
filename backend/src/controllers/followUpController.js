import store from "../models/store.js";

const TYPES = ["Call", "WhatsApp", "Email", "Site Visit", "Quotation Discussion", "First Call", "Booking Call", "Other"];
const STATUSES = ["Pending", "Completed", "Overdue"];

export function getFollowUps(req, res) {
  const { status, leadId } = req.query;
  let followUps = [...store.followUps];

  if (status) followUps = followUps.filter((f) => f.status === status);
  if (leadId) followUps = followUps.filter((f) => f.leadId === Number(leadId));

  followUps.sort((a, b) => (a.due || "").localeCompare(b.due || ""));
  return res.json({ followUps, total: followUps.length });
}

export function createFollowUp(req, res) {
  const { leadId, type, due, outcome, notes } = req.body;

  if (!leadId || !due) {
    return res.status(400).json({ error: "leadId and due date are required" });
  }
  const lead = store.leads.find((l) => l.id === Number(leadId));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const followUp = {
    id: Date.now(),
    leadId: Number(leadId),
    type: TYPES.includes(type) ? type : "Call",
    due: String(due),
    status: "Pending",
    outcome: outcome ? String(outcome).trim() : "",
    notes: notes ? String(notes).trim() : "",
    createdAt: new Date().toISOString(),
  };

  store.followUps.unshift(followUp);

  // Update lead's next follow-up date
  lead.nextFollowUp = due;
  lead.updatedAt = new Date().toISOString();

  return res.status(201).json(followUp);
}

export function completeFollowUp(req, res) {
  const followUp = store.followUps.find((f) => f.id === Number(req.params.id));
  if (!followUp) return res.status(404).json({ error: "Follow-up not found" });

  followUp.status = "Completed";
  followUp.outcome = req.body.outcome ? String(req.body.outcome).trim() : followUp.outcome;
  followUp.completedAt = new Date().toISOString();

  const lead = store.leads.find((l) => l.id === followUp.leadId);
  if (lead) {
    lead.lastActivity = `Follow-up completed: ${followUp.type}`;
    lead.updatedAt = new Date().toISOString();
  }

  return res.json(followUp);
}

export function updateFollowUp(req, res) {
  const followUp = store.followUps.find((f) => f.id === Number(req.params.id));
  if (!followUp) return res.status(404).json({ error: "Follow-up not found" });

  const allowed = ["type", "due", "status", "outcome", "notes"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) followUp[key] = req.body[key];
  });

  return res.json(followUp);
}
