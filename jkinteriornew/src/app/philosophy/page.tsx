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

const PRINCIPLES = [
  {
    id: "01",
    title: "Client-Centered",
    body: "We begin by understanding how you actually live — how you move, store, gather, rest, and use each room every single day.",
  },
  {
    id: "02",
    title: "Function First",
    body: "Layouts, circulation, storage, and lighting are resolved completely before a single aesthetic decision is made.",
  },
  {
    id: "03",
    title: "Timeless Over Trend",
    body: "Proportion, restraint, and material calm outlast any season. We design for the decade, not the mood board.",
  },
  {
    id: "04",
    title: "Responsible Choices",
    body: "Durable, efficient materials reduce long-term maintenance and protect both your comfort and your investment.",
  },
  {
    id: "05",
    title: "Detail Discipline",
    body: "Every handle, junction, line, and light source is a deliberate decision. Nothing is incidental.",
  },
  {
    id: "06",
    title: "Creative Collaboration",
    body: "We guide the project with expertise while remaining fully attentive to your preferences, constraints, and priorities.",
  },
];

const VALUES = [
  "Light before decoration",
  "Storage without visual noise",
  "Material palettes with restraint",
  "Furniture scaled to the room",
  "Execution guided by drawings",
  "Comfort that survives daily use",
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
          src="/images/living-room.jpg"
          alt="Refined interior with material restraint"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/50 to-[#141210]/20" />
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
            Design philosophy
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
          Purpose before{" "}
          <em style={{ color: "var(--gold-soft)" }}>polish.</em>
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
            We design interiors that work clearly through function, light, material, proportion,
            and disciplined execution — in that order.
          </p>
          <Link href="/contact" className="jk-primary-btn flex-shrink-0">
            Start a conversation
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

// ─── Thesis / Manifesto ───────────────────────────────────────────────────────

function ThesisSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <section
      className="py-24 lg:py-36 overflow-hidden"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-12 lg:gap-20 items-start"
        >
          {/* Left: kicker */}
          <motion.div variants={fadeUp} className="flex flex-col gap-4 lg:pt-2">
            <div className="flex items-center gap-4">
              <div className="h-px w-12" style={{ background: "var(--gold)" }} />
              <span
                className="uppercase tracking-[0.22em] text-xs"
                style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
              >
                Our thesis
              </span>
            </div>
            <p
              className="text-sm leading-relaxed"
              style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-label)" }}
            >
              Function · Light · Material · Proportion
            </p>
          </motion.div>

          {/* Right: large statement */}
          <div className="flex flex-col gap-8">
            <motion.blockquote
              variants={fadeUp}
              className="font-light text-white leading-[1.12]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.9rem, 3.5vw, 3.2rem)",
              }}
            >
              "Beauty lasts longer when the room works first."
            </motion.blockquote>

            <motion.div
              variants={fadeUp}
              className="h-px origin-left"
              style={{ background: "linear-gradient(90deg, var(--gold), transparent)", maxWidth: "120px" }}
            />

            <motion.p
              variants={fadeUp}
              className="leading-relaxed max-w-xl"
              style={{
                color: "rgba(255,255,255,0.52)",
                fontFamily: "var(--font-label)",
                fontSize: "1rem",
              }}
            >
              Every decision we make — from spatial layout to material selection to lighting
              placement — is grounded in how a space performs before it's concerned with how
              it looks. When function is resolved, aesthetics follow naturally and endure.
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Editorial / POV ─────────────────────────────────────────────────────────

function EditorialSection() {
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
        className="grid grid-cols-1 lg:grid-cols-2 min-h-[70vh]"
      >
        {/* Image */}
        <motion.div variants={fadeIn} className="relative min-h-[50vw] lg:min-h-0 order-2 lg:order-1">
          <Image
            src="/images/home.jpg"
            alt="Calm premium living room with layered lighting"
            fill
            sizes="(min-width:1024px) 50vw, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#141210]/30" />
        </motion.div>

        {/* Text */}
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
              Point of view
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
            Good interiors feel effortless because the hard decisions are resolved{" "}
            <em style={{ color: "var(--gold-soft)" }}>early.</em>
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
              Our work starts with the invisible structure of a space — movement, storage, light,
              maintenance, and daily comfort. Once those are settled, styling becomes quieter,
              more precise, and more personal.
            </p>
            <p
              className="leading-relaxed"
              style={{
                color: "rgba(255,255,255,0.4)",
                fontFamily: "var(--font-label)",
                fontSize: "0.97rem",
              }}
            >
              We believe the most beautiful rooms are the ones you stop noticing — because
              everything in them simply works.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Principles ───────────────────────────────────────────────────────────────

function PrincipleCard({ p }: { p: (typeof PRINCIPLES)[number] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <motion.article
      ref={ref}
      initial="hidden"
      animate={inView ? "show" : "hidden"}
      variants={stagger}
      className="group flex flex-col gap-5 py-10 border-b"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Number */}
      <motion.span
        variants={fadeUp}
        className="block"
        style={{
          fontFamily: "var(--font-label)",
          fontSize: "0.62rem",
          letterSpacing: "0.2em",
          color: "var(--gold)",
        }}
      >
        {p.id}
      </motion.span>

      {/* Title */}
      <motion.h3
        variants={fadeUp}
        className="font-light text-white leading-tight"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 2.5vw, 2rem)",
        }}
      >
        {p.title}
      </motion.h3>

      {/* Gold line — grows on hover */}
      <div className="relative h-px" style={{ background: "rgba(255,255,255,0.07)" }}>
        <div
          className="absolute inset-y-0 left-0 transition-all duration-500 group-hover:w-full"
          style={{ background: "var(--gold)", width: "24px" }}
        />
      </div>

      {/* Body */}
      <motion.p
        variants={fadeUp}
        className="leading-relaxed"
        style={{
          color: "rgba(255,255,255,0.5)",
          fontFamily: "var(--font-label)",
          fontSize: "0.95rem",
        }}
      >
        {p.body}
      </motion.p>
    </motion.article>
  );
}

function PrinciplesSection() {
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
              Design principles
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
            The standards behind{" "}
            <em style={{ color: "var(--gold-soft)" }}>every room.</em>
          </motion.h2>
        </motion.div>

        {/* 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-16">
          {PRINCIPLES.map((p) => (
            <PrincipleCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Values ───────────────────────────────────────────────────────────────────

function ValueRow({ value, index }: { value: string; index: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-4%" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
      transition={{ duration: 0.75, delay: index * 0.08, ease: "easeOut" }}
      className="group flex items-center gap-6 lg:gap-10 py-7 border-b"
      style={{ borderColor: "rgba(255,255,255,0.07)" }}
    >
      {/* Ghost number */}
      <span
        className="flex-shrink-0 w-12 text-right select-none leading-none transition-colors duration-300 group-hover:text-[--gold]"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(2rem, 3.5vw, 2.8rem)",
          color: "rgba(255,255,255,0.08)",
          fontWeight: 300,
        }}
      >
        {String(index + 1).padStart(2, "0")}
      </span>

      {/* Divider */}
      <div
        className="flex-shrink-0 w-px h-8 transition-colors duration-300"
        style={{ background: "rgba(255,255,255,0.1)" }}
      />

      {/* Value text */}
      <span
        className="text-white font-light leading-tight flex-1 transition-colors duration-300 group-hover:opacity-100"
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.1rem, 2.2vw, 1.7rem)",
          opacity: 0.75,
        }}
      >
        {value}
      </span>

      {/* Arrow — appears on hover */}
      <span
        className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-[-8px] group-hover:translate-x-0"
        style={{ color: "var(--gold)", fontSize: "1rem" }}
        aria-hidden
      >
        →
      </span>
    </motion.div>
  );
}

function ValuesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section
      className="py-24 lg:py-36"
      style={{
        background: "linear-gradient(180deg, #141210 0%, #1a1715 100%)",
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
          className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-10 lg:gap-20 mb-16"
        >
          <motion.div variants={fadeUp} className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              <div className="h-px w-12" style={{ background: "var(--gold)" }} />
              <span
                className="uppercase tracking-[0.22em] text-xs"
                style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
              >
                Values in practice
              </span>
            </div>
            <h2
              className="font-light text-white leading-[1.06]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(2rem, 3.5vw, 3rem)",
              }}
            >
              Every detail has a{" "}
              <em style={{ color: "var(--gold-soft)" }}>job.</em>
            </h2>
          </motion.div>

          <motion.p
            variants={fadeUp}
            className="leading-relaxed self-end"
            style={{
              color: "rgba(255,255,255,0.42)",
              fontFamily: "var(--font-label)",
              fontSize: "0.97rem",
            }}
          >
            These aren't aspirational values — they're operational ones. They describe exactly
            how we make decisions inside every project, regardless of scope or budget.
          </motion.p>
        </motion.div>

        {/* Values list */}
        <div className="border-t" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          {VALUES.map((v, i) => (
            <ValueRow key={v} value={v} index={i} />
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
            Work with us
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
          If this is how you think about space,{" "}
          <em style={{ color: "var(--gold-soft)" }}>let's talk.</em>
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
          Our philosophy only becomes meaningful through a specific project, a specific space, and a
          specific life. Tell us about yours.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-2">
          <Link href="/contact" className="jk-primary-btn">
            Schedule a consultation
          </Link>
          <Link href="/services" className="jk-secondary-btn">
            Explore our services
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PhilosophyPage() {
  return (
    <main className="jk-inner-page" style={{ background: "#141210" }}>
      <SiteHeader />
      <HeroSection />
      <ThesisSection />
      <EditorialSection />
      <PrinciplesSection />
      <ValuesSection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
