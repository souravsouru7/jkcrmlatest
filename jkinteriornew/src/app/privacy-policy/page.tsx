import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import SiteFooter from "../components/SiteFooter";

export const metadata: Metadata = {
  title: "Privacy Policy — JK Interiors",
  description: "Privacy Policy for JK Interiors — Premium Interior Design Studio, Hyderabad.",
};

export default function PrivacyPolicyPage() {
  return (
    <main style={{ background: "#141210", minHeight: "100vh" }}>
      {/* Simple header */}
      <header
        className="flex items-center justify-between px-6 lg:px-12 py-5"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <Link href="/" className="flex items-center gap-3" aria-label="JK Interiors home">
          <Image src="/logo.png" alt="JK Interiors" width={40} height={40} className="object-contain" style={{ maxHeight: "40px", width: "auto" }} />
          <span style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-label)", fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
            JK Interiors
          </span>
        </Link>
        <Link
          href="/"
          style={{ color: "var(--gold)", fontFamily: "var(--font-label)", fontSize: "0.72rem", letterSpacing: "0.12em", textTransform: "uppercase" }}
        >
          ← Home
        </Link>
      </header>

      {/* Hero */}
      <section
        className="flex flex-col items-center justify-center text-center px-6 py-24 lg:py-36"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="h-px w-10" style={{ background: "var(--gold)" }} />
          <span style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)", fontSize: "0.68rem", letterSpacing: "0.22em", textTransform: "uppercase" }}>
            Legal
          </span>
          <div className="h-px w-10" style={{ background: "var(--gold)" }} />
        </div>
        <h1
          className="font-light text-white leading-tight"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.4rem, 5vw, 4.5rem)" }}
        >
          Privacy <em style={{ color: "var(--gold-soft)" }}>Policy</em>
        </h1>
        <p style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-label)", fontSize: "0.85rem", marginTop: "16px" }}>
          Last updated: May 2026
        </p>
      </section>

      {/* Content */}
      <section className="px-6 py-20 lg:py-28" style={{ maxWidth: "820px", margin: "0 auto" }}>
        {[
          {
            heading: "1. Information We Collect",
            body: "At JK Interiors, we collect information that you provide directly to us when you fill out a form, request a quote, or communicate with us. This may include your name, email address, phone number, location, and details about your interior design project.",
          },
          {
            heading: "2. How We Use Your Information",
            body: "We use the information we collect to communicate with you, provide our interior design services, send you updates or marketing materials (if you have opted in), and improve our website and customer service. We also use data to track marketing performance and conversions.",
          },
          {
            heading: "3. Information Sharing",
            body: "We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties without your consent, except to trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential.",
          },
          {
            heading: "4. Data Security",
            body: "We implement a variety of security measures to maintain the safety of your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure.",
          },
          {
            heading: "5. Changes to This Policy",
            body: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.",
          },
          {
            heading: "6. Contact Us",
            body: "If you have any questions about this Privacy Policy, please contact us via our website's contact form or email us at Info.thejkinteriors@gmail.com.",
          },
        ].map((section, i) => (
          <div
            key={section.heading}
            className="flex flex-col gap-4 py-10"
            style={{ borderBottom: i < 5 ? "1px solid rgba(255,255,255,0.06)" : "none" }}
          >
            <h2
              className="font-light text-white"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2vw, 1.6rem)" }}
            >
              {section.heading}
            </h2>
            <p
              className="leading-relaxed"
              style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-label)", fontSize: "0.97rem" }}
            >
              {section.body}
            </p>
          </div>
        ))}

        <div className="mt-12 flex gap-4">
          <Link href="/" className="jk-secondary-btn" style={{ minWidth: "auto", padding: "0 24px" }}>
            Return home
          </Link>
          <Link href="/contact" className="jk-primary-btn" style={{ minWidth: "auto", padding: "0 24px" }}>
            Contact us
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
