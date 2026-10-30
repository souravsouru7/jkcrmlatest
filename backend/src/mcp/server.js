import jwt from "jsonwebtoken";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { config } from "../config/env.js";

const STAGES = ["New Lead", "Contacted", "Qualified", "Site Visit", "Quotation", "Negotiation", "Won", "Lost"];
const PRIORITIES = ["Hot", "Warm", "Cold"];
const QUALITY_VALUES = ["Positive", "Negative", "Can't Say", "Awaiting Update", "N/A"];
const QUALITY_TYPES = [
  "Out of Hyderabad", "No Answer on Call/Msg", "No Requirements", "Vendor/Contractors",
  "Handover More Than 3 Months", "Invalid Number", "Requirements Gathered", "Awaiting Update",
  "Requirement Scheduled", "Duplicate", "Property Renovation", "Package Shared", "Out Of Budget",
  "Booked From Others", "Not In Scope", "Quote Shared - Lost", "Quote Shared - Awaiting Update", "Converted",
];
const FOLLOW_UP_TYPES = ["Call", "WhatsApp", "Email", "Site Visit", "Quotation Discussion", "First Call", "Booking Call", "Other"];
const VISIT_STATUSES = ["Scheduled", "Completed", "Rescheduled", "Cancelled", "No Show"];
const QUOTE_STATUSES = ["Draft", "Sent", "Accepted", "Rejected", "Expired"];

// Tools call the CRM's own REST API so validation, follow-up logic and audit history stay in one place.
// Changes made through Claude show up in audit history as "Claude AI".
function serviceToken() {
  return jwt.sign({ name: "Claude AI", role: "admin" }, config.jwtSecret, { expiresIn: "5m" });
}

async function api(method, path, body) {
  const res = await fetch(`http://127.0.0.1:${config.port}/api${path}`, {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${serviceToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `CRM request failed (${res.status})`);
  return data;
}

function query(params) {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== "") q.set(k, String(v));
  const s = q.toString();
  return s ? `?${s}` : "";
}

// Drops undefined keys so PATCH bodies only carry fields Claude actually set.
function clean(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined));
}

// Leads carry both sheet-style and camelCase fields; keep results compact.
function summarizeLead(l) {
  return {
    id: l.id,
    name: l.name || l.Name,
    phone: l.phone || l["Phone Number"],
    email: l.email || l.Email,
    location: l.location || l["Which location is your property in?"],
    homeType: l.project || l["What type of home do you have?"],
    budget: l.estimatedBudget || l["What is your estimated interior budget?"],
    source: l.source,
    stage: l.stage,
    priority: l.priority,
    quality: l.quality || l.Quality,
    qualityType: l.qualityType || l["Quality Type"],
    nextFollowUp: l.nextFollowupDate || l.nextFollowUp,
    lastActivity: l.lastActivity,
    createdAt: l.createdAt,
  };
}

async function run(fn) {
  try {
    const data = await fn();
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
  } catch (err) {
    return { isError: true, content: [{ type: "text", text: `Error: ${err.message}` }] };
  }
}

export function buildMcpServer() {
  const server = new McpServer({ name: "jk-crm", version: "1.0.0" });

  // ---- Read tools ----

  server.tool(
    "search_leads",
    "Search and filter CRM leads. All filters are optional; returns compact lead summaries.",
    {
      search: z.string().optional().describe("Free text: name, phone, email, location, comments"),
      stage: z.enum(STAGES).optional(),
      priority: z.enum(PRIORITIES).optional(),
      quality: z.enum(QUALITY_VALUES).optional(),
      qualityType: z.enum(QUALITY_TYPES).optional(),
      location: z.string().optional().describe("Exact property location"),
      limit: z.number().int().positive().optional().describe("Max leads to return (default 50)"),
    },
    ({ limit = 50, ...filters }) => run(async () => {
      const { leads, total } = await api("GET", `/leads${query(filters)}`);
      return { total, returned: Math.min(total, limit), leads: leads.slice(0, limit).map(summarizeLead) };
    })
  );

  server.tool(
    "get_lead",
    "Get full details of one lead with its follow-ups, site visits and quotations.",
    { leadId: z.number().int() },
    ({ leadId }) => run(async () => {
      const [lead, followUps, visits, quotations] = await Promise.all([
        api("GET", `/leads/${leadId}`),
        api("GET", `/follow-ups${query({ leadId })}`),
        api("GET", `/site-visits${query({ leadId })}`),
        api("GET", `/quotations${query({ leadId })}`),
      ]);
      return { lead, followUps: followUps.followUps, siteVisits: visits.visits, quotations: quotations.quotations };
    })
  );

  server.tool(
    "get_dashboard",
    "Get CRM dashboard stats: lead counts by stage, pipeline value, conversions.",
    {},
    () => run(() => api("GET", "/dashboard"))
  );

  server.tool(
    "get_reminders",
    "Get today's work: overdue follow-ups, follow-ups due today and stale leads.",
    {},
    () => run(() => api("GET", "/reminders"))
  );

  server.tool(
    "list_follow_ups",
    "List follow-up tasks, optionally filtered by status or lead.",
    {
      status: z.enum(["Pending", "Completed", "Overdue"]).optional(),
      leadId: z.number().int().optional(),
    },
    (args) => run(() => api("GET", `/follow-ups${query(args)}`))
  );

  server.tool(
    "list_site_visits",
    "List site visits, optionally filtered by status, lead or date (YYYY-MM-DD).",
    {
      status: z.enum(VISIT_STATUSES).optional(),
      leadId: z.number().int().optional(),
      date: z.string().optional(),
    },
    (args) => run(() => api("GET", `/site-visits${query(args)}`))
  );

  server.tool(
    "list_quotations",
    "List quotations, optionally filtered by status or lead.",
    {
      status: z.enum(QUOTE_STATUSES).optional(),
      leadId: z.number().int().optional(),
    },
    (args) => run(() => api("GET", `/quotations${query(args)}`))
  );

  // ---- Write tools ----

  server.tool(
    "create_lead",
    "Create a new lead. A first follow-up task is created automatically.",
    {
      name: z.string(),
      phone: z.string(),
      email: z.string().optional(),
      location: z.string().optional().describe("Property location, e.g. Gachibowli"),
      homeType: z.string().optional().describe("e.g. 2BHK, 3BHK, Villa"),
      budget: z.string().optional().describe("Estimated interior budget, e.g. 8-10 Lakhs"),
      comments: z.string().optional(),
      priority: z.enum(PRIORITIES).optional(),
      nextFollowUp: z.string().optional().describe("YYYY-MM-DD"),
    },
    (a) => run(async () => summarizeLead(await api("POST", "/leads", clean({
      name: a.name,
      phone: a.phone,
      email: a.email,
      location: a.location,
      "What type of home do you have?": a.homeType,
      "What is your estimated interior budget?": a.budget,
      initialComments: a.comments,
      priority: a.priority,
      nextFollowUp: a.nextFollowUp,
    }))))
  );

  server.tool(
    "update_lead",
    "Update a lead's basic details or notes.",
    {
      leadId: z.number().int(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      location: z.string().optional(),
      homeType: z.string().optional(),
      budget: z.string().optional(),
      priority: z.enum(PRIORITIES).optional(),
      notes: z.string().optional(),
    },
    ({ leadId, ...a }) => run(async () => summarizeLead(await api("PATCH", `/leads/${leadId}`, clean({
      Name: a.name,
      "Phone Number": a.phone,
      Email: a.email,
      "Which location is your property in?": a.location,
      "What type of home do you have?": a.homeType,
      "What is your estimated interior budget?": a.budget,
      priority: a.priority,
      notes: a.notes,
    }))))
  );

  server.tool(
    "update_qualification",
    "Record a call outcome and qualify a lead. Quality 'Negative' moves the lead to the dump list and stops follow-ups.",
    {
      leadId: z.number().int(),
      quality: z.enum(QUALITY_VALUES),
      qualityType: z.enum(QUALITY_TYPES).optional(),
      leadTemperature: z.enum(PRIORITIES).optional(),
      callNotes: z.string().optional().describe("What was discussed on the call"),
      callOutcome: z.string().optional(),
      salesRemarks: z.string().optional(),
      internalRemarks: z.string().optional(),
      nextFollowupDate: z.string().optional().describe("YYYY-MM-DD"),
      followUpType: z.enum(FOLLOW_UP_TYPES).optional(),
    },
    ({ leadId, ...body }) => run(async () => {
      const { lead, followUp } = await api("PATCH", `/leads/${leadId}/qualification`, clean(body));
      return { lead: summarizeLead(lead), followUp };
    })
  );

  server.tool(
    "update_stage",
    "Move a lead to a pipeline stage.",
    {
      leadId: z.number().int(),
      stage: z.enum(STAGES),
      lostReason: z.string().optional().describe("Reason, when stage is Lost"),
    },
    ({ leadId, ...body }) => run(async () => summarizeLead(await api("PATCH", `/leads/${leadId}/stage`, clean(body))))
  );

  server.tool(
    "create_follow_up",
    "Schedule a follow-up task for a lead.",
    {
      leadId: z.number().int(),
      due: z.string().describe("YYYY-MM-DD"),
      type: z.enum(FOLLOW_UP_TYPES).optional(),
      outcome: z.string().optional().describe("Goal of this follow-up"),
      notes: z.string().optional(),
    },
    (body) => run(() => api("POST", "/follow-ups", clean(body)))
  );

  server.tool(
    "complete_follow_up",
    "Mark a follow-up task as completed.",
    {
      followUpId: z.number().int(),
      outcome: z.string().optional(),
    },
    ({ followUpId, ...body }) => run(() => api("PATCH", `/follow-ups/${followUpId}/complete`, clean(body)))
  );

  server.tool(
    "create_site_visit",
    "Schedule a site visit. Moves the lead to the Site Visit stage.",
    {
      leadId: z.number().int(),
      date: z.string().describe("YYYY-MM-DD or YYYY-MM-DDTHH:mm"),
      address: z.string(),
      notes: z.string().optional(),
      assignedTo: z.string().optional(),
    },
    (body) => run(() => api("POST", "/site-visits", clean(body)))
  );

  server.tool(
    "update_site_visit",
    "Reschedule, complete or cancel a site visit.",
    {
      visitId: z.number().int(),
      status: z.enum(VISIT_STATUSES).optional(),
      date: z.string().optional(),
      address: z.string().optional(),
      notes: z.string().optional(),
      assignedTo: z.string().optional(),
    },
    ({ visitId, ...body }) => run(() => api("PATCH", `/site-visits/${visitId}`, clean(body)))
  );

  server.tool(
    "create_quotation",
    "Create a draft quotation for a lead. Moves the lead to the Quotation stage.",
    {
      leadId: z.number().int(),
      amount: z.number().positive().describe("Amount in INR"),
      validTill: z.string().describe("YYYY-MM-DD"),
      discount: z.number().optional(),
      tax: z.number().optional(),
      terms: z.string().optional(),
    },
    (body) => run(() => api("POST", "/quotations", clean(body)))
  );

  server.tool(
    "update_quotation",
    "Update a quotation. Status 'Accepted' marks the lead as Won.",
    {
      quotationId: z.number().int(),
      status: z.enum(QUOTE_STATUSES).optional(),
      amount: z.number().positive().optional(),
      validTill: z.string().optional(),
      discount: z.number().optional(),
      tax: z.number().optional(),
      terms: z.string().optional(),
    },
    ({ quotationId, ...body }) => run(() => api("PATCH", `/quotations/${quotationId}`, clean(body)))
  );

  return server;
}
