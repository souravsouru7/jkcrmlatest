"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNetwork } from "@/hooks/useNetwork";
import ReminderBell from "@/components/ReminderBell";

const PRIMARY_NAV = [
  { href: "/dashboard", label: "Home", hint: "Command center" },
  { href: "/leads", label: "Leads", hint: "Capture and qualify" },
  { href: "/follow-ups", label: "Follow-ups", hint: "Tasks and reminders" },
  { href: "/pipeline", label: "Pipeline", hint: "Deal movement" },
];

const SECONDARY_NAV = [
  { href: "/site-visits", label: "Site Visits" },
  { href: "/quotations", label: "Quotations" },
  { href: "/negative-leads", label: "Negative Leads" },
  { href: "/awaiting-response", label: "Awaiting Response" },
  { href: "/follow-up-pending", label: "Follow-up Pending" },
  { href: "/unqualified-leads", label: "Unqualified Leads" },
  { href: "/reports", label: "Reports" },
  { href: "/more", label: "More" },
];

const ACTIONS = [
  { href: "/leads", label: "Add Lead" },
  { href: "/follow-ups", label: "Add Follow-up" },
  { href: "/site-visits", label: "Schedule Visit" },
  { href: "/quotations", label: "Create Quote" },
];

function NavItem({ href, label, hint, active, onClick }: { href: string; label: string; hint?: string; active: boolean; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`group flex items-center justify-between gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold ${
        active
          ? "bg-blue-600 text-white shadow-sm shadow-blue-600/25"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
      }`}
    >
      <span className="min-w-0">
        <span className="block truncate">{label}</span>
        {hint && <span className={`block truncate text-[11px] font-medium ${active ? "text-blue-100" : "text-slate-400 dark:text-slate-500"}`}>{hint}</span>}
      </span>
      <span aria-hidden="true" className={active ? "text-blue-100" : "text-slate-300 group-hover:text-slate-500"}>›</span>
    </Link>
  );
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, ready, logout } = useAuth();
  const { isOnline } = useNetwork();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  if (!ready) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20">
          JK
        </div>
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  const sidebar = (
    <aside className="flex h-full w-[min(18rem,86vw)] flex-col border-r border-slate-200 bg-white/95 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95">
      <div className="flex h-20 items-center gap-3 border-b border-slate-100 px-5 dark:border-slate-800">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-sm font-black text-white shadow-lg shadow-blue-600/20">
          JK
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-slate-950 dark:text-white">JK Interiors</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Sales CRM</p>
        </div>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Workspace</p>
          <nav className="space-y-1">
            {PRIMARY_NAV.map((item) => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={() => setSidebarOpen(false)} />
            ))}
          </nav>
        </div>

        <div>
          <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-wide text-slate-400">Operations</p>
          <nav className="space-y-1">
            {SECONDARY_NAV.map((item) => (
              <NavItem key={item.href} {...item} active={isActive(item.href)} onClick={() => setSidebarOpen(false)} />
            ))}
          </nav>
        </div>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 dark:border-blue-500/20 dark:bg-blue-500/10">
          <p className="text-sm font-bold text-slate-950 dark:text-white">Quick actions</p>
          <div className="mt-3 grid gap-2">
            {ACTIONS.map((action) => (
              <Link key={action.label} href={action.href} onClick={() => setSidebarOpen(false)} className="rounded-xl bg-white px-3 py-2 text-xs font-semibold text-blue-700 shadow-sm hover:bg-blue-600 hover:text-white dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-600 dark:hover:text-white">
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 p-4 dark:border-slate-800">
        <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-slate-900">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white dark:bg-blue-600">
            {user?.name?.slice(0, 2).toUpperCase() || "SA"}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">{user?.name || "Sales Admin"}</p>
            <p className="truncate text-xs capitalize text-slate-500 dark:text-slate-400">{user?.role || "admin"}</p>
          </div>
          <button onClick={logout} className="rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-white hover:text-red-600 dark:hover:bg-slate-800">
            Exit
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className={`fixed inset-y-0 left-0 z-50 transition-transform duration-200 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebar}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-3 py-3 backdrop-blur-xl sm:px-6 lg:min-h-20 lg:px-8 dark:border-slate-800 dark:bg-slate-950/70">
          <div className="flex items-center gap-3">
            <button className="rounded-xl border border-slate-200 bg-white p-2 text-slate-600 lg:hidden dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300" onClick={() => setSidebarOpen(true)} aria-label="Open navigation">
              <span className="block h-0.5 w-5 bg-current" />
              <span className="mt-1.5 block h-0.5 w-5 bg-current" />
              <span className="mt-1.5 block h-0.5 w-5 bg-current" />
            </button>
            <div className="hidden lg:block">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Premium sales workspace</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Capture, follow up, quote, close.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {!isOnline && (
              <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                Offline
              </span>
            )}
            <button onClick={() => setActionsOpen((v) => !v)} className="hidden rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-blue-600/20 hover:bg-blue-700 sm:inline-flex">
              + New
            </button>
            <ReminderBell />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white dark:bg-blue-600">
              {user?.name?.slice(0, 2).toUpperCase() || "SA"}
            </div>
          </div>
        </header>

        {actionsOpen && (
          <div className="fixed right-3 top-16 z-40 w-[calc(100vw-1.5rem)] max-w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl sm:right-6 sm:top-20 dark:border-slate-800 dark:bg-slate-900">
            {ACTIONS.map((action) => (
              <Link key={action.label} href={action.href} onClick={() => setActionsOpen(false)} className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 dark:text-slate-200 dark:hover:bg-blue-500/10 dark:hover:text-blue-300">
                {action.label}
              </Link>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>

      <button
        onClick={() => setActionsOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-light text-white shadow-xl shadow-blue-600/30 hover:bg-blue-700 sm:hidden"
        aria-label="Open quick actions"
      >
        +
      </button>
    </div>
  );
}
