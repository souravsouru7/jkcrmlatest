import type { Metadata, Viewport } from "next";
import "./globals.css";
import CapacitorInit from "@/components/CapacitorInit";

export const metadata: Metadata = {
  title: "JK Interiors Sales CRM",
  description: "Sales CRM for interior design leads, visits, quotations, and bookings.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f8fafc",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className="bg-slate-50 text-slate-900 antialiased overscroll-none dark:bg-slate-950 dark:text-slate-100">
        <CapacitorInit />
        {children}
      </body>
    </html>
  );
}
