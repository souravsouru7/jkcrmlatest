"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView, type Variants } from "framer-motion";
import SiteFooter from "./SiteFooter";

// ─── Data ────────────────────────────────────────────────────────────────────

const SERVICES = [
  {
    id: "01",
    title: "Residential Interiors",
    summary: "Functional, refined living spaces designed around movement, storage, and everyday comfort.",
    image: "/For residential interiors.PNG",
    span: "tall",
  },
  {
    id: "02",
    title: "Modular Kitchens",
    summary: "Efficient kitchen systems planned for workflow, durability, and seamless daily use.",
    image: "/images/kitchen.jpg",
    span: "wide",
  },
  {
    id: "03",
    title: "Wardrobes & Storage",
    summary: "Smart storage layouts designed to maximize usability without overwhelming the space.",
    image: "/images/wb-interior.jpg",
    span: "square",
  },
  {
    id: "04",
    title: "False Ceilings & Lighting",
    summary: "Ceiling and lighting systems designed to improve mood, depth, and spatial balance.",
    image: "/images/living-room.jpg",
    span: "square",
  },
  {
    id: "05",
    title: "Turnkey Interiors",
    summary: "One accountable team managing design, materials, execution, timelines, and final handover.",
    image: "/images/banner-image.jpg",
    span: "wide",
  },
  {
    id: "06",
    title: "Renovation & Remodeling",
    summary: "Thoughtful upgrades that modernize spaces while maintaining budget control and structural clarity.",
    image: "/For renovation and remodeling section photo.PNG",
    span: "tall",
  },
];

const GALLERY_PREVIEW = [
  {
    title: "Quiet Villa Living",
    subtitle: "4BHK Villa · 60-Day Turnkey Execution",
    desc: "Designed around open movement, layered lighting, and concealed storage to maintain visual calm across the home.",
    image: "/images/home.jpg",
  },
  {
    title: "Modular Kitchen Design",
    subtitle: "Residential Kitchen · Kondapur",
    desc: "A workspace balancing storage, workflow, and premium material detailing without visual clutter.",
    image: "/images/kitchen.jpg",
  },
  {
    title: "Layered Bedroom Styling",
    subtitle: "Residential · Madhapur",
    desc: "Soft textures, integrated lighting, and practical storage systems designed for everyday ease.",
    image: "/images/wb-interior.jpg",
  },
];

const TESTIMONIALS = [
  {
    quote: "JK Interiors understood how our family actually uses the home. The result feels polished, practical, and very personal.",
    name: "Ananya R.",
    role: "Residential · Jubilee Hills",
    initial: "AR",
  },
  {
    quote: "Their material suggestions and site updates made the whole renovation feel controlled. We never felt left guessing.",
    name: "Rahul M.",
    role: "Renovation · Kondapur",
    initial: "RM",
  },
  {
    quote: "The wardrobes, kitchen, and lighting were planned with a lot of care. The home finally feels calm and complete.",
    name: "Sravya K.",
    role: "Turnkey · Gachibowli",
    initial: "SK",
  },
  {
    quote: "The coordination and execution were handled with a lot of discipline. Every stage felt clear, organized, and professionally managed.",
    name: "Verified Client",
    role: "Turnkey · Hyderabad",
    initial: "VC",
  },
];

const PROCESS = [
  { id: "01", label: "Consultation", desc: "Understanding lifestyle, space needs, and budget priorities." },
  { id: "02", label: "Design", desc: "Layouts, storage planning, materials, and visual direction tailored to your lifestyle." },
  { id: "03", label: "Materials", desc: "Curated finishes, textures, hardware, and quality-led material selection." },
  { id: "04", label: "Execution", desc: "Disciplined site management with timeline-focused execution and supervision." },
  { id: "05", label: "Handover", desc: "Final walkthrough, detailing, quality checks, and post-completion support." },
];

// ─── Variants ────────────────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

// ─── Section header helper ────────────────────────────────────────────────────

function SectionHeader({ kicker, heading, sub }: { kicker: string; heading: React.ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col gap-4 mb-10 lg:mb-14">
      <div className="flex items-center gap-4">
        <div className="h-px w-12" style={{ background: "var(--gold)" }} />
        <span className="uppercase tracking-[0.22em] text-xs" style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}>
          {kicker}
        </span>
      </div>
      <h2 className="font-light text-white leading-[1.06]" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4.5vw, 4rem)", maxWidth: "22ch" }}>
        {heading}
      </h2>
      {sub && (
        <p className="max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.42)", fontFamily: "var(--font-label)", fontSize: "0.97rem" }}>
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Services Section ─────────────────────────────────────────────────────────

function ServicesSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6%" });

  return (
    <section className="py-14 sm:py-20 lg:py-32" style={{ background: "#141210", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp}>
            <SectionHeader
              kicker="What we offer"
              heading={<>Six disciplines. One <em style={{ color: "var(--gold-soft)" }}>unified</em> vision.</>}
              sub="From layout planning to final styling — every service built around how you actually live."
            />
          </motion.div>

          {/* Bento grid */}
          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {SERVICES.map((s) => (
              <motion.div
                key={s.id}
                variants={fadeUp}
                className={`group relative overflow-hidden ${s.span === "tall" ? "xl:row-span-2" : s.span === "wide" ? "xl:col-span-2" : ""}`}
                style={{ minHeight: "clamp(220px, 40vw, 420px)" }}
              >
                <Image src={s.image} alt={s.title} fill sizes="(min-width:1280px) 28vw, (min-width:768px) 45vw, 100vw" className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]" />
                <div className="absolute inset-0 transition-opacity duration-500" style={{ background: "linear-gradient(to top, rgba(7,7,7,0.9) 0%, rgba(7,7,7,0.3) 55%, transparent 100%)", opacity: 0.85 }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400" style={{ background: "rgba(7,7,7,0.15)" }} />

                {/* Number */}
                <span className="absolute top-4 left-5" style={{ fontFamily: "var(--font-label)", fontSize: "0.6rem", letterSpacing: "0.18em", color: "rgba(255,255,255,0.35)" }}>
                  {s.id}
                </span>

                {/* Caption */}
                <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
                  <h3 className="text-white font-light" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1.05rem, 2vw, 1.5rem)" }}>
                    {s.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-label)" }}>
                    {s.summary}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Process strip */}
          <motion.div variants={fadeUp} className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 border-t pt-10" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
            {PROCESS.map((step) => (
              <div key={step.id} className="flex flex-col gap-2">
                <span style={{ fontFamily: "var(--font-label)", fontSize: "0.58rem", letterSpacing: "0.16em", color: "var(--gold)" }}>{step.id}</span>
                <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-label)" }}>{step.label}</span>
                <span className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-label)" }}>{step.desc}</span>
              </div>
            ))}
          </motion.div>

          {/* Link */}
          <motion.div variants={fadeUp} className="mt-10">
            <Link href="/services" className="jk-secondary-btn" style={{ minWidth: "auto", padding: "0 28px" }}>
              All services →
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Gallery Preview ──────────────────────────────────────────────────────────

function GalleryPreviewSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-6%" });

  return (
    <section className="py-14 sm:py-20 lg:py-32" style={{ background: "#141210", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-14 gap-6 flex-wrap">
            <SectionHeader
              kicker="Selected work"
              heading={<>Work that speaks <em style={{ color: "var(--gold-soft)" }}>before</em> we do.</>}
            />
            <Link href="/gallery" className="jk-secondary-btn flex-shrink-0 self-start mt-2" style={{ minWidth: "auto", padding: "0 24px" }}>
              Full gallery →
            </Link>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {GALLERY_PREVIEW.map((item) => (
              <motion.div key={item.title} variants={fadeUp} className="group relative overflow-hidden" style={{ minHeight: "300px" }}>
                <Image src={item.image} alt={item.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition-transform duration-[1.1s] ease-out group-hover:scale-[1.05]" />
                <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(7,7,7,0.85) 0%, transparent 55%)" }} />
                <div className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-2">
                  <span className="text-xs uppercase tracking-[0.12em]" style={{ color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-label)" }}>{item.subtitle}</span>
                  <h3 className="text-white font-light" style={{ fontFamily: "var(--font-display)", fontSize: "1.3rem" }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)" }}>{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Testimonials ─────────────────────────────────────────────────────────────

function TestimonialsSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section className="py-14 sm:py-20 lg:py-32" style={{ background: "linear-gradient(180deg,#1a1715 0%,#141210 100%)", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger}>
          <motion.div variants={fadeUp} className="flex items-end justify-between mb-14 flex-wrap gap-6">
            <SectionHeader
              kicker="Client voices"
              heading={<>Spaces people <em style={{ color: "var(--gold-soft)" }}>settle into.</em></>}
            />
            <div className="flex flex-col items-end gap-1 self-start">
              <span className="font-light leading-none" style={{ fontFamily: "var(--font-display)", fontSize: "2.8rem", color: "var(--gold-soft)" }}>5.0</span>
              <span className="text-xs uppercase tracking-[0.14em]" style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-label)" }}>Average rating</span>
            </div>
          </motion.div>

          <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} variants={fadeUp} className="flex flex-col gap-5 p-5 sm:p-7" style={{ border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)" }}>
                <span className="leading-none select-none" style={{ fontFamily: "var(--font-display)", fontSize: "3.5rem", color: "var(--gold)", opacity: 0.35, lineHeight: 1 }}>"</span>
                <blockquote className="font-light italic leading-relaxed flex-1" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(1rem, 1.4vw, 1.12rem)", color: "rgba(255,255,255,0.72)" }}>
                  {t.quote}
                </blockquote>
                <div className="h-px w-10" style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }} />
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center" style={{ background: "rgba(216,189,125,0.06)", border: "1px solid rgba(216,189,125,0.22)" }}>
                    <span className="text-xs font-semibold" style={{ color: "var(--gold)", fontFamily: "var(--font-label)", letterSpacing: "0.06em" }}>{t.initial}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.78)", fontFamily: "var(--font-label)" }}>{t.name}</span>
                    <span className="text-xs" style={{ color: "rgba(255,255,255,0.32)", fontFamily: "var(--font-label)" }}>{t.role}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Why Projects Go Wrong ───────────────────────────────────────────────────

const PROBLEMS = [
  {
    n: "01",
    label: "Fragmented vendor management",
    context: "No single point of contact means coordination breaks down mid-project — and no one is accountable when it does.",
  },
  {
    n: "02",
    label: "Timeline slippage",
    context: "Without structured supervision, delays compound silently. Most clients only realise at handover.",
  },
  {
    n: "03",
    label: "Budget opacity",
    context: "Costs surface late in the process, leaving clients without the time or leverage to respond effectively.",
  },
  {
    n: "04",
    label: "Unsupervised site execution",
    context: "Work without dedicated on-site oversight produces inconsistent quality that is expensive to correct after completion.",
  },
  {
    n: "05",
    label: "No post-handover accountability",
    context: "Once the project closes, most contractors become unreachable. Issues that surface later are left unaddressed.",
  },
];

const SOLUTIONS = [
  {
    n: "01",
    label: "Single-team execution",
    context: "Design, materials, and site managed under one roof by one team — from first brief to final handover.",
  },
  {
    n: "02",
    label: "One-point accountability",
    context: "One dedicated lead manages the entire project. Full responsibility. No handoffs. No communication gaps.",
  },
  {
    n: "03",
    label: "Structured 45–60 day timelines",
    context: "Every project runs on defined milestones with regular client updates and disciplined on-site supervision.",
  },
  {
    n: "04",
    label: "Dedicated backend teams",
    context: "Trained execution teams present on-site throughout — not just at the start. Quality is supervised, not assumed.",
  },
  {
    n: "05",
    label: "Transparent cost planning",
    context: "Full costs are fixed and communicated upfront. No hidden revisions, no surprises after work begins.",
  },
  {
    n: "06",
    label: "Long-term client support",
    context: "One year of free maintenance and a 10-year material warranty. The relationship does not end at handover.",
  },
];

function WhyProjectsGoWrongSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24 lg:py-40"
      style={{
        background: "linear-gradient(180deg, #1a1715 0%, #141210 60%, #1a1715 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 70% 50% at 50% 0%, rgba(216,189,125,0.05) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
        <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger}>

          {/* Header — centred */}
          <motion.div variants={fadeUp} className="max-w-2xl mx-auto text-center mb-12 sm:mb-16 lg:mb-24 flex flex-col items-center gap-5">
            <div className="flex items-center gap-4">
              <div className="h-px w-10" style={{ background: "var(--gold)" }} />
              <span className="uppercase tracking-[0.22em] text-xs" style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}>
                Industry reality
              </span>
              <div className="h-px w-10" style={{ background: "var(--gold)" }} />
            </div>
            <h2
              className="font-light text-white leading-[1.06]"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem, 4.5vw, 4rem)" }}
            >
              Why most interior projects{" "}
              <em style={{ color: "var(--gold-soft)" }}>go wrong.</em>
            </h2>
            <p
              className="leading-relaxed"
              style={{ color: "rgba(255,255,255,0.38)", fontFamily: "var(--font-label)", fontSize: "0.95rem", maxWidth: "44ch" }}
            >
              Premium design alone does not guarantee a good outcome. Execution discipline does.
              Understanding where projects fail is the first step to ensuring yours does not.
            </p>
          </motion.div>

          {/* Two-column grid */}
          <motion.div variants={stagger} className="grid grid-cols-1 lg:grid-cols-2" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>

            {/* Left — Problems */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col"
              style={{ background: "rgba(255,255,255,0.015)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
            >
              {/* Column header */}
              <div
                className="flex items-center gap-4 px-5 sm:px-8 lg:px-10 py-5 sm:py-7"
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "rgba(200,120,100,0.55)" }} />
                <span
                  className="uppercase tracking-[0.22em] text-xs"
                  style={{ color: "rgba(220,140,120,0.65)", fontFamily: "var(--font-label)" }}
                >
                  Where most projects break down
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col">
                {PROBLEMS.map((p, i) => (
                  <div key={p.n} className="flex gap-4 sm:gap-6 px-5 sm:px-8 lg:px-10 py-5 sm:py-7" style={i > 0 ? { borderTop: "1px solid rgba(255,255,255,0.05)" } : undefined}>
                    <span
                      className="flex-shrink-0 mt-0.5"
                      style={{
                        fontFamily: "var(--font-label)",
                        fontSize: "0.58rem",
                        letterSpacing: "0.14em",
                        color: "rgba(200,120,100,0.4)",
                      }}
                    >
                      {p.n}
                    </span>
                    <div className="flex flex-col gap-2">
                      <span
                        className="font-light"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                          color: "rgba(255,255,255,0.62)",
                        }}
                      >
                        {p.label}
                      </span>
                      <span
                        className="leading-relaxed"
                        style={{
                          fontFamily: "var(--font-label)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.28)",
                        }}
                      >
                        {p.context}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Right — Solutions */}
            <motion.div
              variants={fadeUp}
              className="flex flex-col"
              style={{ background: "rgba(216,189,125,0.02)" }}
            >
              {/* Column header */}
              <div
                className="flex items-center gap-4 px-5 sm:px-8 lg:px-10 py-5 sm:py-7"
                style={{ borderBottom: "1px solid rgba(216,189,125,0.1)" }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--gold)" }} />
                <span
                  className="uppercase tracking-[0.22em] text-xs"
                  style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
                >
                  The JK Interiors approach
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col">
                {SOLUTIONS.map((s, i) => (
                  <div key={s.n} className="flex gap-4 sm:gap-6 px-5 sm:px-8 lg:px-10 py-5 sm:py-7" style={i > 0 ? { borderTop: "1px solid rgba(216,189,125,0.07)" } : undefined}>
                    <span
                      className="flex-shrink-0 mt-0.5"
                      style={{
                        fontFamily: "var(--font-label)",
                        fontSize: "0.58rem",
                        letterSpacing: "0.14em",
                        color: "rgba(216,189,125,0.45)",
                      }}
                    >
                      {s.n}
                    </span>
                    <div className="flex flex-col gap-2">
                      <span
                        className="font-light"
                        style={{
                          fontFamily: "var(--font-display)",
                          fontSize: "clamp(1rem, 1.4vw, 1.15rem)",
                          color: "rgba(255,255,255,0.85)",
                        }}
                      >
                        {s.label}
                      </span>
                      <span
                        className="leading-relaxed"
                        style={{
                          fontFamily: "var(--font-label)",
                          fontSize: "0.8rem",
                          color: "rgba(255,255,255,0.38)",
                        }}
                      >
                        {s.context}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

          </motion.div>

          {/* Bottom note */}
          <motion.div variants={fadeUp} className="mt-10 sm:mt-14 flex items-center gap-6 sm:gap-10">
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
            <p
              className="flex-shrink-0 text-xs uppercase tracking-[0.16em] text-center"
              style={{ color: "rgba(255,255,255,0.22)", fontFamily: "var(--font-label)", maxWidth: "38ch" }}
            >
              Every JK Interiors project is structured to eliminate each of these failure points
            </p>
            <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.05)" }} />
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}

// ─── Studio Teaser ────────────────────────────────────────────────────────────

function StudioTeaserSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-8%" });

  return (
    <section className="overflow-hidden" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
      <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={stagger} className="grid grid-cols-1 lg:grid-cols-2 min-h-[65vh]">
        {/* Image */}
        <motion.div variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.85 } } }} className="relative min-h-[50vw] lg:min-h-0 order-2 lg:order-1">
          <Image src="/images/about-us.jpg" alt="JK Interiors studio" fill sizes="(min-width:1024px) 50vw, 100vw" className="object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to right, transparent, rgba(7,7,7,0.25))" }} />
          {/* Floating badge */}
          <div className="absolute bottom-6 left-6 flex flex-col gap-1 px-5 py-4" style={{ background: "rgba(7,7,7,0.78)", backdropFilter: "blur(10px)", border: "1px solid rgba(216,189,125,0.18)" }}>
            <span className="text-xs uppercase tracking-[0.16em]" style={{ color: "var(--gold)", fontFamily: "var(--font-label)" }}>Studio ethos</span>
            <span className="font-light text-white" style={{ fontFamily: "var(--font-display)", fontSize: "1rem" }}>Material calm. Storage first. Detail always.</span>
          </div>
        </motion.div>

        {/* Copy */}
        <motion.div variants={fadeUp} className="order-1 lg:order-2 flex flex-col justify-center gap-6 sm:gap-8 px-5 sm:px-8 py-12 sm:py-16 lg:px-14 xl:px-20" style={{ background: "#141210" }}>
          <SectionHeader
            kicker="About JK Interiors"
            heading={<>Thoughtful interiors backed by <em style={{ color: "var(--gold-soft)" }}>disciplined execution.</em></>}
          />
          <div className="flex flex-col gap-4 -mt-6">
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-label)", fontSize: "0.97rem" }}>
              JK Interiors is a Hyderabad-based turnkey interior studio creating premium residential, commercial,
              and hospitality spaces through thoughtful planning and precise execution.
            </p>
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-label)", fontSize: "0.97rem" }}>
              We design around how people move, cook, gather, rest, and live every day — balancing aesthetics
              with functionality, storage, material quality, and long-term usability.
            </p>
            <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-label)", fontSize: "0.97rem" }}>
              From concept to handover, every project is managed through a structured process focused on
              clarity, coordination, and lasting quality.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <Link href="/about" className="jk-primary-btn" style={{ minWidth: "auto", padding: "0 28px" }}>About the studio</Link>
            <Link href="/philosophy" className="jk-secondary-btn" style={{ minWidth: "auto", padding: "0 28px" }}>Our philosophy</Link>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────

function CtaSection() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  const containerVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.13 } },
  };

  return (
    <section
      className="relative overflow-hidden py-16 sm:py-24 lg:py-36"
      style={{ background: "linear-gradient(135deg,#1a1715 0%,#1c1a16 50%,#141210 100%)", borderTop: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(216,189,125,0.07) 0%,transparent 70%)" }} />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full pointer-events-none" style={{ background: "radial-gradient(circle,rgba(216,189,125,0.04) 0%,transparent 70%)" }} />

      <motion.div ref={ref} initial="hidden" animate={inView ? "show" : "hidden"} variants={containerVariants} className="relative z-10 max-w-4xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center gap-8">
        <motion.div variants={fadeUp} className="flex items-center justify-center gap-4">
          <div className="h-px w-12" style={{ background: "var(--gold)" }} />
          <span className="uppercase tracking-[0.22em] text-xs" style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}>Start your project</span>
          <div className="h-px w-12" style={{ background: "var(--gold)" }} />
        </motion.div>

        <motion.h2 variants={fadeUp} className="font-light text-white leading-[1.06]" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5.5vw,5rem)" }}>
          Every great space begins with{" "}
          <em style={{ color: "var(--gold-soft)" }}>one conversation.</em>
        </motion.h2>

        <motion.p variants={fadeUp} className="max-w-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.46)", fontFamily: "var(--font-label)", fontSize: "1rem" }}>
          Tell us about your space. We'll listen first, design second — and deliver something
          that feels entirely yours.
        </motion.p>

        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 pt-2">
          <a
            href={`https://wa.me/919063096060?text=${encodeURIComponent("Hi, I'd like to schedule a consultation with JK Interiors.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="jk-primary-btn"
          >Schedule a consultation</a>
          <Link href="/gallery" className="jk-secondary-btn">View our work</Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Page export ─────────────────────────────────────────────────────────────

export default function LandingSections() {
  return (
    <>
      <ServicesSection />
      <GalleryPreviewSection />
      <TestimonialsSection />
      <WhyProjectsGoWrongSection />
      <StudioTeaserSection />
      <CtaSection />
      <SiteFooter />
    </>
  );
}
