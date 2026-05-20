import store from "../models/store.js";
import { config } from "../config/env.js";

const STAGES = ["New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation", "Won", "Lost"];
const PRIORITIES = ["Hot", "Warm", "Cold"];
const SOURCES = ["Website", "Instagram", "Facebook Ads", "WhatsApp", "Phone Call", "Walk-in", "Referral", "Marketplace", "Other"];

// Rate limit: simple in-memory counter per IP (resets on server restart)
const hits = new Map();
const LIMIT = 10; // max 10 submissions per IP per hour

function isRateLimited(ip) {
  const now = Date.now();
  const entry = hits.get(ip) || { count: 0, reset: now + 3600000 };
  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + 3600000;
  }
  entry.count += 1;
  hits.set(ip, entry);
  return entry.count > LIMIT;
}

export function submitLead(req, res) {
  // API key check
  const key = req.headers["x-api-key"] || req.query.key;
  if (key !== config.publicApiKey) {
    return res.status(401).json({ error: "Invalid API key" });
  }

  // Rate limit
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many submissions. Please try again later." });
  }

  const { name, phone, email, location, source, project, budget, message } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  const now = new Date().toISOString();
  const lead = {
    id: Date.now(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : "",
    location: location ? String(location).trim() : "",
    source: SOURCES.includes(source) ? source : "Website",
    project: project ? String(project).trim() : "",
    budget: Number(budget) || 0,
    stage: "New Lead",
    priority: "Warm",
    owner: "Sales Admin",
    nextFollowUp: null,
    lastActivity: "Lead from website enquiry form",
    notes: message ? String(message).trim() : "",
    lostReason: null,
    createdAt: now,
    updatedAt: now,
  };

  store.leads.unshift(lead);

  // Auto first follow-up
  store.followUps.unshift({
    id: Date.now() + 1,
    leadId: lead.id,
    type: "First Call",
    due: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // tomorrow
    status: "Pending",
    outcome: "First contact from website enquiry",
    notes: "",
    createdAt: now,
  });

  return res.status(201).json({ success: true, message: "Thank you! We will contact you shortly." });
}
