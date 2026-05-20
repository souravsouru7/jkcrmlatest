export type Stage =
  | "New Lead"
  | "Contacted"
  | "Qualified"
  | "Site Visit"
  | "Quotation"
  | "Negotiation"
  | "Won"
  | "Lost";

export type Priority = "Hot" | "Warm" | "Cold";

export type Lead = {
  id: number;
  name: string;
  phone: string;
  email: string;
  location: string;
  source: string;
  project: string;
  budget: number;
  stage: Stage;
  priority: Priority;
  owner: string;
  nextFollowUp: string | null;
  lastActivity: string;
  notes: string;
  lostReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type FollowUp = {
  id: number;
  leadId: number;
  type: string;
  due: string;
  status: "Pending" | "Completed" | "Overdue";
  outcome: string;
  notes: string;
  createdAt: string;
  completedAt?: string;
};

export type SiteVisit = {
  id: number;
  leadId: number;
  date: string;
  address: string;
  status: "Scheduled" | "Completed" | "Rescheduled" | "Cancelled" | "No Show";
  notes: string;
  assignedTo: string;
  createdAt: string;
};

export type Quotation = {
  id: number;
  leadId: number;
  number: string;
  amount: number;
  status: "Draft" | "Sent" | "Accepted" | "Rejected" | "Expired";
  validTill: string;
  discount: number;
  tax: number;
  terms: string;
  createdAt: string;
};

export type DashboardSummary = {
  totalLeads: number;
  activeLeads: number;
  pipelineValue: number;
  wonValue: number;
  quoteValue: number;
  overdue: number;
  pending: number;
  visitsToday: number;
  conversion: number;
};

export type User = {
  email: string;
  role: string;
  name: string;
};
