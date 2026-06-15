"use client";

import Link from "next/link";
import { PageHeader, pageWrap } from "@/components/CrmDesign";

const groups = [
  {
    title: "Sales operations",
    items: [
      { href: "/site-visits", label: "Site Visits", meta: "Visits, maps, scope" },
      { href: "/quotations", label: "Quotations", meta: "Preview, send, close" },
      { href: "/reports", label: "Reports", meta: "Conversion and revenue" },
    ],
  },
  {
    title: "Lead queues",
    items: [
      { href: "/negative-leads", label: "Negative Leads", meta: "Rejected or not valid" },
      { href: "/awaiting-response", label: "Awaiting Response", meta: "Can't say leads" },
      { href: "/follow-up-pending", label: "Follow-up Pending", meta: "Awaiting update" },
      { href: "/unqualified-leads", label: "Unqualified Leads", meta: "N/A leads" },
    ],
  },
];

export default function MorePage() {
  return (
    <div className={pageWrap}>
      <PageHeader
        eyebrow="Operations"
        title="More"
        subtitle="Everything outside the daily mobile tabs."
      />

      <div className="space-y-4">
        {groups.map((group) => (
          <section key={group.title} className="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="border-b border-slate-100 px-4 py-4 dark:border-slate-800">
              <h2 className="text-sm font-bold text-slate-950 dark:text-white">{group.title}</h2>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {group.items.map((item) => (
                <Link key={item.href} href={item.href} className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/70">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-slate-950 dark:text-white">{item.label}</span>
                    <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">{item.meta}</span>
                  </span>
                  <span className="text-sm font-bold text-slate-300 dark:text-slate-600">&gt;</span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
