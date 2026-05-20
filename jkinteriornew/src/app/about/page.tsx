
"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
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

const STATS = [
  { value: "4.5+", label: "Years of practice" },
  { value: "50+", label: "Completed projects" },
  { value: "100%", label: "Client-first process" },
  { value: "1 yr", label: "Warranty support" },
];

const PRINCIPLES = [
  {
    id: "01",
    title: "Listen before drawing",
    body: "We begin with routines, storage needs, natural light, site realities, budget, and timeline — before a single line is drawn.",
  },
  {
    id: "02",
    title: "Resolve function early",
    body: "Layouts, circulation, and storage hierarchies are fixed completely before any styling decisions are entertained.",
  },
  {
    id: "03",
    title: "Build with restraint",
    body: "Material palettes stay calm, durable, and easy to live with. We favour longevity over novelty every time.",
  },
  {
    id: "04",
    title: "Communicate through execution",
    body: "Clients receive clear decisions, regular site updates, and disciplined handover support from first brief to final key.",
  },
];

const VALUES = [
  "Design around real routines",
  "Keep materials calm and durable",
  "Resolve storage before styling",
  "Communicate clearly through execution",
  "Protect budget with smart priorities",
  "Finish every detail with discipline",
];

const TESTIMONIALS = [
  {
    quote:
      "JK Interiors didn't just make our home beautiful — they made it work. Every storage decision, every light placement felt considered for how we actually live.",
    name: "Priya & Arjun Mehta",
    role: "Residential client · Jubilee Hills",
    initial: "PM",
  },
  {
    quote:
      "The process was remarkably calm. They resolved every layout question before touching materials, and the result is a kitchen we use every day without thinking about it — which is the highest compliment.",
    name: "Sanjay Reddy",
    role: "Modular Kitchen · Kondapur",
    initial: "SR",
  },
  {
    quote:
      "Our office feels like it belongs to us. The team listened carefully, kept within budget, and delivered exactly what we described — only better.",
    name: "Kavitha Nair",
    role: "Commercial client · HITEC City",
    initial: "KN",
  },
];

// ─── Variants ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 44 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: "easeOut" } },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.85, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.13 } },
};

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section ref={ref} className="relative flex items-end overflow-hidden" style={{ minHeight: "92vh" }}>
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
        <Image
          src="/images/about-us.jpg"
          alt="JK Interiors studio — premium interior design Hyderabad"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/50 to-[#141210]/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/60 to-transparent" />
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
            About JK Interiors
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 0.35, ease: "easeOut" }}
          className="font-light text-white leading-[1.02]"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(3rem, 7.5vw, 7rem)",
            maxWidth: "14ch",
          }}
        >
          Spaces with quiet{" "}
          <em style={{ color: "var(--gold-soft)" }}>confidence.</em>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-start sm:items-end gap-8 mt-10"
        >
          <p
            className="leading-relaxed max-w-md"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--font-label)",
              fontSize: "0.97rem",
            }}
          >
            A Hyderabad-based interior studio creating practical, elegant, and personal spaces
            through measured design, disciplined execution, and calm material intelligence.
          </p>
          <Link href="/contact" className="jk-primary-btn flex-shrink-0">
            Work with us
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

// ─── Stats Band ───────────────────────────────────────────────────────────────

function StatsSection() {
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
      <div
        className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0"
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

// ─── Studio Story ─────────────────────────────────────────────────────────────

function StudioStorySection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      className="overflow-hidden"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        variants={stagger}
        className="grid grid-cols-1 lg:grid-cols-2 min-h-[72vh]"
      >
        {/* Image */}
        <motion.div variants={fadeIn} className="relative min-h-[55vw] lg:min-h-0 order-2 lg:order-1">
          <Image
            src="/images/home.jpg"
            alt="Warm material palette — JK Interiors studio"
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover"
          />
          {/* Subtle dark edge on right */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141210]/30" />
        </motion.div>

        {/* Copy */}
        <motion.div
          variants={fadeUp}
          className="order-1 lg:order-2 flex flex-col justify-center gap-8 px-8 py-16 lg:px-14 xl:px-20"
          style={{ background: "#141210" }}
        >
          <div className="flex items-center gap-4">
            <div className="h-px w-12" style={{ background: "var(--gold)" }} />
            <span
              className="uppercase tracking-[0.22em] text-xs"
              style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
            >
              Studio story
            </span>
          </div>

          <h2
            className="font-light text-white leading-[1.1]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
              maxWidth: "20ch",
            }}
          >
            Designing{" "}
            <em style={{ color: "var(--gold-soft)" }}>experiences,</em>{" "}
            not just rooms.
          </h2>

          <div
            className="h-px w-14"
            style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }}
          />

          <div className="flex flex-col gap-5">
            <p
              className="leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.55)",
                fontFamily: "var(--font-label)",
                fontSize: "0.97rem",
              }}
            >
              We listen before we draw. Every plan begins with how the client lives — what needs to
              be stored, how light enters the room, and what the budget should protect. The result is
              functional, livable, and quietly detailed.
            </p>
            <p
              className="leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.38)",
                fontFamily: "var(--font-label)",
                fontSize: "0.97rem",
              }}
            >
              Our work is intentionally restrained: clean storage, durable finishes, precise
              lighting, and execution that feels organised from concept to handover.
            </p>
          </div>

          {/* Studio focus card */}
          <div
            className="flex flex-col gap-2 p-5 mt-2"
            style={{
              border: "1px solid rgba(216,189,125,0.2)",
              background: "rgba(216,189,125,0.04)",
            }}
          >
            <span
              className="uppercase tracking-[0.16em] text-xs"
              style={{ color: "var(--gold)", fontFamily: "var(--font-label)" }}
            >
              Studio focus
            </span>
            <p
              className="font-light leading-snug"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.1rem",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              Functional luxury for homes that need to work beautifully every day.
            </p>
            <span
              className="text-xs uppercase tracking-[0.12em] mt-1"
              style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-label)" }}
            >
              Residential · Turnkey · Renovation
            </span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Full-width Image Quote ───────────────────────────────────────────────────

function ImageQuoteSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ minHeight: "60vh" }}>
      <motion.div className="absolute inset-0" style={{ y: imageY }}>
        <Image
          src="/images/living-room.jpg"
          alt="Calm interior living space — JK Interiors"
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#141210]/65" />
      </motion.div>

      <div className="relative z-10 flex items-center justify-center min-h-[60vh] px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 1, ease: "easeOut" }}
          className="text-center flex flex-col items-center gap-6 max-w-3xl"
        >
          <div
            className="h-px w-16 mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
          />
          <blockquote
            className="font-light italic text-white leading-[1.2]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(1.6rem, 3.5vw, 2.8rem)",
            }}
          >
            "We don't design rooms. We design the experience of living in them."
          </blockquote>
          <div
            className="h-px w-16 mx-auto"
            style={{ background: "linear-gradient(90deg, transparent, var(--gold), transparent)" }}
          />
          <span
            className="uppercase tracking-[0.18em] text-xs"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-label)" }}
          >
            JK Interiors — Studio Ethos
          </span>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Sub-components for HowWeWork + Values (hooks cannot be called in .map) ──

function PrincipleRow({ p, i }: { p: (typeof PRINCIPLES)[number]; i: number }) {
  const rowRef = useRef(null);
  const rowInView = useInView(rowRef, { once: true, margin: "-5%" });
  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 28 }}
      animate={rowInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: i * 0.1, ease: "easeOut" }}
      className="group grid grid-cols-1 lg:grid-cols-[80px_1fr_2fr] gap-4 lg:gap-12 items-start py-8 border-b"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      <span
        className="font-light leading-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 2.5vw, 2.5rem)",
          color: "rgba(255,255,255,0.1)",
          transition: "color 0.3s",
        }}
      >
        {p.id}
      </span>
      <h3
        className="font-light text-white self-center"
        style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.2rem, 2vw, 1.6rem)" }}
      >
        {p.title}
      </h3>
      <p
        className="leading-relaxed self-center"
        style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)", fontSize: "0.95rem" }}
      >
        {p.body}
      </p>
    </motion.div>
  );
}

function ValueRow({ v, i }: { v: string; i: number }) {
  const rowRef = useRef(null);
  const rowInView = useInView(rowRef, { once: true, margin: "-4%" });
  return (
    <motion.div
      ref={rowRef}
      initial={{ opacity: 0, y: 28 }}
      animate={rowInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: i * 0.07, ease: "easeOut" }}
      className="group flex items-center gap-6 lg:gap-10 py-7 border-b"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      <span
        className="flex-shrink-0 w-12 text-right select-none leading-none"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
          color: "rgba(255,255,255,0.07)",
          fontWeight: 300,
          transition: "color 0.3s",
        }}
      >
        {String(i + 1).padStart(2, "0")}
      </span>
      <div className="flex-shrink-0 w-px h-8" style={{ background: "rgba(255,255,255,0.08)" }} />
      <span
        className="text-white font-light leading-tight flex-1"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.1rem, 2.2vw, 1.7rem)",
          opacity: 0.72,
          transition: "opacity 0.3s",
        }}
      >
        {v}
      </span>
      <span
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300"
        style={{ color: "var(--gold)", fontSize: "1rem", transform: "translateX(-8px)" }}
        aria-hidden
      >
        →
      </span>
    </motion.div>
  );
}

// ─── How We Work ─────────────────────────────────────────────────────────────

function HowWeWorkSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section className="py-24 lg:py-36" style={{ background: "#141210" }}>
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
              How we work
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-light text-white leading-[1.06]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
              maxWidth: "20ch",
            }}
          >
            A process built for{" "}
            <em style={{ color: "var(--gold-soft)" }}>clarity,</em> not confusion.
          </motion.h2>
        </motion.div>

        {/* Principles as horizontal rows */}
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {PRINCIPLES.map((p, i) => (
            <PrincipleRow key={p.id} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      className="py-24 lg:py-36"
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
              Client voices
            </span>
          </motion.div>
          <motion.h2
            variants={fadeUp}
            className="font-light text-white leading-[1.06]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.2rem, 4.5vw, 4rem)",
              maxWidth: "18ch",
            }}
          >
            Words from the people we've{" "}
            <em style={{ color: "var(--gold-soft)" }}>designed for.</em>
          </motion.h2>
        </motion.div>

        {/* Cards */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-8%" }}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-3 gap-5"
        >
          {TESTIMONIALS.map((t) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              className="flex flex-col gap-6 p-8"
              style={{
                border: "1px solid rgba(255,255,255,0.07)",
                background: "rgba(255,255,255,0.02)",
              }}
            >
              {/* Opening quote mark */}
              <span
                className="leading-none select-none"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "3.5rem",
                  color: "var(--gold)",
                  opacity: 0.4,
                  lineHeight: 1,
                }}
              >
                "
              </span>

              {/* Quote */}
              <blockquote
                className="font-light italic leading-relaxed flex-1"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                  color: "rgba(255,255,255,0.75)",
                }}
              >
                {t.quote}
              </blockquote>

              {/* Gold rule */}
              <div
                className="h-px w-10"
                style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }}
              />

              {/* Attribution */}
              <div className="flex items-center gap-4">
                {/* Initial avatar */}
                <div
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, rgba(216,189,125,0.2), rgba(216,189,125,0.06))",
                    border: "1px solid rgba(216,189,125,0.25)",
                  }}
                >
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "var(--gold)", fontFamily: "var(--font-label)", letterSpacing: "0.06em" }}
                  >
                    {t.initial}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span
                    className="text-sm font-medium"
                    style={{ color: "rgba(255,255,255,0.8)", fontFamily: "var(--font-label)" }}
                  >
                    {t.name}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-label)" }}
                  >
                    {t.role}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Values ───────────────────────────────────────────────────────────────────

function ValuesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      className="py-24 lg:py-36"
      style={{
        background: "#141210",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-20 mb-16"
        >
          <motion.div variants={fadeUp} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-px w-12" style={{ background: "var(--gold)" }} />
              <span
                className="uppercase tracking-[0.22em] text-xs"
                style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
              >
                Values
              </span>
            </div>
            <h2
              className="font-light text-white leading-[1.06]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
              }}
            >
              Quiet decisions that make a space{" "}
              <em style={{ color: "var(--gold-soft)" }}>last.</em>
            </h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="leading-relaxed self-end"
            style={{
              color: "rgba(255,255,255,0.38)",
              fontFamily: "var(--font-label)",
              fontSize: "0.97rem",
            }}
          >
            These guide every material choice, every storage decision, and every conversation
            we have with a client — regardless of the project's scale or budget.
          </motion.p>
        </motion.div>

        {/* Values list */}
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {VALUES.map((v, i) => (
            <ValueRow key={v} v={v} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.14 } },
  };

  return (
    <section
      className="relative overflow-hidden py-28 lg:py-40"
      style={{
        background: "linear-gradient(135deg, #1a1715 0%, #1c1a16 50%, #141210 100%)",
        borderTop: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div
        className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(216,189,125,0.07) 0%, transparent 70%)" }}
      />

      <motion.div
        ref={ref}
        initial="hidden"
        animate={inView ? "show" : "hidden"}
        variants={containerVariants}
        className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-8"
      >
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
          <div className="h-px w-12" style={{ background: "var(--gold)" }} />
          <span
            className="uppercase tracking-[0.22em] text-xs"
            style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
          >
            Let's build something
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
          Your space deserves this level of{" "}
          <em style={{ color: "var(--gold-soft)" }}>attention.</em>
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
          Whether you're starting from a blank floor plan or rethinking an existing home,
          we'll bring the same process, patience, and precision to your project.
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

export default function AboutPage() {
  return (
    <main className="jk-inner-page" style={{ background: "#141210" }}>
      <SiteHeader />
      <HeroSection />
      <StatsSection />
      <StudioStorySection />
      <ImageQuoteSection />
      <HowWeWorkSection />
      <TestimonialsSection />
      <ValuesSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
