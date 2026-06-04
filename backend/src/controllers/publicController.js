import store from "../models/store.js";
import { config } from "../config/env.js";

const STAGES = ["New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation", "Won", "Lost"];
const PRIORITIES = ["Hot", "Warm", "Cold"];
const SOURCES = ["Website", "Instagram", "Facebook Ads", "WhatsApp", "Phone Call", "Walk-in", "Referral", "Marketplace", "Google Sheet", "Other"];

const SHEET_SECRET = config.sheetWebhookSecret;

const hits = new Map();
const LIMIT = 10; 

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

// Exact column mappings for JK Interiors sheet + common fallbacks
const FIELD_MAP = {
  date:     ["date", "submitted at", "created date", "lead date"],
  name:     ["name", "full name", "client name", "customer name", "customer", "client"],
  phone:    ["phone number", "phone", "mobile number", "mobile", "contact number", "contact", "whatsapp", "whatsapp number"],
  email:    ["email", "email address", "mail"],
  dob:      ["dob", "date of birth", "birth date"],
  location: ["which location is your property in?", "location", "city", "area", "address"],
  project:  ["what type of home do you have?", "project type", "project", "service", "type"],
  budget:   ["what is your estimated interior budget?", "estimated interior budget", "budget range", "budget"],
  platform: ["platform", "lead source", "source"],
  quality:  ["quality"],
  qualityType: ["quality type"],
  isPositive: ["is positive"],
  siteVisit:  ["is site visit done"],
  calledBy:   ["called by"],
  campaign:   ["campaign name"],
  adset:      ["adset name"],
  adName:     ["ad name"],
  comments:   ["initial comments", "comments", "notes", "message", "requirements", "details"],
  call1:       ["call 1"],
  call2:       ["call 2"],
  call3:       ["call 3"],
  call4:       ["call 4"],
  call5:       ["call 5"],
  call6:       ["call 6"],
};

function normalizeValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim();
}

function resolveFields(row) {
  const normalized = {};
  for (const [key, val] of Object.entries(row)) {
    const k = key.toLowerCase().trim();
    for (const [field, variants] of Object.entries(FIELD_MAP)) {
      if (variants.some((v) => k === v || k.includes(v))) {
        const value = normalizeValue(val);
        if (normalized[field] === undefined && value) normalized[field] = value;
        break;
      }
    }
  }
  return normalized;
}

// Map Platform column values → CRM source values
function mapPlatform(platform) {
  if (!platform) return "Google Sheet";
  const p = String(platform).toLowerCase().trim();
  if (p.includes("instagram")) return "Instagram";
  if (p.includes("facebook") || p.includes("fb")) return "Facebook Ads";
  if (p.includes("whatsapp")) return "WhatsApp";
  if (p.includes("phone") || p.includes("call")) return "Phone Call";
  if (p.includes("referral") || p.includes("refer")) return "Referral";
  if (p.includes("marketplace")) return "Marketplace";
  if (p.includes("google") || p.includes("website")) return "Website";
  return "Google Sheet";
}

// Map Quality / Is Positive → CRM priority
function mapPriority(quality, isPositive) {
  const q = String(quality || "").toLowerCase().trim();
  const pos = String(isPositive || "").toLowerCase().trim();
  if (q === "hot" || pos === "yes" || pos === "true" || pos === "1") return "Hot";
  if (q === "cold") return "Cold";
  return "Warm";
}

function parseSheetDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function googleSheetWebhook(req, res) {
  const secret = req.headers["x-sheet-secret"] || req.query.secret;
  if (secret !== SHEET_SECRET) {
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  const { row, sheetName } = req.body;
  if (!row || typeof row !== "object") {
    return res.status(400).json({ error: "Missing row data" });
  }

  const f = resolveFields(row);

  if (!f.name || !f.phone) {
    return res.status(400).json({ error: "Row must have at least Name and Phone Number columns" });
  }

  const phone = String(f.phone).trim();
  const existingLead = store.leads.find((lead) => String(lead.phone).trim() === phone);
  if (existingLead) {
    return res.status(200).json({
      success: true,
      leadId: existingLead.id,
      message: "Lead already exists in CRM",
    });
  }

  const noteParts = [];
  if (f.date) noteParts.push(`Sheet Date: ${f.date}`);
  if (f.dob) noteParts.push(`DOB: ${f.dob}`);
  if (f.quality) noteParts.push(`Quality: ${f.quality}`);
  if (f.qualityType) noteParts.push(`Quality Type: ${f.qualityType}`);
  if (f.comments) noteParts.push(`Initial Comments: ${f.comments}`);
  ["call1", "call2", "call3", "call4", "call5", "call6"].forEach((key, index) => {
    if (f[key]) noteParts.push(`Call ${index + 1}: ${f[key]}`);
  });
  if (f.campaign) noteParts.push(`Campaign: ${f.campaign}`);
  if (f.adset)    noteParts.push(`Adset: ${f.adset}`);
  if (f.adName)   noteParts.push(`Ad: ${f.adName}`);

  // Stage: promote to Site Visit if already done
  const siteVisitDone = String(f.siteVisit || "").toLowerCase().trim();
  const stage = (siteVisitDone === "yes" || siteVisitDone === "true" || siteVisitDone === "1")
    ? "Site Visit"
    : "New Lead";

  const now = new Date().toISOString();
  const createdAt = parseSheetDate(f.date) || now;

  const lead = {
    id: Date.now(),
    name:     String(f.name).trim(),
    phone,
    email:    f.email    ? String(f.email).trim()    : "",
    location: f.location ? String(f.location).trim() : "",
    source:   mapPlatform(f.platform),
    project:  f.project  ? String(f.project).trim()  : "",
    budget:   Number(String(f.budget || "0").replace(/[^0-9.]/g, "")) || 0,
    stage,
    priority: mapPriority(f.quality, f.isPositive),
    owner:    f.calledBy ? String(f.calledBy).trim() : "Sales Admin",
    nextFollowUp: null,
    lastActivity: `Lead synced from Google Sheet${sheetName ? ` (${sheetName})` : ""}`,
    notes:    noteParts.join(" | "),
    lostReason: null,
    createdAt,
    updatedAt: now,
  };

  store.leads.unshift(lead);

  store.followUps.unshift({
    id: Date.now() + 1,
    leadId: lead.id,
    type: "First Call",
    due: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    status: "Pending",
    outcome: "Lead from Google Sheet",
    notes: "",
    createdAt: now,
  });

  console.log(`[Google Sheet Sync] New lead: ${lead.name} (${lead.phone}) | source: ${lead.source} | priority: ${lead.priority}`);
  return res.status(201).json({ success: true, leadId: lead.id, message: "Lead created from Google Sheet" });
}
