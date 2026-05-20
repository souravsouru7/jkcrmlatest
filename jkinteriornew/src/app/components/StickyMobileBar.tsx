"use client";

import Image from "next/image";
import Link from "next/link";

export default function StickyMobileBar() {
  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 sm:hidden"
      style={{
        background: "rgba(12,11,9,0.96)",
        borderTop: "1px solid rgba(176,137,104,0.22)",
        backdropFilter: "blur(14px)",
      }}
    >
      <Link href="/" aria-label="JK Interiors home" className="flex items-center gap-2 flex-shrink-0">
        <Image
          src="/logo.png"
          alt="JK Interiors"
          width={32}
          height={32}
          className="object-contain"
          style={{ maxHeight: "32px", width: "auto" }}
        />
        <span
          style={{
            color: "rgba(255,255,255,0.7)",
            fontFamily: "var(--font-label)",
            fontSize: "0.65rem",
            letterSpacing: "0.14em",
            textTransform: "uppercase",
          }}
        >
          JK Interiors
        </span>
      </Link>

      <Link
        href="/contact"
        className="jk-primary-btn flex-shrink-0"
        style={{ padding: "0 20px", fontSize: "0.72rem", minWidth: "auto", height: "38px" }}
      >
        Enquire Now
      </Link>
    </div>
  );
}
