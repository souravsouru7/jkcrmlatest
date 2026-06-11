import { Section, buttonGhost, buttonPrimary, buttonSecondary } from "@/components/CrmDesign";
import type { Lead } from "@/lib/types";

export const SHEET_FIELDS = [
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
] as const;

export type SheetField = typeof SHEET_FIELDS[number];

export const DETAIL_ORDER: SheetField[] = [
  "Date",
  "Name",
  "Phone Number",
  "Email",
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
];

export const FALLBACKS: Partial<Record<SheetField, keyof Lead>> = {
  Date: "sheetDate",
  Email: "email",
  Name: "name",
  "Phone Number": "phone",
  DOB: "dob",
  "What type of home do you have?": "project",
  "What is your estimated interior budget?": "estimatedBudget",
  "Which location is your property in?": "location",
  Quality: "quality",
  "Quality Type": "qualityType",
  "Initial Comments": "initialComments",
  "Call 1": "call1",
  "Call 2": "call2",
  "Call 3": "call3",
  "Call 4": "call4",
  "Call 5": "call5",
};

export function sheetValue(lead: Lead, field: SheetField) {
  const direct = lead[field];
  if (direct !== undefined && direct !== null && String(direct).trim() !== "") return String(direct);
  const fallback = FALLBACKS[field];
  const value = fallback ? lead[fallback] : "";
  return value === undefined || value === null ? "" : String(value);
}

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

interface LeadDetailDrawerProps {
  lead: Lead;
  onClose: () => void;
  onLog: () => void;
  onDelete: () => void;
}

export default function LeadDetailDrawer({ lead, onClose, onLog, onDelete }: LeadDetailDrawerProps) {
  const phone = sheetValue(lead, "Phone Number");
  const email = sheetValue(lead, "Email");

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-2xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
        <div className="sticky top-0 z-10 border-b border-slate-100 bg-white/95 p-6 backdrop-blur dark:border-slate-800 dark:bg-slate-950/95">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Lead Details Page</p>
              <h2 className="mt-1 truncate text-2xl font-bold text-slate-950 dark:text-white">{sheetValue(lead, "Name") || "No Name"}</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Google Sheet is the single source of truth</p>
            </div>
            <button onClick={onClose} className={buttonGhost}>Close</button>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {phone && <a href={`tel:${phone}`} className={buttonPrimary}>Call</a>}
            {phone && <a href={`https://wa.me/${normalizePhone(phone)}`} className="inline-flex items-center rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700" target="_blank" rel="noopener noreferrer">WhatsApp</a>}
            {email && <a href={`mailto:${email}`} className={buttonSecondary}>Email</a>}
            <button onClick={onLog} className={buttonSecondary}>Log Follow-up</button>
            <button onClick={onDelete} className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-red-600/20 hover:bg-red-700">Delete Lead</button>
          </div>
        </div>

        <div className="space-y-5 p-6">
          <Section title="Google Sheet fields" subtitle="Displayed in the required order with exact column labels.">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {DETAIL_ORDER.map((field) => (
                <div key={field} className="grid gap-2 px-5 py-4 sm:grid-cols-[220px_1fr]">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">{field}</p>
                  <p className="whitespace-pre-wrap text-sm font-medium text-slate-900 dark:text-slate-100">{sheetValue(lead, field) || "-"}</p>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </aside>
    </div>
  );
}
