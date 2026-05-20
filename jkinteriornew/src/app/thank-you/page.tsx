"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

export default function ThankYouPage() {
  /* Fire GTM lead_conversion event with submitted email if available */
  useEffect(() => {
    const email = sessionStorage.getItem("submittedEmail");
    if (email && typeof window !== "undefined") {
      (window as { dataLayer?: unknown[] }).dataLayer =
        (window as { dataLayer?: unknown[] }).dataLayer || [];
      ((window as { dataLayer?: unknown[] }).dataLayer as unknown[]).push({
        event: "lead_conversion",
        enhanced_conversion_data: { email },
      });
    }
  }, []);

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 text-center"
      style={{ background: "#0c0b09" }}
    >
      {/* Logo */}
      <Link href="/" aria-label="JK Interiors home" className="mb-12">
        <Image src="/logo.png" alt="JK Interiors" width={56} height={56} className="object-contain mx-auto" />
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
        className="flex flex-col items-center gap-6 max-w-lg"
        style={{
          border: "1px solid rgba(176,137,104,0.2)",
          background: "rgba(255,255,255,0.02)",
          padding: "clamp(40px, 6vw, 64px) clamp(24px, 5vw, 48px)",
        }}
      >
        {/* Checkmark */}
        <div
          className="w-14 h-14 flex items-center justify-center"
          style={{ border: "1px solid rgba(216,189,125,0.4)", background: "rgba(216,189,125,0.06)" }}
        >
          <span style={{ color: "var(--gold)", fontSize: "1.5rem" }}>✓</span>
        </div>

        {/* Gold rule */}
        <div className="h-px w-12" style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }} />

        <h1
          className="font-light text-white leading-[1.1]"
          style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4vw, 3rem)" }}
        >
          Thank You!
        </h1>

        <p
          className="leading-relaxed"
          style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-label)", fontSize: "0.97rem" }}
        >
          Your details have been successfully submitted. One of our design experts will get in touch
          with you shortly to discuss your dream space.
        </p>

        <div className="h-px w-10" style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }} />

        <div className="flex flex-col sm:flex-row gap-4 pt-2 w-full justify-center">
          <Link href="/" className="jk-primary-btn justify-center" style={{ minWidth: "auto", padding: "0 28px" }}>
            Return home
          </Link>
          <Link href="/gallery" className="jk-secondary-btn justify-center" style={{ minWidth: "auto", padding: "0 28px" }}>
            View our work
          </Link>
        </div>
      </motion.div>

      {/* Contact hint */}
      <p
        className="mt-10 text-xs uppercase tracking-[0.14em]"
        style={{ color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-label)" }}
      >
        Or reach us directly at{" "}
        <a href="tel:+919063096060" style={{ color: "var(--gold-soft)" }}>+91 90630 96060</a>
      </p>
    </main>
  );
}
