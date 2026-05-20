"use client";

import { FormEvent, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const PROJECT_TYPES = ["Residential", "Commercial", "Modular Kitchen", "Custom Furniture", "Full Turnkey"];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.04)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontFamily: "var(--font-label)",
  fontSize: "0.92rem",
  padding: "14px 16px",
  outline: "none",
  borderRadius: 0,
  transition: "border-color 0.2s",
};

export default function LeadPopup() {
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  useEffect(() => {
    if (sessionStorage.getItem("jk_popup_dismissed")) return;
    const t = window.setTimeout(() => setVisible(true), 5000);
    return () => window.clearTimeout(t);
  }, []);

  function dismiss() {
    sessionStorage.setItem("jk_popup_dismissed", "1");
    setVisible(false);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const data = { ...Object.fromEntries(new FormData(e.currentTarget)), source: "popup" };
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setStatus("sent");
      setTimeout(dismiss, 3000);
    } catch {
      setStatus("idle");
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100]"
            style={{ background: "rgba(4,4,4,0.82)", backdropFilter: "blur(8px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={dismiss}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 20 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="relative w-full flex flex-col lg:flex-row overflow-hidden"
              style={{
                maxWidth: "860px",
                background: "#0b0a08",
                border: "1px solid rgba(216,189,125,0.2)",
                boxShadow: "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(216,189,125,0.06)",
              }}
            >
              {/* Gold accent line top */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, var(--gold), rgba(216,189,125,0.4) 60%, transparent)" }}
              />

              {/* ── Left panel ── */}
              <div
                className="hidden lg:flex flex-col justify-between p-10 xl:p-12"
                style={{
                  width: "340px",
                  flexShrink: 0,
                  background: "linear-gradient(160deg, rgba(216,189,125,0.07) 0%, rgba(216,189,125,0.02) 100%)",
                  borderRight: "1px solid rgba(216,189,125,0.1)",
                }}
              >
                <div className="flex flex-col gap-8">
                  {/* Eyebrow */}
                  <div className="flex items-center gap-3">
                    <div className="h-px w-8" style={{ background: "var(--gold)" }} />
                    <span
                      className="uppercase tracking-[0.22em]"
                      style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)", fontSize: "0.65rem" }}
                    >
                      Free consultation
                    </span>
                  </div>

                  {/* Headline */}
                  <h2
                    className="font-light text-white leading-[1.1]"
                    style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 2.8vw, 2.6rem)" }}
                  >
                    Let's shape your{" "}
                    <em style={{ color: "var(--gold-soft)" }}>ideal space.</em>
                  </h2>

                  <p
                    className="leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-label)", fontSize: "0.9rem" }}
                  >
                    Tell us what you're planning. We'll get back within 24 hours with a clear
                    next step — no obligation.
                  </p>

                  {/* Trust points */}
                  <div className="flex flex-col gap-4 mt-2">
                    {[
                      "50+ projects delivered across Hyderabad",
                      "Turnkey execution, fixed timelines",
                      "1-year post-handover warranty",
                    ].map((pt) => (
                      <div key={pt} className="flex items-start gap-3">
                        <span style={{ color: "var(--gold)", fontSize: "0.7rem", marginTop: "3px", flexShrink: 0 }}>◆</span>
                        <span
                          style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-label)", fontSize: "0.82rem", lineHeight: 1.5 }}
                        >
                          {pt}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom quote */}
                <blockquote
                  className="italic font-light"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "1rem",
                    color: "rgba(255,255,255,0.2)",
                    borderLeft: "2px solid rgba(216,189,125,0.25)",
                    paddingLeft: "14px",
                    lineHeight: 1.5,
                  }}
                >
                  "Designed for quiet confidence."
                </blockquote>
              </div>

              {/* ── Right panel: form ── */}
              <div className="flex-1 flex flex-col p-8 lg:p-10 xl:p-12 gap-8">
                {/* Mobile eyebrow */}
                <div className="flex lg:hidden items-center gap-3">
                  <div className="h-px w-8" style={{ background: "var(--gold)" }} />
                  <span
                    className="uppercase tracking-[0.2em]"
                    style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)", fontSize: "0.65rem" }}
                  >
                    Free consultation
                  </span>
                </div>

                {status === "sent" ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col items-center justify-center gap-6 py-10 text-center flex-1"
                  >
                    <div
                      className="w-16 h-16 flex items-center justify-center"
                      style={{ border: "1px solid rgba(216,189,125,0.4)", background: "rgba(216,189,125,0.06)" }}
                    >
                      <span style={{ color: "var(--gold)", fontSize: "1.5rem" }}>✓</span>
                    </div>
                    <div className="flex flex-col gap-3">
                      <h3
                        className="font-light text-white"
                        style={{ fontFamily: "var(--font-display)", fontSize: "2rem" }}
                      >
                        We'll be in touch.
                      </h3>
                      <p
                        className="leading-relaxed max-w-xs mx-auto"
                        style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-label)", fontSize: "0.9rem" }}
                      >
                        Expect a response within 24 hours. We look forward to hearing about your space.
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1">
                      <h3
                        className="font-light text-white leading-[1.1] lg:hidden"
                        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.8rem, 5vw, 2.4rem)" }}
                      >
                        Let's shape your{" "}
                        <em style={{ color: "var(--gold-soft)" }}>ideal space.</em>
                      </h3>
                      <p
                        className="hidden lg:block"
                        style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-label)", fontSize: "0.85rem" }}
                      >
                        Fill in the details below — we respond within 24 hours.
                      </p>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                      {/* Name + Phone */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="popup-name"
                            className="uppercase tracking-[0.14em]"
                            style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-label)", fontSize: "0.65rem" }}
                          >
                            Full name <span style={{ color: "var(--gold)" }}>*</span>
                          </label>
                          <input
                            id="popup-name"
                            name="name"
                            type="text"
                            required
                            placeholder="Arjun Mehta"
                            style={inputStyle}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(216,189,125,0.55)")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label
                            htmlFor="popup-phone"
                            className="uppercase tracking-[0.14em]"
                            style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-label)", fontSize: "0.65rem" }}
                          >
                            Phone number <span style={{ color: "var(--gold)" }}>*</span>
                          </label>
                          <input
                            id="popup-phone"
                            name="phone"
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            style={inputStyle}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(216,189,125,0.55)")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                          />
                        </div>
                      </div>

                      {/* Project type */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="popup-project"
                          className="uppercase tracking-[0.14em]"
                          style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-label)", fontSize: "0.65rem" }}
                        >
                          Project type <span style={{ color: "var(--gold)" }}>*</span>
                        </label>
                        <div className="relative">
                          <select
                            id="popup-project"
                            name="projectType"
                            required
                            defaultValue=""
                            style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: "40px" }}
                            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(216,189,125,0.55)")}
                            onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                          >
                            <option value="" disabled style={{ background: "#0d0d0d" }}>Select your project type…</option>
                            {PROJECT_TYPES.map((o) => (
                              <option key={o} value={o} style={{ background: "#0d0d0d" }}>{o}</option>
                            ))}
                          </select>
                          <span
                            className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none"
                            style={{ color: "rgba(216,189,125,0.6)", fontSize: "0.7rem" }}
                          >
                            ▾
                          </span>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="flex flex-col gap-2">
                        <label
                          htmlFor="popup-message"
                          className="uppercase tracking-[0.14em]"
                          style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-label)", fontSize: "0.65rem" }}
                        >
                          Description
                        </label>
                        <textarea
                          id="popup-message"
                          name="message"
                          rows={3}
                          placeholder="Tell us about your space, timeline, or any specific requirements..."
                          style={{
                            ...inputStyle,
                            resize: "none",
                            minHeight: "80px",
                          }}
                          onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(216,189,125,0.55)")}
                          onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
                        />
                      </div>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        className="jk-primary-btn w-full justify-center mt-1"
                        style={{
                          opacity: status === "sending" ? 0.65 : 1,
                          padding: "16px 24px",
                          fontSize: "0.8rem",
                          letterSpacing: "0.18em",
                        }}
                      >
                        {status === "sending" ? "Sending…" : "Request a free consultation →"}
                      </button>

                      <p
                        className="text-center"
                        style={{ color: "rgba(255,255,255,0.18)", fontFamily: "var(--font-label)", fontSize: "0.72rem" }}
                      >
                        No spam. We'll only reach out about your project.
                      </p>
                    </form>
                  </>
                )}
              </div>

              {/* Close button */}
              <button
                onClick={dismiss}
                aria-label="Close"
                className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center transition-all duration-200"
                style={{
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.35)",
                  fontSize: "0.8rem",
                  background: "transparent",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(216,189,125,0.4)";
                  e.currentTarget.style.color = "rgba(216,189,125,0.8)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.35)";
                }}
              >
                ✕
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
