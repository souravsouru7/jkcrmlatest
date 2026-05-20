import store from "../models/store.js";

export function getReminders(_req, res) {
  const today = new Date().toISOString().slice(0, 10);
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const oneDayAgo = new Date(Date.now() - 86400000).toISOString();

  // Build leadId → lead name map
  const leadMap = Object.fromEntries(store.leads.map((l) => [l.id, l.name]));

  // Overdue follow-ups (Pending and due date before today)
  const overdue = store.followUps
    .filter((f) => f.status === "Pending" && f.due < today)
    .map((f) => ({
      id: f.id,
      leadId: f.leadId,
      leadName: leadMap[f.leadId] || "Unknown",
      type: f.type,
      due: f.due,
      daysOverdue: Math.floor((Date.now() - new Date(f.due).getTime()) / 86400000),
    }));

  // Due today
  const dueToday = store.followUps
    .filter((f) => f.status === "Pending" && f.due === today)
    .map((f) => ({
      id: f.id,
      leadId: f.leadId,
      leadName: leadMap[f.leadId] || "Unknown",
      type: f.type,
      due: f.due,
    }));

  // Stale leads — no update in 7+ days, not Won or Lost
  const staleLeads = store.leads
    .filter(
      (l) =>
        l.updatedAt < sevenDaysAgo &&
        l.stage !== "Won" &&
        l.stage !== "Lost"
    )
    .map((l) => ({
      id: l.id,
      name: l.name,
      stage: l.stage,
      priority: l.priority,
      daysSinceActivity: Math.floor((Date.now() - new Date(l.updatedAt).getTime()) / 86400000),
    }));

  // New website leads in the last 24 hours
  const newWebLeads = store.leads
    .filter((l) => l.source === "Website" && l.createdAt > oneDayAgo)
    .map((l) => ({
      id: l.id,
      name: l.name,
      phone: l.phone,
      project: l.project,
      createdAt: l.createdAt,
    }));

  const total = overdue.length + dueToday.length + staleLeads.length + newWebLeads.length;

  res.json({ total, overdue, dueToday, staleLeads, newWebLeads });
}
