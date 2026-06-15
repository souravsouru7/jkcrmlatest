import store, { deletePersistedLead, persistFollowUp, persistLead } from "../models/store.js";

const STAGES = ["New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation", "Won", "Lost"];
const PRIORITIES = ["Hot", "Warm", "Cold"];
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

function normalizeQuality(value) {
  if (value === "#N/A") return "N/A";
  return QUALITY_VALUES.includes(value) ? value : "Awaiting Update";
}

function normalizeQualityType(value) {
  return QUALITY_TYPE_VALUES.includes(value) ? value : "Awaiting Update";
}

function appendAudit(lead, req, action, changes) {
  const cleaned = Object.fromEntries(
    Object.entries(changes).filter(([, value]) => value !== undefined)
  );
  lead.auditHistory = Array.isArray(lead.auditHistory) ? lead.auditHistory : [];
  lead.auditHistory.push({
    id: Date.now(),
    action,
    changedBy: req.user?.name || "Sales Admin",
    role: req.user?.role || "admin",
    changes: cleaned,
    createdAt: new Date().toISOString(),
  });
}

function routeLeadByQuality(lead, quality) {
  if (quality === "Positive" && (lead.stage === "New Lead" || lead.stage === "Lost")) {
    lead.stage = "Contacted";
  }
  if (quality === "Negative" || quality === "N/A") {
    lead.stage = "Lost";
  }
}

function firstValue(body, exactKey, fallbackKey = "") {
  const exact = body[exactKey];
  if (exact !== undefined && exact !== null && String(exact).trim() !== "") return String(exact).trim();
  if (fallbackKey) {
    const fallback = body[fallbackKey];
    if (fallback !== undefined && fallback !== null && String(fallback).trim() !== "") return String(fallback).trim();
  }
  return "";
}

function sheetFieldsFromBody(body) {
  const quality = firstValue(body, "Quality", "quality");
  const qualityType = firstValue(body, "Quality Type", "qualityType");
  return {
    Date: firstValue(body, "Date", "sheetDate"),
    Email: firstValue(body, "Email", "email"),
    Name: firstValue(body, "Name", "name"),
    "Phone Number": firstValue(body, "Phone Number", "phone"),
    DOB: firstValue(body, "DOB", "dob"),
    "What type of home do you have?": firstValue(body, "What type of home do you have?", "project"),
    "What is your estimated interior budget?": firstValue(body, "What is your estimated interior budget?", "estimatedBudget"),
    "Which location is your property in?": firstValue(body, "Which location is your property in?", "location"),
    Quality: QUALITY_VALUES.includes(quality) ? quality : quality,
    "Quality Type": QUALITY_TYPE_VALUES.includes(qualityType) ? qualityType : qualityType,
    "Initial Comments": firstValue(body, "Initial Comments", "initialComments"),
    "Call 1": firstValue(body, "Call 1", "call1"),
    "Call 2": firstValue(body, "Call 2", "call2"),
    "Call 3": firstValue(body, "Call 3", "call3"),
    "Call 4": firstValue(body, "Call 4", "call4"),
    "Call 5": firstValue(body, "Call 5", "call5"),
  };
}

export function getLeads(req, res) {
  const { stage, priority, search, quality, qualityType, location, date, budget } = req.query;
  let leads = [...store.leads];

  if (stage) leads = leads.filter((l) => l.stage === stage);
  if (priority) leads = leads.filter((l) => l.priority === priority);
  if (quality) leads = leads.filter((l) => normalizeQuality(l.Quality || l.quality || "") === normalizeQuality(String(quality)));
  if (qualityType) leads = leads.filter((l) => (l["Quality Type"] || l.qualityType || "") === qualityType);
  if (location) leads = leads.filter((l) => (l["Which location is your property in?"] || l.location || "") === location);
  if (date) leads = leads.filter((l) => String(l.Date || l.sheetDate || "").includes(String(date)));
  if (budget) leads = leads.filter((l) => String(l["What is your estimated interior budget?"] || l.estimatedBudget || l.budget || "").toLowerCase().includes(String(budget).toLowerCase()));
  if (search) {
    const term = String(search).toLowerCase();
    leads = leads.filter((l) =>
      [
        l.Date,
        l.Email,
        l.Name,
        l["Phone Number"],
        l.DOB,
        l["What type of home do you have?"],
        l["What is your estimated interior budget?"],
        l["Which location is your property in?"],
        l.Quality,
        l["Quality Type"],
        l["Initial Comments"],
        l["Call 1"],
        l["Call 2"],
        l["Call 3"],
        l["Call 4"],
        l["Call 5"],
        l.name,
        l.phone,
      ].join(" ").toLowerCase().includes(term)
    );
  }

  return res.json({ leads, total: leads.length });
}

export function getLeadById(req, res) {
  const lead = store.leads.find((l) => l.id === Number(req.params.id));
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  return res.json(lead);
}

export async function createLead(req, res) {
  const sheet = sheetFieldsFromBody(req.body);
  const { stage, priority, nextFollowUp, notes } = req.body;

  if (!sheet.Name || !sheet["Phone Number"]) {
    return res.status(400).json({ error: "Name and Phone Number are required" });
  }

  const now = new Date().toISOString();
  const lead = {
    id: Date.now(),
    ...sheet,
    name: sheet.Name,
    phone: sheet["Phone Number"],
    email: sheet.Email,
    location: sheet["Which location is your property in?"],
    source: "Manual Entry",
    project: sheet["What type of home do you have?"],
    budget: 0,
    estimatedBudget: sheet["What is your estimated interior budget?"],
    sheetDate: sheet.Date,
    dob: sheet.DOB,
    quality: sheet.Quality,
    qualityType: sheet["Quality Type"],
    leadTemperature: PRIORITIES.includes(priority) ? priority : "Warm",
    callCount: 0,
    callHistory: [],
    lastCallDate: null,
    nextFollowupDate: nextFollowUp || null,
    internalRemarks: "",
    salesRemarks: "",
    auditHistory: [
      {
        id: Date.now(),
        action: "Lead created",
        changedBy: req.user.name || "Sales Admin",
        role: req.user.role || "admin",
        changes: { source: "Manual Entry", stage: STAGES.includes(stage) ? stage : "New Lead" },
        createdAt: now,
      },
    ],
    initialComments: sheet["Initial Comments"],
    call1: sheet["Call 1"],
    call2: sheet["Call 2"],
    call3: sheet["Call 3"],
    call4: sheet["Call 4"],
    call5: sheet["Call 5"],
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
  const followUp = {
    id: Date.now() + 1,
    leadId: lead.id,
    type: "First Call",
    due: lead.nextFollowUp,
    status: "Pending",
    outcome: "Qualify requirement and budget",
    notes: "",
    createdAt: now,
  };
  store.followUps.unshift(followUp);

  await Promise.all([persistLead(lead), persistFollowUp(followUp)]);

  return res.status(201).json(lead);
}

export async function updateLead(req, res) {
  const lead = store.leads.find((l) => l.id === Number(req.params.id));
  if (!lead) return res.status(404).json({ error: "Lead not found" });
  const before = { ...lead };

  const allowed = [
    "Date",
    "Email",
    "Name",
    "Phone Number",
    "DOB",
    "What type of home do you have?",
    "What is your estimated interior budget?",
    "Which location is your property in?",
    "Quality",
    "Quality Type",
    "Initial Comments",
    "Call 1",
    "Call 2",
    "Call 3",
    "Call 4",
    "Call 5",
    "name",
    "phone",
    "email",
    "location",
    "source",
    "project",
    "budget",
    "priority",
    "leadTemperature",
    "callCount",
    "callHistory",
    "lastCallDate",
    "nextFollowupDate",
    "internalRemarks",
    "salesRemarks",
    "auditHistory",
    "owner",
    "nextFollowUp",
    "notes",
    "lostReason",
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) lead[key] = req.body[key];
  });
  if (req.body.Name !== undefined) lead.name = req.body.Name;
  if (req.body["Phone Number"] !== undefined) lead.phone = req.body["Phone Number"];
  if (req.body.Email !== undefined) lead.email = req.body.Email;
  if (req.body["Which location is your property in?"] !== undefined) lead.location = req.body["Which location is your property in?"];
  if (req.body["What type of home do you have?"] !== undefined) lead.project = req.body["What type of home do you have?"];
  if (req.body["What is your estimated interior budget?"] !== undefined) lead.estimatedBudget = req.body["What is your estimated interior budget?"];
  if (req.body.Date !== undefined) lead.sheetDate = req.body.Date;
  if (req.body.DOB !== undefined) lead.dob = req.body.DOB;
  if (req.body.Quality !== undefined) lead.quality = req.body.Quality;
  if (req.body["Quality Type"] !== undefined) lead.qualityType = req.body["Quality Type"];
  if (req.body["Initial Comments"] !== undefined) lead.initialComments = req.body["Initial Comments"];
  if (req.body["Call 1"] !== undefined) lead.call1 = req.body["Call 1"];
  if (req.body["Call 2"] !== undefined) lead.call2 = req.body["Call 2"];
  if (req.body["Call 3"] !== undefined) lead.call3 = req.body["Call 3"];
  if (req.body["Call 4"] !== undefined) lead.call4 = req.body["Call 4"];
  if (req.body["Call 5"] !== undefined) lead.call5 = req.body["Call 5"];
  if (req.body.leadTemperature !== undefined) lead.priority = req.body.leadTemperature;
  if (req.body.nextFollowupDate !== undefined) lead.nextFollowUp = req.body.nextFollowupDate;
  if (req.body.quality !== undefined) lead.Quality = req.body.quality;
  if (req.body.qualityType !== undefined) lead["Quality Type"] = req.body.qualityType;
  appendAudit(lead, req, "Lead updated", {
    quality: before.quality !== lead.quality ? lead.quality : undefined,
    qualityType: before.qualityType !== lead.qualityType ? lead.qualityType : undefined,
    stage: before.stage !== lead.stage ? lead.stage : undefined,
    priority: before.priority !== lead.priority ? lead.priority : undefined,
    nextFollowupDate: before.nextFollowupDate !== lead.nextFollowupDate ? lead.nextFollowupDate : undefined,
  });
  lead.updatedAt = new Date().toISOString();
  await persistLead(lead);

  return res.json(lead);
}

export async function updateQualification(req, res) {
  const lead = store.leads.find((l) => l.id === Number(req.params.id));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const {
    quality,
    qualityType,
    leadTemperature,
    callNotes,
    callOutcome,
    internalRemarks,
    salesRemarks,
    nextFollowupDate,
    followUpType,
  } = req.body;

  const now = new Date().toISOString();
  const cleanQuality = normalizeQuality(String(quality || lead.quality || lead.Quality || "Awaiting Update"));
  const cleanQualityType = normalizeQualityType(String(qualityType || lead.qualityType || lead["Quality Type"] || "Awaiting Update"));
  const cleanTemperature = PRIORITIES.includes(leadTemperature) ? leadTemperature : lead.priority || "Warm";
  const notes = callNotes ? String(callNotes).trim() : "";
  const outcome = callOutcome ? String(callOutcome).trim() : "";
  const remarks = internalRemarks ? String(internalRemarks).trim() : "";
  const sales = salesRemarks ? String(salesRemarks).trim() : "";
  const due = nextFollowupDate ? String(nextFollowupDate) : "";
  const type = followUpType ? String(followUpType) : "Call";

  const previous = {
    quality: lead.quality || lead.Quality || "",
    qualityType: lead.qualityType || lead["Quality Type"] || "",
    leadTemperature: lead.leadTemperature || lead.priority || "",
    stage: lead.stage,
    nextFollowupDate: lead.nextFollowupDate || lead.nextFollowUp || null,
  };

  lead.Quality = cleanQuality;
  lead.quality = cleanQuality;
  lead["Quality Type"] = cleanQualityType;
  lead.qualityType = cleanQualityType;
  lead.leadTemperature = cleanTemperature;
  lead.priority = cleanTemperature;
  lead.internalRemarks = remarks || lead.internalRemarks || "";
  lead.salesRemarks = sales || lead.salesRemarks || "";
  lead.nextFollowupDate = due || lead.nextFollowupDate || null;
  lead.nextFollowUp = due || lead.nextFollowUp || null;
  lead.lastActivity = `Lead qualification updated: ${cleanQuality}`;
  lead.updatedAt = now;

  if (notes || outcome) {
    lead.callHistory = Array.isArray(lead.callHistory) ? lead.callHistory : [];
    const callNumber = (Number(lead.callCount) || lead.callHistory.length || 0) + 1;
    const call = {
      callNumber,
      date: now,
      notes,
      outcome,
      followUpType: type,
      nextFollowupDate: due || null,
      updatedBy: req.user?.name || "Sales Admin",
    };
    lead.callHistory.push(call);
    lead.callCount = callNumber;
    lead.lastCallDate = now;

    if (callNumber <= 5) {
      const sheetCall = `Date: ${now.slice(0, 10)} | Outcome: ${outcome || "-"} | Notes: ${notes || "-"}`;
      lead[`Call ${callNumber}`] = sheetCall;
      lead[`call${callNumber}`] = sheetCall;
    }
  } else {
    lead.callHistory = Array.isArray(lead.callHistory) ? lead.callHistory : [];
    lead.callCount = Number(lead.callCount) || lead.callHistory.length || 0;
  }

  routeLeadByQuality(lead, cleanQuality);

  let followUp = null;
  if (due) {
    followUp = {
      id: Date.now() + 1,
      leadId: lead.id,
      type,
      due,
      status: "Pending",
      outcome: outcome || `Follow up ${cleanQuality} lead`,
      notes,
      createdAt: now,
    };
    store.followUps.unshift(followUp);
  }

  appendAudit(lead, req, "Lead qualification updated", {
    previous,
    quality: cleanQuality,
    qualityType: cleanQualityType,
    leadTemperature: cleanTemperature,
    callNotes: notes,
    callOutcome: outcome,
    internalRemarks: remarks,
    salesRemarks: sales,
    nextFollowupDate: due || null,
    followUpType: type,
    stage: lead.stage,
    callCount: lead.callCount,
  });

  await Promise.all([persistLead(lead), followUp ? persistFollowUp(followUp) : Promise.resolve()]);

  return res.json({ lead, followUp });
}

export async function updateStage(req, res) {
  const lead = store.leads.find((l) => l.id === Number(req.params.id));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const { stage, lostReason } = req.body;
  if (!STAGES.includes(stage)) return res.status(400).json({ error: "Invalid stage" });

  lead.stage = stage;
  lead.lastActivity = `Moved to ${stage}`;
  if (stage === "Lost" && lostReason) lead.lostReason = lostReason;
  appendAudit(lead, req, "Stage updated", { stage, lostReason });
  lead.updatedAt = new Date().toISOString();
  await persistLead(lead);

  return res.json(lead);
}

export async function deleteLead(req, res) {
  const leadId = Number(req.params.id);
  const idx = store.leads.findIndex((l) => l.id === leadId);
  if (idx === -1) return res.status(404).json({ error: "Lead not found" });

  store.leads.splice(idx, 1);

  // Cascade in-memory store deletions
  store.followUps = store.followUps.filter((f) => f.leadId !== leadId);
  store.visits = store.visits.filter((v) => v.leadId !== leadId);
  store.quotations = store.quotations.filter((q) => q.leadId !== leadId);

  await deletePersistedLead(leadId);

  return res.json({ message: "Lead and associated records deleted" });
}
