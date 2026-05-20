"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

const WA_URL = `https://wa.me/919063096060?text=${encodeURIComponent("Hi, I'd like to schedule a consultation with JK Interiors.")}`;

const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Gallery", href: "/gallery" },
  { label: "Philosophy", href: "/philosophy" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Lock scroll when menu open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <header className="jk-site-header">
        <nav className="jk-site-nav">
          <Link href="/" className="jk-logo" aria-label="JK Interiors home">
            <Image
              src="/logo.png"
              alt="JK Interiors"
              width={48}
              height={48}
              className="object-contain"
              style={{ maxHeight: "48px", width: "auto" }}
              priority
            />
            <span className="jk-logo-copy">
              <strong>JK Interiors</strong>
              <span>Design & Build Studio</span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="jk-site-links">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="jk-nav-link"
                style={pathname === item.href ? { color: "var(--gold-soft)", opacity: 1 } : {}}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a href={WA_URL} target="_blank" rel="noopener noreferrer" className="jk-nav-cta hidden sm:flex">
              Schedule a call
            </a>

            {/* Hamburger — mobile only */}
            <button
              className="jk-hamburger"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
            >
              <span className={`jk-ham-bar ${open ? "jk-ham-open-1" : ""}`} />
              <span className={`jk-ham-bar ${open ? "jk-ham-open-2" : ""}`} />
              <span className={`jk-ham-bar ${open ? "jk-ham-open-3" : ""}`} />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 z-[80]"
              style={{ background: "rgba(4,4,4,0.7)", backdropFilter: "blur(6px)" }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 bottom-0 z-[90] flex flex-col"
              style={{
                width: "min(320px, 88vw)",
                background: "#1a1715",
                borderLeft: "1px solid rgba(216,189,125,0.15)",
              }}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-6 py-5"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
              >
                <Link href="/" className="jk-logo" onClick={() => setOpen(false)}>
                  <Image src="/logo.png" alt="JK Interiors" width={36} height={36} className="object-contain" />
                  <strong style={{ color: "#fff", fontFamily: "var(--font-label)", fontSize: "0.78rem", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    JK Interiors
                  </strong>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  style={{ color: "rgba(255,255,255,0.4)", fontSize: "1.2rem", background: "none", border: "none", cursor: "pointer", lineHeight: 1 }}
                >
                  ✕
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-col flex-1 px-6 py-8 gap-1">
                {NAV_ITEMS.map((item, i) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.3, ease: "easeOut" }}
                  >
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-between py-4 group"
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        color: pathname === item.href ? "var(--gold-soft)" : "rgba(255,255,255,0.72)",
                        fontFamily: "var(--font-label)",
                        fontSize: "0.85rem",
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                      }}
                    >
                      {item.label}
                      <span style={{ color: "var(--gold)", opacity: pathname === item.href ? 1 : 0.3, fontSize: "0.75rem" }}>→</span>
                    </Link>
                  </motion.div>
                ))}
              </nav>

              {/* CTA */}
              <div className="px-6 pb-8">
                <a
                  href={WA_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className="jk-primary-btn w-full justify-center"
                  style={{ display: "flex" }}
                >
                  Schedule a call
                </a>
                <div className="mt-5 flex flex-col gap-2">
                  <a
                    href="tel:+919063096060"
                    style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-label)", fontSize: "0.75rem", letterSpacing: "0.08em" }}
                  >
                    +91 90630 96060
                  </a>
                  <a
                    href="mailto:Info.thejkinteriors@gmail.com"
                    style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-label)", fontSize: "0.72rem" }}
                  >
                    Info.thejkinteriors@gmail.com
                  </a>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
