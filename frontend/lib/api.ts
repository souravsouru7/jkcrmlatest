import { storage } from "@/lib/storage";

/**
 * API base URL resolution:
 *  - Browser dev (next dev)        → http://localhost:5000/api
 *  - Android emulator              → http://10.0.2.2:5000/api  (localhost alias on emulator)
 *  - Android real device           → your machine's LAN IP, e.g. http://192.168.1.x:5000/api
 *  - Production (deployed backend) → NEXT_PUBLIC_API_URL env variable
 *
 * For the easiest setup:
 *   Set NEXT_PUBLIC_API_URL=https://your-deployed-backend.com/api in .env.local
 *   or change ANDROID_EMULATOR_API below to your LAN IP for real device testing.
 */
const ANDROID_EMULATOR_API = "http://10.0.2.2:5000/api";

function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window === "undefined") return "http://localhost:5000/api";
  // Capacitor on Android emulator uses 10.0.2.2 to reach host machine's localhost
  if (window.location.protocol === "capacitor:" || window.Capacitor?.isNativePlatform?.()) {
    return ANDROID_EMULATOR_API;
  }
  return "http://localhost:5000/api";
}

async function getToken(): Promise<string> {
  return (await storage.getToken()) ?? "";
}

async function headers(extra?: Record<string, string>): Promise<Record<string, string>> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${await getToken()}`,
    ...extra,
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const BASE = getBaseUrl();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: await headers(),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: { email: string; name: string; role: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  // Dashboard
  dashboard: () => request<Record<string, unknown>>("/dashboard"),
  crmData: () => request<Record<string, unknown>>("/dashboard/crm"),

  // Reminders
  reminders: () =>
    request<{
      total: number;
      overdue: { id: number; leadId: number; leadName: string; type: string; due: string; daysOverdue: number }[];
      dueToday: { id: number; leadId: number; leadName: string; type: string; due: string }[];
      staleLeads: { id: number; name: string; stage: string; priority: string; daysSinceActivity: number }[];
      newWebLeads: { id: number; name: string; phone: string; project: string; createdAt: string }[];
    }>("/reminders"),

  // Leads
  leads: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ leads: unknown[]; total: number }>(`/leads${qs}`);
  },
  createLead: (body: Record<string, unknown>) =>
    request<unknown>("/leads", { method: "POST", body: JSON.stringify(body) }),
  updateLead: (id: number, body: Record<string, unknown>) =>
    request<unknown>(`/leads/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  updateStage: (id: number, stage: string, lostReason?: string) =>
    request<unknown>(`/leads/${id}/stage`, { method: "PATCH", body: JSON.stringify({ stage, lostReason }) }),
  deleteLead: (id: number) => request<unknown>(`/leads/${id}`, { method: "DELETE" }),

  // Follow-ups
  followUps: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ followUps: unknown[]; total: number }>(`/follow-ups${qs}`);
  },
  createFollowUp: (body: Record<string, unknown>) =>
    request<unknown>("/follow-ups", { method: "POST", body: JSON.stringify(body) }),
  completeFollowUp: (id: number, outcome?: string) =>
    request<unknown>(`/follow-ups/${id}/complete`, { method: "PATCH", body: JSON.stringify({ outcome }) }),

  // Site Visits
  siteVisits: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ visits: unknown[]; total: number }>(`/site-visits${qs}`);
  },
  createSiteVisit: (body: Record<string, unknown>) =>
    request<unknown>("/site-visits", { method: "POST", body: JSON.stringify(body) }),
  updateSiteVisit: (id: number, body: Record<string, unknown>) =>
    request<unknown>(`/site-visits/${id}`, { method: "PATCH", body: JSON.stringify(body) }),

  // Quotations
  quotations: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request<{ quotations: unknown[]; total: number }>(`/quotations${qs}`);
  },
  createQuotation: (body: Record<string, unknown>) =>
    request<unknown>("/quotations", { method: "POST", body: JSON.stringify(body) }),
  updateQuotation: (id: number, body: Record<string, unknown>) =>
    request<unknown>(`/quotations/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
};

// Extend window type for Capacitor check
declare global {
  interface Window {
    Capacitor?: { isNativePlatform?: () => boolean };
  }
}
