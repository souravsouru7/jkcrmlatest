"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, useScroll, useTransform, type Variants } from "framer-motion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

// ─── Data ────────────────────────────────────────────────────────────────────

/* ── SVG Icons ── */
function IconHouse() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 20L24 5l18 15" />
      <path d="M10 17v22h10V27h8v12h10V17" />
      <rect x="19" y="35" width="10" height="4" rx="0.5" />
    </svg>
  );
}
function IconBuilding() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="8" y="6" width="22" height="36" rx="1" />
      <path d="M30 18h10v24H30" />
      <line x1="14" y1="13" x2="20" y2="13" />
      <line x1="14" y1="20" x2="20" y2="20" />
      <line x1="14" y1="27" x2="20" y2="27" />
      <line x1="34" y1="25" x2="38" y2="25" />
      <line x1="34" y1="32" x2="38" y2="32" />
      <rect x="16" y="34" width="8" height="8" rx="0.5" />
    </svg>
  );
}
function IconKitchen() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="10" width="36" height="28" rx="2" />
      <line x1="6" y1="22" x2="42" y2="22" />
      <circle cx="16" cy="16" r="3" />
      <circle cx="32" cy="16" r="3" />
      <rect x="12" y="26" width="10" height="8" rx="1" />
      <line x1="26" y1="26" x2="36" y2="26" />
      <line x1="26" y1="30" x2="36" y2="30" />
      <line x1="26" y1="34" x2="36" y2="34" />
    </svg>
  );
}
function IconWardrobe() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="7" y="6" width="34" height="36" rx="1.5" />
      <line x1="24" y1="6" x2="24" y2="42" />
      <circle cx="21" cy="24" r="1.5" />
      <circle cx="27" cy="24" r="1.5" />
      <line x1="7" y1="38" x2="3" y2="44" />
      <line x1="41" y1="38" x2="45" y2="44" />
    </svg>
  );
}
function IconStyling() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 6 L28 18 H20 Z" />
      <line x1="24" y1="18" x2="24" y2="32" />
      <ellipse cx="24" cy="36" rx="10" ry="4" />
      <line x1="14" y1="36" x2="10" y2="44" />
      <line x1="34" y1="36" x2="38" y2="44" />
      <line x1="14" y1="44" x2="34" y2="44" />
    </svg>
  );
}
function IconBudget() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="24" cy="24" r="18" />
      <path d="M24 10v4M24 34v4" />
      <path d="M17 17.5c0-2.5 3-4 7-3s6 3 4 5.5-8 3-9 6 2 5.5 7 5 7-3 5-6" />
    </svg>
  );
}

const SERVICES = [
  {
    id: "01",
    title: "Residential Interiors",
    tagline: "Homes · Apartments · Villas",
    description:
      "We transform raw space into refined living — each room balanced between beauty and the ease of everyday life.",
    features: ["Living rooms", "Bedrooms", "Bathrooms", "Kids' rooms"],
    Icon: IconHouse,
  },
  {
    id: "02",
    title: "Commercial Design",
    tagline: "Offices · Retail · Hospitality",
    description:
      "Brand-led spaces that command attention, drive footfall, and communicate your identity through every surface.",
    features: ["Office planning", "Retail layouts", "Hospitality interiors", "Brand-led spaces"],
    Icon: IconBuilding,
  },
  {
    id: "03",
    title: "Modular Kitchens",
    tagline: "Storage · Surfaces · Appliances",
    description:
      "Where precision engineering meets culinary artistry — kitchens that function with the same effortlessness they inspire.",
    features: ["Custom layouts", "Smart storage", "Premium finishes", "Appliance integration"],
    Icon: IconKitchen,
  },
  {
    id: "04",
    title: "Wardrobes & Storage",
    tagline: "Built-ins · Wardrobes · Seating",
    description:
      "Every piece made to measure — built for your exact space, your exact life, and no one else's.",
    features: ["Custom wardrobes", "Built-in storage", "Walk-in closets", "Modular shelving"],
    Icon: IconWardrobe,
  },
  {
    id: "05",
    title: "Interior Styling",
    tagline: "Art · Decor · Lighting · Textiles",
    description:
      "The finishing layer — where materials, light, and curated objects converge to complete the story of a space.",
    features: ["Decor selection", "Lighting mood", "Colour coordination", "Furniture placement"],
    Icon: IconStyling,
  },
  {
    id: "06",
    title: "Budget-Conscious Design",
    tagline: "Phased · Smart · Efficient",
    description:
      "Premium aesthetics don't require unlimited budgets — they require smarter decisions, better sequencing, and the right eye.",
    features: ["Material alternatives", "Space optimisation", "Phased execution", "Focused styling"],
    Icon: IconBudget,
  },
];

const PROCESS = [
  {
    step: "01",
    title: "Discovery",
    desc: "We immerse ourselves in your site, lifestyle, goals, constraints, and timeline before a single line is drawn.",
  },
  {
    step: "02",
    title: "Planning",
    desc: "Layouts, circulation, storage hierarchies, and material logic are resolved into a spatial strategy.",
  },
  {
    step: "03",
    title: "Design",
    desc: "Detailed drawings, curated material palettes, lighting plans, and 3D visualisations bring the vision to life.",
  },
  {
    step: "04",
    title: "Execution",
    desc: "Our project managers oversee every contractor, every surface, and every deadline with relentless precision.",
  },
  {
    step: "05",
    title: "Handover",
    desc: "A thorough walkthrough, documented warranties, and ongoing aftercare — we remain your partner long after keys are handed.",
  },
];

const STATS = [
  { value: "340+", label: "Projects completed" },
  { value: "12", label: "Years in practice" },
  { value: "98%", label: "Client satisfaction" },
  { value: "6", label: "Cities served" },
];

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 48 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.9, ease: "easeOut" },
  },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.8, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};

const lineGrow: Variants = {
  hidden: { scaleX: 0 },
  show: {
    scaleX: 1,
    transition: { duration: 1.2, ease: "easeOut" },
  },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ServiceCard({
  service,
  index,
}: {
  service: (typeof SERVICES)[0];
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6%" });

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: (index % 2) * 0.12, ease: "easeOut" }}
      className="group relative flex flex-col gap-6 p-8 lg:p-10 border-b border-r"
      style={{
        borderColor: "rgba(255,255,255,0.07)",
        background: "transparent",
        cursor: "default",
        transition: "background 0.35s ease",
      }}
      whileHover={{ backgroundColor: "rgba(216,189,125,0.04)" }}
    >
      {/* Gold top accent line — appears on hover */}
      <div
        className="absolute top-0 left-0 right-0 h-px origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"
        style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }}
      />

      {/* Icon */}
      <div
        className="flex-shrink-0 w-14 h-14 flex items-center justify-center"
        style={{
          color: "var(--gold)",
          border: "1px solid rgba(216,189,125,0.25)",
          background: "rgba(216,189,125,0.05)",
        }}
      >
        <service.Icon />
      </div>

      {/* Step label */}
      <span
        style={{
          color: "rgba(255,255,255,0.22)",
          fontFamily: "var(--font-label)",
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
        }}
      >
        {service.id}
      </span>

      {/* Title */}
      <h2
        className="font-semibold text-white leading-tight"
        style={{
          fontFamily: "var(--font-label)",
          fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
          letterSpacing: "0.02em",
          marginTop: "-8px",
        }}
      >
        {service.title}
      </h2>

      {/* Gold rule */}
      <div
        className="h-px w-10 group-hover:w-16 transition-all duration-500"
        style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }}
      />

      {/* Description */}
      <p
        className="leading-relaxed"
        style={{
          color: "rgba(255,255,255,0.48)",
          fontFamily: "var(--font-label)",
          fontSize: "0.88rem",
          lineHeight: 1.75,
        }}
      >
        {service.description}
      </p>

      {/* Feature pills */}
      <ul className="flex flex-wrap gap-2 mt-auto pt-2">
        {service.features.map((f) => (
          <li
            key={f}
            className="text-xs px-3 py-1"
            style={{
              border: "1px solid rgba(216,189,125,0.18)",
              color: "rgba(255,255,255,0.38)",
              fontFamily: "var(--font-label)",
              letterSpacing: "0.06em",
              fontSize: "0.65rem",
            }}
          >
            {f}
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

function ProcessStep({
  step,
  isLast,
}: {
  step: (typeof PROCESS)[0];
  isLast: boolean;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className="relative flex gap-6 lg:flex-col lg:gap-5"
    >
      {/* Connector line (desktop horizontal, mobile vertical) */}
      {!isLast && (
        <div
          className="hidden lg:block absolute top-5 left-[calc(1.25rem+1px)] right-0 h-px"
          style={{ background: "rgba(255,255,255,0.08)", zIndex: 0 }}
        />
      )}

      {/* Step circle */}
      <motion.div
        variants={fadeIn}
        className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center"
        style={{
          borderColor: "rgba(216,189,125,0.4)",
          background: "rgba(216,189,125,0.06)",
        }}
      >
        <span
          style={{
            color: "var(--gold)",
            fontFamily: "var(--font-label)",
            fontSize: "0.65rem",
            letterSpacing: "0.12em",
          }}
        >
          {step.step}
        </span>
      </motion.div>

      {/* Text */}
      <div className="flex flex-col gap-2 pb-8 lg:pb-0">
        <motion.h3
          variants={fadeUp}
          className="text-white font-light"
          style={{ fontFamily: "var(--font-display)", fontSize: "1.35rem" }}
        >
          {step.title}
        </motion.h3>
        <motion.p
          variants={fadeUp}
          className="text-sm leading-relaxed"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)" }}
        >
          {step.desc}
        </motion.p>
      </div>

      {/* Vertical connector for mobile */}
      {!isLast && (
        <div
          className="lg:hidden absolute left-5 top-10 bottom-0 w-px"
          style={{ background: "rgba(255,255,255,0.08)" }}
        />
      )}
    </motion.div>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative flex items-end overflow-hidden"
      style={{ minHeight: "92vh" }}
    >
      {/* Parallax background */}
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
        <Image
          src="/images/banner-image.jpg"
          alt="JK Interiors — luxury interior design"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Multi-layer gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/60 to-transparent" />
      </motion.div>

      {/* Content */}
      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-20 lg:pb-28"
        style={{ y: textY, opacity }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4 mb-8"
        >
          <div
            className="h-px w-12"
            style={{ background: "var(--gold)" }}
          />
          <span
            className="uppercase tracking-[0.22em] text-xs"
            style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
          >
            Our Services
          </span>
        </motion.div>

        {/* Main headline */}
        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="font-light text-white leading-[1.02]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 7.5vw, 7rem)",
            maxWidth: "14ch",
          }}
        >
          Design that <em style={{ color: "var(--gold-soft)" }}>lives</em> as beautifully as it looks.
        </motion.h1>

        {/* Subtext + CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col sm:flex-row items-start sm:items-end gap-8 mt-10"
        >
          <p
            className="leading-relaxed max-w-sm"
            style={{
              color: "rgba(255,255,255,0.52)",
              fontFamily: "var(--font-label)",
              fontSize: "0.97rem",
            }}
          >
            From first layout to final handover — six distinct disciplines, one unified studio.
          </p>
          <Link href="/contact" className="jk-primary-btn flex-shrink-0">
            Book a consultation
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        style={{ opacity: useTransform(scrollYProgress, [0, 0.15], [1, 0]) }}
      >
        <span
          className="uppercase tracking-[0.2em]"
          style={{
            color: "rgba(255,255,255,0.3)",
            fontFamily: "var(--font-label)",
            fontSize: "0.6rem",
          }}
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

// ─── Stats Bar ───────────────────────────────────────────────────────────────

function StatsBar() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.section
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className="border-y"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        {STATS.map((stat) => (
          <motion.div
            key={stat.label}
            variants={fadeUp}
            className="flex flex-col items-center justify-center gap-2 py-10 px-6 text-center"
          >
            <span
              className="leading-none"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2.4rem, 4vw, 3.2rem)",
                color: "var(--gold-soft)",
                fontWeight: 300,
              }}
            >
              {stat.value}
            </span>
            <span
              className="uppercase tracking-[0.14em]"
              style={{
                fontFamily: "var(--font-label)",
                fontSize: "0.65rem",
                color: "rgba(255,255,255,0.38)",
              }}
            >
              {stat.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}

// ─── Process Section — Snake Path ────────────────────────────────────────────

const STEP_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&q=80", // Discovery — site visit
  "https://images.unsplash.com/photo-1503174971373-b1f69850bded?w=400&q=80", // Planning — blueprints
  "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&q=80", // Design — 3D render
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&q=80", // Execution — on-site
  "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&q=80", // Handover — finished room
];

/* ViewBox: 1200 × 520.  Snake: 3 rows at y=100, y=280, y=460 */
const VB_W = 1200;
const VB_H = 520;

const SNAKE_POS = [
  { x: 200,  y: 100, above: false },  /* 01 Discovery   */
  { x: 970,  y: 100, above: false },  /* 02 Planning    */
  { x: 820,  y: 280, above: true  },  /* 03 Design      */
  { x: 200,  y: 280, above: true  },  /* 04 Execution   */
  { x: 430,  y: 460, above: false },  /* 05 Handover    */
] as const;

function ProcessSection() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-20 lg:py-32"
      style={{ background: "#1a1714", borderTop: "1px solid rgba(255,255,255,0.06)" }}
    >
      {/* Ghost number */}
      <div
        aria-hidden
        className="pointer-events-none select-none absolute right-0 top-1/2 -translate-y-1/2 leading-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(14rem, 28vw, 22rem)",
          color: "rgba(255,255,255,0.025)",
          fontWeight: 300,
        }}
      >
        02
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-20"
          initial={{ opacity: 0, y: 40 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.85, ease: "easeOut" }}
        >
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-4">
              <div className="h-px w-12" style={{ background: "var(--gold)" }} />
              <span className="uppercase tracking-[0.22em] text-xs" style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}>
                How we work
              </span>
            </div>
            <h2
              className="font-light text-white"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4.5vw, 4rem)", lineHeight: 1.06, maxWidth: "14ch" }}
            >
              Design{" "}
              <em style={{ color: "var(--gold-soft)" }}>Process</em>
            </h2>
          </div>
          <p className="max-w-xs text-sm leading-relaxed lg:text-right" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-label)" }}>
            A process built on clarity and craft — from your first brief to final key handover.
          </p>
        </motion.div>

        {/* ═══ DESKTOP — snake path ═══ */}
        <div className="hidden lg:block">
          <div style={{ position: "relative", width: "100%", aspectRatio: `${VB_W} / ${VB_H}` }}>

            {/* SVG track */}
            <svg
              viewBox={`0 0 ${VB_W} ${VB_H}`}
              style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible" }}
              fill="none"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Filled track — warm translucent */}
              <path
                d="M 60 100 H 1140 A 90 90 0 0 1 1140 280 H 60 A 90 90 0 0 0 60 460 H 800"
                stroke="rgba(176,137,104,0.14)"
                strokeWidth="74"
                strokeLinecap="round"
                fill="none"
              />
              {/* Subtle inner edge highlight */}
              <path
                d="M 60 100 H 1140 A 90 90 0 0 1 1140 280 H 60 A 90 90 0 0 0 60 460 H 800"
                stroke="rgba(216,189,125,0.12)"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
              {/* End arrow */}
              <polyline
                points="790,436 820,460 790,484"
                stroke="rgba(216,189,125,0.65)"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Gold dot at each step */}
              {SNAKE_POS.map((p, i) => (
                <circle key={i} cx={p.x} cy={p.y} r="5" fill="var(--gold)" opacity="0.75" />
              ))}
            </svg>

            {/* Step circles */}
            {PROCESS.map((step, i) => {
              const pos = SNAKE_POS[i];
              return (
                <motion.div
                  key={step.step}
                  style={{
                    position: "absolute",
                    left: `${(pos.x / VB_W) * 100}%`,
                    top: `${(pos.y / VB_H) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                  }}
                  initial={{ opacity: 0, scale: 0.55 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.6, delay: 0.25 + i * 0.16, ease: "easeOut" }}
                >
                  {/* Image circle */}
                  <div
                    style={{
                      width: "clamp(78px, 8.5vw, 120px)",
                      height: "clamp(78px, 8.5vw, 120px)",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border: "2px solid rgba(216,189,125,0.55)",
                      boxShadow: "0 0 0 5px rgba(176,137,104,0.1), 0 10px 28px rgba(0,0,0,0.45)",
                      position: "relative",
                    }}
                  >
                    <Image
                      src={STEP_IMAGES[i]}
                      alt={step.title}
                      fill
                      sizes="(min-width:1280px) 120px, 8.5vw"
                      className="object-cover"
                    />
                    {/* Number badge */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(160deg, transparent 45%, rgba(7,7,7,0.7) 100%)",
                      display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                      padding: "8px",
                    }}>
                      <span style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)", fontSize: "0.52rem", letterSpacing: "0.14em", fontWeight: 600 }}>
                        {step.step}
                      </span>
                    </div>
                  </div>

                  {/* Label */}
                  <div
                    style={{
                      position: "absolute",
                      ...(pos.above ? { bottom: "calc(100% + 11px)" } : { top: "calc(100% + 11px)" }),
                      left: "50%",
                      transform: "translateX(-50%)",
                      textAlign: "center",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <span style={{
                      display: "block",
                      color: "rgba(255,255,255,0.88)",
                      fontFamily: "var(--font-display)",
                      fontSize: "clamp(0.68rem, 1.05vw, 0.88rem)",
                      fontWeight: 300,
                      fontStyle: "italic",
                    }}>
                      {step.title}
                    </span>
                    <span style={{
                      display: "block",
                      color: "rgba(255,255,255,0.35)",
                      fontFamily: "var(--font-label)",
                      fontSize: "clamp(0.52rem, 0.6vw, 0.62rem)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginTop: "3px",
                    }}>
                      {step.step}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ═══ MOBILE — vertical timeline ═══ */}
        <div className="lg:hidden relative">
          {/* Vertical gold line */}
          <div
            className="absolute left-[44px] top-0 bottom-0 w-px"
            style={{ background: "linear-gradient(to bottom, transparent, rgba(176,137,104,0.35) 8%, rgba(176,137,104,0.35) 92%, transparent)" }}
          />

          {PROCESS.map((step, i) => {
            const isLast = i === PROCESS.length - 1;
            return (
              <motion.div
                key={step.step}
                className="relative flex gap-5"
                style={{ paddingBottom: isLast ? 0 : "2.5rem" }}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: i * 0.12, ease: "easeOut" }}
              >
                {/* Circle image — centred on the vertical line */}
                <div style={{ flexShrink: 0, width: "88px", display: "flex", justifyContent: "center" }}>
                  <div style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "50%",
                    overflow: "hidden",
                    border: "2px solid rgba(216,189,125,0.55)",
                    boxShadow: "0 0 0 5px rgba(176,137,104,0.09), 0 6px 20px rgba(0,0,0,0.45)",
                    position: "relative",
                    flexShrink: 0,
                  }}>
                    <Image src={STEP_IMAGES[i]} alt={step.title} fill className="object-cover" sizes="88px" />
                    {/* Gradient + step badge */}
                    <div style={{
                      position: "absolute", inset: 0,
                      background: "linear-gradient(150deg, transparent 40%, rgba(7,7,7,0.72) 100%)",
                      display: "flex", alignItems: "flex-end", justifyContent: "flex-end",
                      padding: "7px",
                    }}>
                      <span style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)", fontSize: "0.5rem", letterSpacing: "0.14em", fontWeight: 600 }}>
                        {step.step}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Text */}
                <div className="flex flex-col justify-center gap-1.5 pt-1 pb-2">
                  <span style={{
                    color: "var(--gold)",
                    fontFamily: "var(--font-label)",
                    fontSize: "0.58rem",
                    letterSpacing: "0.2em",
                    textTransform: "uppercase",
                  }}>
                    Step {step.step}
                  </span>
                  <h3
                    className="font-light text-white"
                    style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", lineHeight: 1.1 }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="leading-relaxed"
                    style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)", fontSize: "0.82rem", maxWidth: "34ch" }}
                  >
                    {step.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────

function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      className="relative overflow-hidden py-28 lg:py-40"
      style={{
        background: "linear-gradient(135deg, #1a1715 0%, #1c1a16 50%, #141210 100%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Decorative gold orb */}
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(216,189,125,0.07) 0%, transparent 70%)",
        }}
      />

      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        variants={stagger}
        className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-8"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
          <div className="h-px w-12" style={{ background: "var(--gold)" }} />
          <span
            className="uppercase tracking-[0.22em] text-xs"
            style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
          >
            Start your project
          </span>
          <div className="h-px w-12" style={{ background: "var(--gold)" }} />
        </motion.div>

        <motion.h2
          variants={fadeUp}
          className="font-light text-white leading-[1.06]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(2.5rem, 5.5vw, 5rem)",
          }}
        >
          Every great space begins with{" "}
          <em style={{ color: "var(--gold-soft)" }}>one conversation.</em>
        </motion.h2>

        <motion.p
          variants={fadeUp}
          className="max-w-lg leading-relaxed"
          style={{
            color: "rgba(255,255,255,0.48)",
            fontFamily: "var(--font-label)",
            fontSize: "1rem",
          }}
        >
          Tell us about your space. We'll listen first, design second — and deliver something that
          feels entirely yours.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link href="/contact" className="jk-primary-btn">
            Schedule a consultation
          </Link>
          <Link href="/gallery" className="jk-secondary-btn">
            View our work
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ServicesPage() {
  return (
    <main className="jk-inner-page" style={{ background: "#141210" }}>
      <SiteHeader />
      <HeroSection />
      <StatsBar />

      {/* Section header */}
      <div
        className="max-w-7xl mx-auto px-6 lg:px-12 pt-24 lg:pt-32 pb-2"
      >
        <SectionIntro />
      </div>

      {/* Service icon grid */}
      <div
        className="max-w-7xl mx-auto px-6 lg:px-12 pb-20 lg:pb-28"
      >
        <div
          className="grid grid-cols-1 sm:grid-cols-2 border-t border-l"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          {SERVICES.map((service, i) => (
            <ServiceCard key={service.id} service={service} index={i} />
          ))}
        </div>
      </div>

      <ProcessSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}

function SectionIntro() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className="flex flex-col gap-5 pb-14 lg:pb-20"
    >
      <motion.div variants={fadeUp} className="flex items-center gap-4">
        <div className="h-px w-12" style={{ background: "var(--gold)" }} />
        <span
          className="uppercase tracking-[0.22em] text-xs"
          style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
        >
          What we offer
        </span>
      </motion.div>
      <motion.h2
        variants={fadeUp}
        className="font-light text-white leading-[1.06]"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
          maxWidth: "22ch",
        }}
      >
        Six disciplines. One{" "}
        <em style={{ color: "var(--gold-soft)" }}>unified</em> vision.
      </motion.h2>
      <motion.p
        variants={fadeUp}
        className="max-w-xl leading-relaxed"
        style={{
          color: "rgba(255,255,255,0.48)",
          fontFamily: "var(--font-label)",
          fontSize: "0.97rem",
        }}
      >
        Each service is a distinct discipline — but all share the same commitment to precision,
        restraint, and spaces that feel unmistakably intentional.
      </motion.p>
    </motion.div>
  );
}
