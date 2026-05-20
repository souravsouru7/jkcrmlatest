import store from "../models/store.js";

const STATUSES = ["Draft", "Sent", "Accepted", "Rejected", "Expired"];

function nextQuoteNumber() {
  const nums = store.quotations.map((q) => {
    const m = q.number.match(/(\d+)$/);
    return m ? Number(m[1]) : 0;
  });
  const max = nums.length ? Math.max(...nums) : 1000;
  return `JK-Q-${String(max + 1).padStart(4, "0")}`;
}

export function getQuotations(req, res) {
  const { status, leadId } = req.query;
  let quotations = [...store.quotations];

  if (status) quotations = quotations.filter((q) => q.status === status);
  if (leadId) quotations = quotations.filter((q) => q.leadId === Number(leadId));

  quotations.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return res.json({ quotations, total: quotations.length });
}

export function createQuotation(req, res) {
  const { leadId, amount, validTill, discount, tax, terms } = req.body;

  if (!leadId || !amount || !validTill) {
    return res.status(400).json({ error: "leadId, amount and validTill are required" });
  }
  const lead = store.leads.find((l) => l.id === Number(leadId));
  if (!lead) return res.status(404).json({ error: "Lead not found" });

  const quotation = {
    id: Date.now(),
    leadId: Number(leadId),
    number: nextQuoteNumber(),
    amount: Number(amount),
    status: "Draft",
    validTill: String(validTill),
    discount: Number(discount) || 0,
    tax: Number(tax) || 0,
    terms: terms ? String(terms).trim() : "",
    createdAt: new Date().toISOString(),
  };

  store.quotations.unshift(quotation);

  lead.lastActivity = `Quotation ${quotation.number} created`;
  lead.stage = "Quotation";
  lead.updatedAt = new Date().toISOString();

  return res.status(201).json(quotation);
}

export function updateQuotation(req, res) {
  const quotation = store.quotations.find((q) => q.id === Number(req.params.id));
  if (!quotation) return res.status(404).json({ error: "Quotation not found" });

  const allowed = ["amount", "status", "validTill", "discount", "tax", "terms"];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) quotation[key] = req.body[key];
  });

  if (req.body.status === "Accepted") {
    const lead = store.leads.find((l) => l.id === quotation.leadId);
    if (lead) {
      lead.lastActivity = `Quotation ${quotation.number} accepted`;
      lead.stage = "Won";
      lead.updatedAt = new Date().toISOString();
    }
  }

  return res.json(quotation);
}
