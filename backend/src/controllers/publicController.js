import store, { persistFollowUp, persistLead } from "../models/store.js";
import crypto from "crypto";
import { config } from "../config/env.js";
import { LeadModel } from "../models/mongo.js";

const STAGES = ["New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation", "Won", "Lost"];
const PRIORITIES = ["Hot", "Warm", "Cold"];
const SOURCES = ["Website", "Instagram", "Facebook Ads", "WhatsApp", "Phone Call", "Walk-in", "Referral", "Marketplace", "Google Sheet", "Other"];
const QUALITY_VALUES = ["Positive", "Negative", "Can't Say", "Awaiting Update", "N/A", "#N/A"];
const QUALITY_TYPE_VALUES = [
  "Out of Hyderabad",
  "Out of hyderabad",
  "No Answer on Call/Msg",
  "No answer on call/msg",
  "No Requirements",
  "No requirements",
  "Vendor/Contractors",
  "Handover More Than 3 Months",
  "Handover more than 3 months",
  "Invalid Number",
  "Invalid /Number not working",
  "Requirements Gathered",
  "Awaiting Update",
  "Requirement Scheduled",
  "Duplicate",
  "Property Renovation",
  "Property Rennovation",
  "Package Shared",
  "Out Of Budget",
  "Booked From Others",
  "Booked from Others",
  "Not In Scope",
  "Quote Shared - Lost",
  "Quote Shared- Lost",
  "Quote Shared - Awaiting Update",
  "quote shared-Awaiting Update",
  "Converted",
];

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

export async function submitLead(req, res) {
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

  const name = req.body.Name || req.body.name;
  const phone = req.body["Phone Number"] || req.body.phone;
  const email = req.body.Email || req.body.email || "";
  const location = req.body["Which location is your property in?"] || req.body.location || "";
  const project = req.body["What type of home do you have?"] || req.body.project || "";
  const budget = req.body["What is your estimated interior budget?"] || req.body.budget || "";
  const message = req.body["Initial Comments"] || req.body.message || "";
  const quality = req.body.Quality || "Awaiting Update";
  const qualityType = req.body["Quality Type"] || "Awaiting Update";
  const source = req.body.source;

  if (!name || !phone) {
    return res.status(400).json({ error: "Name and phone are required" });
  }

  const now = new Date().toISOString();
  const normalizedQuality = cleanQuality(quality);
  const normalizedQualityType = QUALITY_TYPE_VALUES.includes(qualityType) ? qualityType : String(qualityType).trim();
  const lead = {
    id: Date.now(),
    Date: req.body.Date || "",
    Email: String(email).trim(),
    Name: String(name).trim(),
    "Phone Number": String(phone).trim(),
    DOB: req.body.DOB || "",
    "What type of home do you have?": project ? String(project).trim() : "",
    "What is your estimated interior budget?": budget ? String(budget).trim() : "",
    "Which location is your property in?": location ? String(location).trim() : "",
    Quality: normalizedQuality,
    "Quality Type": normalizedQualityType,
    "Initial Comments": message ? String(message).trim() : "",
    "Call 1": req.body["Call 1"] || "",
    "Call 2": req.body["Call 2"] || "",
    "Call 3": req.body["Call 3"] || "",
    "Call 4": req.body["Call 4"] || "",
    "Call 5": req.body["Call 5"] || "",
    name: String(name).trim(),
    phone: String(phone).trim(),
    email: email ? String(email).trim() : "",
    location: location ? String(location).trim() : "",
    source: SOURCES.includes(source) ? source : "Website",
    project: project ? String(project).trim() : "",
    budget: 0,
    estimatedBudget: budget ? String(budget).trim() : "",
    sheetDate: req.body.Date || "",
    dob: req.body.DOB || "",
    quality: normalizedQuality,
    qualityType: normalizedQualityType,
    leadTemperature: "Warm",
    callCount: 0,
    callHistory: [],
    lastCallDate: null,
    nextFollowupDate: null,
    internalRemarks: "",
    salesRemarks: "",
    initialComments: message ? String(message).trim() : "",
    call1: req.body["Call 1"] || "",
    call2: req.body["Call 2"] || "",
    call3: req.body["Call 3"] || "",
    call4: req.body["Call 4"] || "",
    call5: req.body["Call 5"] || "",
    stage: "New Lead",
    priority: "Warm",
    owner: "Sales Admin",
    nextFollowUp: null,
    lastActivity: "Lead from website enquiry form",
    notes: message ? String(message).trim() : "",
    lostReason: null,
    auditHistory: [
      {
        id: Date.now(),
        action: "Lead created from website",
        changedBy: "Website",
        role: "public",
        changes: { source: SOURCES.includes(source) ? source : "Website", stage: "New Lead" },
        createdAt: now,
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  store.leads.unshift(lead);

  // Auto first follow-up
  const followUp = {
    id: Date.now() + 1,
    leadId: lead.id,
    type: "First Call",
    due: new Date(Date.now() + 86400000).toISOString().slice(0, 10), // tomorrow
    status: "Pending",
    outcome: "First contact from website enquiry",
    notes: "",
    createdAt: now,
  };
  store.followUps.unshift(followUp);

  await Promise.all([persistLead(lead), persistFollowUp(followUp)]);

  return res.status(201).json({ success: true, message: "Thank you! We will contact you shortly." });
}

// Exact column mappings for JK Interiors lead sheet
const FIELD_MAP = {
  date: ["date"],
  email: ["email"],
  name: ["name"],
  phone: ["phone number"],
  dob: ["dob"],
  project: ["what type of home do you have?"],
  budget: ["what is your estimated interior budget?"],
  location: ["which location is your property in?"],
  quality: ["quality"],
  qualityType: ["quality type"],
  comments: ["initial comments"],
  call1: ["call 1"],
  call2: ["call 2"],
  call3: ["call 3"],
  call4: ["call 4"],
  call5: ["call 5"],
  platform: ["platform", "source"],
  campaign: ["campaign_name", "campaign name", "campaign"],
  ad: ["ad_name", "ad name"],
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
      if (variants.some((v) => k === v)) {
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
  if (p.includes("instagram") || p === "ig") return "Instagram";
  if (p.includes("facebook") || p.includes("fb")) return "Facebook Ads";
  if (p.includes("whatsapp")) return "WhatsApp";
  if (p.includes("phone") || p.includes("call")) return "Phone Call";
  if (p.includes("referral") || p.includes("refer")) return "Referral";
  if (p.includes("marketplace")) return "Marketplace";
  if (p.includes("google") || p.includes("website")) return "Website";
  return "Google Sheet";
}

// Rows from the Meta Ads tab are Facebook leads unless a Platform column says otherwise.
function resolveSheetSource(platform, sheetName) {
  if (platform) return mapPlatform(platform);
  if (/meta|facebook/i.test(sheetName || "")) return "Facebook Ads";
  return "Google Sheet";
}

// Map Quality / Is Positive → CRM priority
function mapPriority(quality, isPositive) {
  const q = String(quality || "").toLowerCase().trim();
  const pos = String(isPositive || "").toLowerCase().trim();
  if (q === "hot" || pos === "yes" || pos === "true" || pos === "1") return "Hot";
  if (q === "cold" || q === "negative" || pos === "no" || pos === "false" || pos === "0") return "Cold";
  return "Warm";
}

function cleanQuality(value) {
  if (value === "#N/A") return "N/A";
  return QUALITY_VALUES.includes(value) ? value : String(value || "Awaiting Update").trim();
}

function parseSheetDate(value) {
  if (!value) return null;
  const text = String(value).trim();
  const ddmmyyyy = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (ddmmyyyy) {
    const [, day, month, year] = ddmmyyyy;
    const parsed = new Date(Number(year), Number(month) - 1, Number(day));
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export async function googleSheetWebhook(req, res) {
  const secret = req.headers["x-sheet-secret"] || req.query.secret;
  if (secret !== SHEET_SECRET) {
    return res.status(401).json({ error: "Invalid webhook secret" });
  }

  const { row, sheetName } = req.body;
  if (!row || typeof row !== "object") {
    return res.status(400).json({ error: "Missing row data" });
  }
  const result = await importLeadRow(row, { sheetName, label: "Google Sheet" });
  return res.status(result.status).json(result.body);
}

function reply(status, body) {
  return { status, body };
}

// Shared by the Google Sheet and Facebook webhooks: de-dupes by phone, creates the lead and its first follow-up.
async function importLeadRow(row, { sheetName, label }) {

  const f = resolveFields(row);
  const source = resolveSheetSource(f.platform, sheetName);

  if (!f.name || !f.phone) {
    return reply(400, { error: "Row must have at least Name and Phone Number columns" });
  }

  const phone = String(f.phone).trim();
  // Check Mongo too: another backend process (e.g. during a restart) may have just saved this lead.
  const existingLead = store.leads.find((lead) => String(lead.phone).trim() === phone)
    || await LeadModel.findOne({ phone }, { id: 1 }).lean();
  if (existingLead) {
    return reply(200, {
      success: true,
      leadId: existingLead.id,
      message: "Lead already exists in CRM",
    });
  }

  const noteParts = [];
  if (f.campaign) noteParts.push(`Campaign: ${f.campaign}`);
  if (f.ad) noteParts.push(`Ad: ${f.ad}`);
  if (f.date) noteParts.push(`Sheet Date: ${f.date}`);
  if (f.dob) noteParts.push(`DOB: ${f.dob}`);
  if (f.budget) noteParts.push(`Estimated Budget: ${f.budget}`);
  if (f.quality) noteParts.push(`Quality: ${f.quality}`);
  if (f.qualityType) noteParts.push(`Quality Type: ${f.qualityType}`);
  if (f.comments) noteParts.push(`Initial Comments: ${f.comments}`);
  ["call1", "call2", "call3", "call4", "call5"].forEach((key, index) => {
    if (f[key]) noteParts.push(`Call ${index + 1}: ${f[key]}`);
  });

  const now = new Date().toISOString();
  const createdAt = parseSheetDate(f.date) || now;
  const normalizedQuality = cleanQuality(f.quality);
  const normalizedQualityType = f.quality ? normalizeValue(f.qualityType) : normalizeValue(f.qualityType);

  const lead = {
    id: Date.now(),
    Date: f.date ? String(f.date).trim() : "",
    Email: f.email ? String(f.email).trim() : "",
    Name: String(f.name).trim(),
    "Phone Number": phone,
    DOB: f.dob ? String(f.dob).trim() : "",
    "What type of home do you have?": f.project ? String(f.project).trim() : "",
    "What is your estimated interior budget?": f.budget ? String(f.budget).trim() : "",
    "Which location is your property in?": f.location ? String(f.location).trim() : "",
    Quality: normalizedQuality,
    "Quality Type": normalizedQualityType,
    "Initial Comments": f.comments ? String(f.comments).trim() : "",
    "Call 1": f.call1 ? String(f.call1).trim() : "",
    "Call 2": f.call2 ? String(f.call2).trim() : "",
    "Call 3": f.call3 ? String(f.call3).trim() : "",
    "Call 4": f.call4 ? String(f.call4).trim() : "",
    "Call 5": f.call5 ? String(f.call5).trim() : "",
    name:     String(f.name).trim(),
    phone,
    email:    f.email    ? String(f.email).trim()    : "",
    location: f.location ? String(f.location).trim() : "",
    source,
    campaign: f.campaign || "",
    adName: f.ad || "",
    project:  f.project  ? String(f.project).trim()  : "",
    budget:   0,
    estimatedBudget: f.budget ? String(f.budget).trim() : "",
    sheetDate: f.date ? String(f.date).trim() : "",
    dob: f.dob ? String(f.dob).trim() : "",
    quality: normalizedQuality,
    qualityType: normalizedQualityType,
    leadTemperature: mapPriority(f.quality),
    callCount: 0,
    callHistory: [],
    lastCallDate: null,
    nextFollowupDate: null,
    internalRemarks: "",
    salesRemarks: "",
    initialComments: f.comments ? String(f.comments).trim() : "",
    call1: f.call1 ? String(f.call1).trim() : "",
    call2: f.call2 ? String(f.call2).trim() : "",
    call3: f.call3 ? String(f.call3).trim() : "",
    call4: f.call4 ? String(f.call4).trim() : "",
    call5: f.call5 ? String(f.call5).trim() : "",
    stage: "New Lead",
    priority: mapPriority(f.quality),
    owner: "Sales Admin",
    nextFollowUp: null,
    lastActivity: `Lead synced from ${label}${sheetName ? ` (${sheetName})` : ""}`,
    notes:    noteParts.join(" | "),
    lostReason: null,
    auditHistory: [
      {
        id: Date.now(),
        action: `Lead synced from ${label}`,
        changedBy: label,
        role: "integration",
        changes: { source, stage: "New Lead", sheetName: sheetName || "" },
        createdAt: now,
      },
    ],
    createdAt,
    updatedAt: now,
  };

  store.leads.unshift(lead);

  const followUp = {
    id: Date.now() + 1,
    leadId: lead.id,
    type: "First Call",
    due: new Date(Date.now() + 86400000).toISOString().slice(0, 10),
    status: "Pending",
    outcome: `Lead from ${label}`,
    notes: "",
    createdAt: now,
  };
  store.followUps.unshift(followUp);

  await Promise.all([persistLead(lead), persistFollowUp(followUp)]);

  console.log(`[${label}] New lead: ${lead.name} (${lead.phone}) | source: ${lead.source} | priority: ${lead.priority}`);
  return reply(201, { success: true, leadId: lead.id, message: `Lead created from ${label}` });
}

// ---- Facebook Lead Ads ----

// Lead form field names → the column names importLeadRow understands.
const FB_FIELD_MAP = {
  full_name: "Name",
  first_name: "Name",
  phone_number: "Phone Number",
  email: "Email",
  city: "Which location is your property in?",
  date_of_birth: "DOB",
};

export function facebookVerify(req, res) {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  if (mode === "subscribe" && config.fbVerifyToken && token === config.fbVerifyToken) {
    return res.status(200).send(req.query["hub.challenge"]);
  }
  return res.sendStatus(403);
}

function validFacebookSignature(req) {
  const header = req.headers["x-hub-signature-256"] || "";
  if (!config.fbAppSecret || !req.rawBody || !header.startsWith("sha256=")) return false;
  const expected = crypto.createHmac("sha256", config.fbAppSecret).update(req.rawBody).digest("hex");
  const given = header.slice(7);
  return given.length === expected.length && crypto.timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

async function fetchFacebookLead(leadgenId) {
  const fields = "field_data,created_time,campaign_name,ad_name,form_id,platform";
  const url = `https://graph.facebook.com/${config.fbGraphVersion}/${leadgenId}?fields=${fields}&access_token=${encodeURIComponent(config.fbPageToken)}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Graph API error ${res.status}`);
  return data;
}

// Custom questions arrive snake_cased ("what_type_of_home_do_you_have?"); turn them back into sheet headers.
function facebookLeadToRow(fbLead) {
  const row = {
    Date: fbLead.created_time ? fbLead.created_time.slice(0, 10) : "",
    platform: fbLead.platform || "fb",
    campaign_name: fbLead.campaign_name || "",
    ad_name: fbLead.ad_name || "",
  };
  for (const { name, values } of fbLead.field_data || []) {
    const key = FB_FIELD_MAP[name] || name.replace(/_/g, " ");
    if (row[key] === undefined || row[key] === "") row[key] = (values || []).join(", ");
  }
  return row;
}

export async function facebookWebhook(req, res) {
  if (!validFacebookSignature(req)) {
    return res.status(401).json({ error: "Invalid signature" });
  }
  if (!config.fbPageToken) {
    return res.status(503).json({ error: "Facebook integration not configured" });
  }

  const changes = (req.body.entry || []).flatMap((e) => e.changes || []).filter((c) => c.field === "leadgen");
  const results = [];
  for (const change of changes) {
    const leadgenId = change.value?.leadgen_id;
    if (!leadgenId) continue;
    try {
      const row = facebookLeadToRow(await fetchFacebookLead(leadgenId));
      const result = await importLeadRow(row, { sheetName: "", label: "Facebook Lead Ads" });
      results.push({ leadgenId, ...result.body });
    } catch (err) {
      console.error(`[Facebook Lead Ads] Failed to import lead ${leadgenId}:`, err.message);
      results.push({ leadgenId, error: err.message });
    }
  }

  // Always 200 so Meta doesn't keep retrying leads we've already logged.
  return res.status(200).json({ received: changes.length, results });
}

// ---- Facebook Lead Ads polling ----
// Backup for the webhook: Meta doesn't deliver leadgen webhooks reliably to unpublished apps,
// so we also pull recent leads from every form on the Page.

const LEAD_FIELDS = "field_data,created_time,campaign_name,ad_name,form_id,platform";
const seenFacebookLeads = new Set();

async function graphGet(path, params = {}) {
  const query = new URLSearchParams({ ...params, access_token: config.fbPageToken });
  const res = await fetch(`https://graph.facebook.com/${config.fbGraphVersion}/${path}?${query}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || `Graph API error ${res.status}`);
  return data;
}

async function pollFacebookLeads(sinceSeconds) {
  const forms = await graphGet(`${config.fbPageId}/leadgen_forms`, { fields: "id,name", limit: "100" });
  let created = 0;
  for (const form of forms.data || []) {
    const leads = await graphGet(`${form.id}/leads`, {
      fields: LEAD_FIELDS,
      limit: "100",
      filtering: JSON.stringify([{ field: "time_created", operator: "GREATER_THAN", value: sinceSeconds }]),
    });
    for (const fbLead of leads.data || []) {
      if (seenFacebookLeads.has(fbLead.id)) continue;
      seenFacebookLeads.add(fbLead.id);
      const result = await importLeadRow(facebookLeadToRow(fbLead), { sheetName: form.name, label: "Facebook Lead Ads" });
      if (result.status === 201) created += 1;
    }
  }
  return created;
}

export function startFacebookLeadPolling() {
  if (!config.fbPageToken || !config.fbPageId || !(config.fbPollSeconds > 0)) return;

  let since = Math.floor(Date.now() / 1000) - config.fbPollLookbackHours * 3600;
  const tick = async () => {
    const startedAt = Math.floor(Date.now() / 1000);
    try {
      const created = await pollFacebookLeads(since);
      // Overlap by a minute so leads created during a poll aren't skipped; seenFacebookLeads stops repeats.
      since = startedAt - 60;
      if (created > 0) console.log(`[Facebook Lead Ads] Poll imported ${created} new lead(s)`);
    } catch (err) {
      console.error("[Facebook Lead Ads] Poll failed:", err.message);
    }
  };

  console.log(`[Facebook Lead Ads] Polling Page ${config.fbPageId} every ${config.fbPollSeconds}s`);
  tick();
  setInterval(tick, config.fbPollSeconds * 1000);
}

// ---- Client consultation form ----

// Question ids from frontend/lib/consultationForm.ts; anything else in the payload is ignored.
const CONSULTATION_FIELDS = [
  "name", "phone", "email", "location", "propertyType", "spaces", "style", "atmosphere", "colorPalette",
  "budgetComfort", "styleSatisfaction", "budget", "materialFinish", "kitchenType", "wardrobeType",
  "startTime", "completionTimeline", "services", "notes",
];

function cleanConsultationAnswers(raw) {
  const answers = {};
  for (const id of CONSULTATION_FIELDS) {
    const value = raw[id];
    if (Array.isArray(value)) {
      const list = value.map((v) => String(v).trim().slice(0, 200)).filter(Boolean).slice(0, 30);
      if (list.length) answers[id] = list;
    } else if (value !== undefined && value !== null) {
      const text = String(value).trim().slice(0, 2000);
      if (text) answers[id] = text;
    }
  }
  return answers;
}

const lastTenDigits = (phone) => String(phone || "").replace(/\D/g, "").slice(-10);
const joinAnswer = (value) => (Array.isArray(value) ? value.join(", ") : value || "");

// Same rules as frontend/lib/consultationForm.ts, so the API can't be used to bypass the form checks.
const NAME_RE = /^[A-Za-z][A-Za-z .'-]{1,59}$/;
const PHONE_RE = /^(?:\+?91|0)?[6-9]\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

function consultationError(answers) {
  if (!answers.name || !NAME_RE.test(answers.name)) return "Please enter a valid full name (letters only).";
  if (!answers.phone || !PHONE_RE.test(answers.phone.replace(/[\s-]/g, ""))) return "Please enter a valid 10-digit mobile number.";
  if (answers.email && !EMAIL_RE.test(answers.email)) return "Please enter a valid email address.";
  if (answers.location && (answers.location.length > 100 || !/[A-Za-z]/.test(answers.location))) return "Please enter a valid location.";
  return "";
}

export async function submitConsultation(req, res) {
  const ip = req.headers["x-forwarded-for"]?.split(",")[0] || req.socket.remoteAddress || "unknown";
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many submissions. Please try again later." });
  }

  const raw = req.body?.answers;
  if (!raw || typeof raw !== "object") {
    return res.status(400).json({ error: "Missing form answers" });
  }
  const answers = cleanConsultationAnswers(raw);
  const invalid = consultationError(answers);
  if (invalid) {
    return res.status(400).json({ error: invalid });
  }

  // Same person filling the form again (or an existing Facebook/website lead) → attach to that lead.
  const digits = lastTenDigits(answers.phone);
  let lead = store.leads.find((l) => lastTenDigits(l.phone) === digits);

  if (!lead) {
    const result = await importLeadRow({
      Name: answers.name,
      "Phone Number": answers.phone,
      Email: answers.email || "",
      "Which location is your property in?": answers.location || "",
      "What type of home do you have?": joinAnswer(answers.propertyType),
      "What is your estimated interior budget?": joinAnswer(answers.budget),
      "Initial Comments": answers.notes || "",
      platform: "website",
    }, { sheetName: "", label: "Consultation Form" });
    if (result.status >= 400) return res.status(result.status).json(result.body);
    lead = store.leads.find((l) => l.id === result.body.leadId);
  }

  const now = new Date().toISOString();
  lead.consultations = [...(lead.consultations || []), { submittedAt: now, answers }];
  if (!lead.email && answers.email) lead.email = lead.Email = answers.email;
  if (!lead.location && answers.location) lead.location = lead["Which location is your property in?"] = answers.location;
  if (!lead.project && answers.propertyType) lead.project = lead["What type of home do you have?"] = joinAnswer(answers.propertyType);
  if (!lead.estimatedBudget && answers.budget) lead.estimatedBudget = lead["What is your estimated interior budget?"] = joinAnswer(answers.budget);
  lead.lastActivity = "Consultation form submitted";
  lead.auditHistory = [...(lead.auditHistory || []), {
    id: Date.now(),
    action: "Consultation form submitted",
    changedBy: "Consultation Form",
    role: "public",
    changes: { budget: joinAnswer(answers.budget), startTime: answers.startTime || "" },
    createdAt: now,
  }];
  lead.updatedAt = now;
  await persistLead(lead);

  console.log(`[Consultation Form] ${lead.name} (${lead.phone}) submitted the consultation form`);
  return res.status(201).json({ success: true, message: "Thank you! Our team will contact you shortly." });
}
