"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  motion,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

// ─── Data ────────────────────────────────────────────────────────────────────

const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Modular Kitchen",
  "Custom Furniture",
  "Interior Styling",
  "Full Turnkey",
];

const BUDGETS = ["Under 5L", "5L – 10L", "10L – 25L", "25L+", "Need guidance"];

const CONTACT_METHODS = [
  {
    label: "Phone",
    value: "+91 90630 96060",
    sub: "Mon – Sat, 9am – 7pm",
    href: "tel:+919063096060",
    icon: "↗",
  },
  {
    label: "WhatsApp",
    value: "Direct message",
    sub: "Usually replies within 2 hours",
    href: "https://wa.me/919063096060",
    icon: "↗",
  },
  {
    label: "Email",
    value: "Info.thejkinteriors@gmail.com",
    sub: "Response within 24 hours",
    href: "mailto:Info.thejkinteriors@gmail.com",
    icon: "↗",
  },
];

const FLOW = [
  { id: "01", title: "Share your scope", desc: "Send us the basics — site, budget, and what you're hoping to achieve." },
  { id: "02", title: "We respond", desc: "Within 24 hours with practical next steps tailored to your project." },
  { id: "03", title: "Book a consultation", desc: "An in-depth conversation about your space, in person or online." },
  { id: "04", title: "Begin design", desc: "We start the process with a clear brief and a committed timeline." },
];

// ─── Variants ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section ref={ref} className="relative flex items-end overflow-hidden" style={{ minHeight: "80vh" }}>
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
        <Image
          src="/images/home.jpg"
          alt="Premium interior consultation — JK Interiors"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/55 to-[#141210]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/65 to-transparent" />
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-20 lg:pb-28"
        style={{ y: textY, opacity }}
      >
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: "easeOut" }}
          className="flex items-center gap-4 mb-8"
        >
          <div className="h-px w-12" style={{ background: "var(--gold)" }} />
          <span
            className="uppercase tracking-[0.22em] text-xs"
            style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
          >
            Contact
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
          className="font-light text-white leading-[1.02]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.8rem, 6.5vw, 6.5rem)",
            maxWidth: "16ch",
          }}
        >
          Tell us what your space needs to{" "}
          <em style={{ color: "var(--gold-soft)" }}>become.</em>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
          className="mt-8 leading-relaxed max-w-md"
          style={{
            color: "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-label)",
            fontSize: "0.97rem",
          }}
        >
          Share your site, scope, and timeline. We respond within 24 hours with a clear,
          practical next step.
        </motion.p>
      </motion.div>

      {/* Scroll line */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        style={{ opacity: useTransform(scrollYProgress, [0, 0.18], [1, 0]) }}
      >
        <span
          className="uppercase tracking-[0.2em]"
          style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-label)", fontSize: "0.6rem" }}
        >
          Scroll
        </span>
        <motion.div
          className="w-px h-10 origin-top"
          style={{ background: "linear-gradient(to bottom, var(--gold), transparent)" }}
          animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </section>
  );
}

// ─── Contact Form Section ─────────────────────────────────────────────────────

const UTM_KEYS = [
  "utm_source", "utm_medium", "utm_campaign", "utm_term",
  "utm_content", "utm_adgroup", "utm_matchtype", "utm_device",
  "utm_ad", "srd", "gad_source", "gad_campaignid", "gbraid", "gclid",
];

function captureUtms() {
  const params = new URLSearchParams(window.location.search);
  const stored: Record<string, string> = {};
  UTM_KEYS.forEach((k) => {
    const v = params.get(k);
    if (v) { sessionStorage.setItem(k, v); stored[k] = v; }
  });
  return stored;
}

function readUtms(): Record<string, string> {
  const out: Record<string, string> = {};
  UTM_KEYS.forEach((k) => {
    const v = sessionStorage.getItem(k);
    if (v) out[k] = v;
  });
  return out;
}

type Status = "idle" | "sending" | "error";

function ContactSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });
  const [status, setStatus] = useState<Status>("idle");
  const router = useRouter();

  useEffect(() => { captureUtms(); }, []);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    const form = e.currentTarget;
    const utms = readUtms();
    const formData = Object.fromEntries(new FormData(form));
    const data = { ...formData, source: "contact-page", ...utms };

    /* save email for GTM enhanced conversions on thank-you page */
    const email = String(formData.email ?? "").trim();
    if (email) sessionStorage.setItem("submittedEmail", email);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      router.push("/thank-you");
    } catch {
      setStatus("error");
    }
  }

  return (
    <section className="py-24 lg:py-36" style={{ background: "#141210" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[380px_1fr] xl:grid-cols-[420px_1fr] gap-16 lg:gap-24"
        >
          {/* ── Left: info panel ── */}
          <motion.aside variants={fadeUp} className="flex flex-col gap-10">
            {/* Intro */}
            <div className="flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <div className="h-px w-12" style={{ background: "var(--gold)" }} />
                <span
                  className="uppercase tracking-[0.22em] text-xs"
                  style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
                >
                  Reach us
                </span>
              </div>
              <h2
                className="font-light text-white leading-[1.1]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1.8rem, 2.8vw, 2.6rem)",
                }}
              >
                Start with a{" "}
                <em style={{ color: "var(--gold-soft)" }}>conversation.</em>
              </h2>
              <p
                className="leading-relaxed text-sm"
                style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)" }}
              >
                Whether you're planning a new home, renovating a single room, or need a full
                turnkey team — send us the basics and we'll shape the next step clearly.
              </p>
            </div>

            {/* Contact methods */}
            <div className="flex flex-col gap-0 border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
              {CONTACT_METHODS.map((m) => (
                <a
                  key={m.label}
                  href={m.href}
                  target={m.href.startsWith("http") ? "_blank" : undefined}
                  rel={m.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="group flex items-start justify-between gap-4 py-5 border-b transition-colors duration-200"
                  style={{
                    borderColor: "rgba(255,255,255,0.07)",
                  }}
                >
                  <div className="flex flex-col gap-1">
                    <span
                      className="text-[0.62rem] uppercase tracking-[0.18em]"
                      style={{ color: "var(--gold)", fontFamily: "var(--font-label)" }}
                    >
                      {m.label}
                    </span>
                    <span
                      className="text-sm font-medium transition-colors duration-200 group-hover:text-white"
                      style={{ color: "rgba(255,255,255,0.72)", fontFamily: "var(--font-label)" }}
                    >
                      {m.value}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-label)" }}
                    >
                      {m.sub}
                    </span>
                  </div>
                  <span
                    className="flex-shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-[-6px] group-hover:translate-x-0"
                    style={{ color: "var(--gold)", fontSize: "0.9rem" }}
                  >
                    {m.icon}
                  </span>
                </a>
              ))}
            </div>

            {/* Response card */}
            <div
              className="flex flex-col gap-2 p-5"
              style={{
                border: "1px solid rgba(216,189,125,0.2)",
                background: "rgba(216,189,125,0.03)",
              }}
            >
              <span
                className="text-[0.6rem] uppercase tracking-[0.18em]"
                style={{ color: "var(--gold)", fontFamily: "var(--font-label)" }}
              >
                Response time
              </span>
              <p
                className="font-light"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "1.1rem",
                  color: "rgba(255,255,255,0.8)",
                }}
              >
                Usually within 24 hours
              </p>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-label)" }}
              >
                Consultations by appointment across Hyderabad
              </span>
            </div>
          </motion.aside>

          {/* ── Right: form ── */}
          <motion.div variants={fadeUp}>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
                {/* Row 1: Name + Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormField label="Full name" name="name" type="text" required placeholder="Arjun Mehta" />
                  <FormField label="Phone number" name="phone" type="tel" required placeholder="+91 98765 43210" />
                </div>

                {/* Email */}
                <FormField label="Email address" name="email" type="email" required placeholder="you@email.com" />

                {/* Row 2: Project type + Budget */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormSelect label="Project type" name="projectType" required options={PROJECT_TYPES} />
                  <FormSelect label="Approximate budget" name="budget" required options={BUDGETS} />
                </div>

                {/* Message */}
                <FormTextarea
                  label="Tell us about your project"
                  name="message"
                  required
                  placeholder="Describe your space, what you'd like to change, and your ideal timeline..."
                  rows={5}
                />

                {/* Error state */}
                {status === "error" && (
                  <p
                    className="text-sm"
                    style={{ color: "rgba(220,80,80,0.9)", fontFamily: "var(--font-label)" }}
                  >
                    Something went wrong. Please call or WhatsApp us directly.
                  </p>
                )}

                {/* Submit */}
                <div className="flex items-center gap-6 pt-2">
                  <button
                    type="submit"
                    disabled={status === "sending"}
                    className="jk-primary-btn"
                    style={{ opacity: status === "sending" ? 0.65 : 1 }}
                  >
                    {status === "sending" ? "Sending…" : "Submit enquiry"}
                  </button>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-label)" }}
                  >
                    * Required fields
                  </span>
                </div>
              </form>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Shared form primitives ───────────────────────────────────────────────────

const inputBase: React.CSSProperties = {
  width: "100%",
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(255,255,255,0.1)",
  color: "#fff",
  fontFamily: "var(--font-label)",
  fontSize: "0.9rem",
  padding: "12px 14px",
  outline: "none",
  transition: "border-color 0.2s",
  borderRadius: 0,
};

function FormField({
  label,
  name,
  type,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  type: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-xs uppercase tracking-[0.14em]"
        style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)" }}
      >
        {label}
        {required && <span style={{ color: "var(--gold)", marginLeft: "3px" }}>*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        style={inputBase}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(216,189,125,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );
}

function FormSelect({
  label,
  name,
  required,
  options,
}: {
  label: string;
  name: string;
  required?: boolean;
  options: string[];
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-xs uppercase tracking-[0.14em]"
        style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)" }}
      >
        {label}
        {required && <span style={{ color: "var(--gold)", marginLeft: "3px" }}>*</span>}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        defaultValue=""
        style={{ ...inputBase, appearance: "none", cursor: "pointer" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(216,189,125,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
      >
        <option value="" disabled style={{ background: "#0d0d0d" }}>
          Select…
        </option>
        {options.map((o) => (
          <option key={o} value={o} style={{ background: "#0d0d0d" }}>
            {o}
          </option>
        ))}
      </select>
    </div>
  );
}

function FormTextarea({
  label,
  name,
  required,
  placeholder,
  rows,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-xs uppercase tracking-[0.14em]"
        style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)" }}
      >
        {label}
        {required && <span style={{ color: "var(--gold)", marginLeft: "3px" }}>*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        required={required}
        placeholder={placeholder}
        rows={rows ?? 5}
        style={{ ...inputBase, resize: "vertical", minHeight: "120px" }}
        onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(216,189,125,0.5)")}
        onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)")}
      />
    </div>
  );
}

// ─── Sub-component for FlowSection (hooks cannot be called in .map) ──────────

function FlowStep({ step, i }: { step: (typeof FLOW)[number]; i: number }) {
  const stepRef = useRef(null);
  const stepInView = useInView(stepRef, { once: true, margin: "-5%" });
  return (
    <motion.div
      ref={stepRef}
      initial={{ opacity: 0, y: 32 }}
      animate={stepInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: i * 0.12, ease: "easeOut" }}
      className="relative flex gap-5 lg:flex-col lg:gap-5"
    >
      {i < FLOW.length - 1 && (
        <div
          className="hidden lg:block absolute top-5 left-[calc(1.25rem+1px)] right-0 h-px"
          style={{ background: "rgba(255,255,255,0.07)", zIndex: 0 }}
        />
      )}
      <div
        className="relative z-10 flex-shrink-0 w-10 h-10 flex items-center justify-center"
        style={{ border: "1px solid rgba(216,189,125,0.35)", background: "rgba(216,189,125,0.05)" }}
      >
        <span style={{ color: "var(--gold)", fontFamily: "var(--font-label)", fontSize: "0.62rem", letterSpacing: "0.12em" }}>
          {step.id}
        </span>
      </div>
      <div className="flex flex-col gap-2 pb-10 lg:pb-0">
        <h3 className="text-white font-light" style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>
          {step.title}
        </h3>
        <p className="text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-label)" }}>
          {step.desc}
        </p>
      </div>
      {i < FLOW.length - 1 && (
        <div
          className="lg:hidden absolute left-5 top-10 bottom-0 w-px"
          style={{ background: "rgba(255,255,255,0.07)" }}
        />
      )}
    </motion.div>
  );
}

// ─── What Happens Next ────────────────────────────────────────────────────────

function FlowSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      className="py-24 lg:py-32"
      style={{
        background: "linear-gradient(180deg, #1a1715 0%, #141210 100%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="flex flex-col gap-5 mb-16 lg:mb-20"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <div className="h-px w-12" style={{ background: "var(--gold)" }} />
            <span
              className="uppercase tracking-[0.22em] text-xs"
              style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
            >
              What happens next
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-light text-white leading-[1.06]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2rem, 4vw, 3.5rem)",
              maxWidth: "22ch",
            }}
          >
            From first message to{" "}
            <em style={{ color: "var(--gold-soft)" }}>design start</em> — four clear steps.
          </motion.h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-0 lg:gap-10">
          {FLOW.map((step, i) => (
            <FlowStep key={step.id} step={step} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ContactPage() {
  return (
    <main className="jk-inner-page" style={{ background: "#141210" }}>
      <SiteHeader />
      <HeroSection />
      <ContactSection />
      <FlowSection />
      <SiteFooter />
    </main>
  );
}
