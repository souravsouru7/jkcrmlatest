export function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function shortDate(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

export function classNames(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

export const STAGES = [
  "New Lead",
  "Contacted",
  "Qualified",
  "Site Visit",
  "Quotation",
  "Negotiation",
  "Won",
  "Lost",
] as const;

export const SOURCES = [
  "Website",
  "Instagram",
  "Facebook Ads",
  "WhatsApp",
  "Phone Call",
  "Walk-in",
  "Referral",
  "Marketplace",
  "Other",
];

export const FOLLOW_UP_TYPES = [
  "Call",
  "WhatsApp",
  "Email",
  "Site Visit",
  "Quotation Discussion",
  "First Call",
  "Booking Call",
  "Other",
];

export const QUALITY_VALUES = [
  "Positive",
  "Negative",
  "Can't Say",
  "Awaiting Update",
  "N/A",
] as const;

export const QUALITY_TYPE_VALUES = [
  "Out of Hyderabad",
  "No Answer on Call/Msg",
  "No Requirements",
  "Vendor/Contractors",
  "Handover More Than 3 Months",
  "Invalid Number",
  "Requirements Gathered",
  "Awaiting Update",
  "Requirement Scheduled",
  "Duplicate",
  "Property Renovation",
  "Package Shared",
  "Out Of Budget",
  "Booked From Others",
  "Not In Scope",
  "Quote Shared - Lost",
  "Quote Shared - Awaiting Update",
  "Converted",
] as const;

export const LEAD_TEMPERATURES = ["Hot", "Warm", "Cold"] as const;
