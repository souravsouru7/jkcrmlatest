"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useInView,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import SiteHeader from "../components/SiteHeader";
import SiteFooter from "../components/SiteFooter";

// ─── Data ────────────────────────────────────────────────────────────────────

const FILTERS = ["All", "Residential", "Kitchen", "Commercial", "Furniture", "Styling"] as const;
type Filter = (typeof FILTERS)[number];

const PROJECTS = [
  {
    id: "01",
    title: "Quiet Villa Living",
    category: "Residential" as Filter,
    location: "Jubilee Hills",
    scope: "Living, dining & bedrooms",
    year: "2026",
    span: "tall",
    image: "/images/home.jpg",
  },
  {
    id: "02",
    title: "Warm Modular Kitchen",
    category: "Kitchen" as Filter,
    location: "Kondapur",
    scope: "Storage, surfaces & lighting",
    year: "2026",
    span: "wide",
    image: "/images/kitchen.jpg",
  },
  {
    id: "03",
    title: "Premium Living Room",
    category: "Residential" as Filter,
    location: "HITEC City",
    scope: "Living room design & styling",
    year: "2025",
    span: "square",
    image: "/images/living-room.jpg",
  },
  {
    id: "04",
    title: "Custom Wardrobe Wall",
    category: "Furniture" as Filter,
    location: "Gachibowli",
    scope: "Wardrobes, dresser & storage",
    year: "2025",
    span: "tall",
    image: "/images/wb-interior.jpg",
  },
  {
    id: "05",
    title: "Home Theatre Design",
    category: "Styling" as Filter,
    location: "Madhapur",
    scope: "Entertainment room & AV setup",
    year: "2025",
    span: "square",
    image: "/images/movie-theater.jpg",
  },
  {
    id: "06",
    title: "Apartment Refresh",
    category: "Residential" as Filter,
    location: "Nallagandla",
    scope: "Renovation and styling",
    year: "2024",
    span: "wide",
    image: "/images/about-us.jpg",
  },
  {
    id: "07",
    title: "Full Home Interiors",
    category: "Residential" as Filter,
    location: "Banjara Hills",
    scope: "Complete home turnkey execution",
    year: "2024",
    span: "tall",
    image: "/images/banner-image.jpg",
  },
  {
    id: "08",
    title: "Compact Kitchen Upgrade",
    category: "Kitchen" as Filter,
    location: "Manikonda",
    scope: "Workflow and storage",
    year: "2024",
    span: "square",
    image: "/images/kitchen.jpg",
  },
  {
    id: "09",
    title: "Calm Living Details",
    category: "Styling" as Filter,
    location: "Financial District",
    scope: "Furniture, lighting & decor",
    year: "2024",
    span: "wide",
    image: "/images/living-room.jpg",
  },
];

type Project = (typeof PROJECTS)[number];

// ─── Animation Variants ──────────────────────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.85, ease: "easeOut" } },
};

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96 },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    transition: { duration: 0.3, ease: "easeIn" },
  },
};

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const textY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);

  return (
    <section
      ref={containerRef}
      className="relative flex items-end overflow-hidden"
      style={{ minHeight: "88vh" }}
    >
      {/* Parallax image */}
      <motion.div className="absolute inset-0 z-0" style={{ y: imageY }}>
        <Image
          src="/images/banner-image.jpg"
          alt="JK Interiors portfolio"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141210] via-[#141210]/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141210]/50 to-transparent" />
      </motion.div>

      <motion.div
        className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-12 pb-20 lg:pb-28"
        style={{ y: textY, opacity }}
      >
        {/* Eyebrow */}
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
            Portfolio
          </span>
        </motion.div>

        {/* Headline */}
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
          Work that speaks before we{" "}
          <em style={{ color: "var(--gold-soft)" }}>do.</em>
        </motion.h1>

        {/* Sub row */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.65, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-start sm:items-end gap-8 mt-10"
        >
          <p
            className="leading-relaxed max-w-sm"
            style={{
              color: "rgba(255,255,255,0.5)",
              fontFamily: "var(--font-label)",
              fontSize: "0.97rem",
            }}
          >
            Nine curated projects across Hyderabad — residential, commercial, kitchen, furniture, and styling.
          </p>
          <Link href="/contact" className="jk-primary-btn flex-shrink-0">
            Start your project
          </Link>
        </motion.div>
      </motion.div>

      {/* Scroll line */}
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

// ─── Filter Bar ───────────────────────────────────────────────────────────────

function FilterBar({
  active,
  count,
  onChange,
}: {
  active: Filter;
  count: number;
  onChange: (f: Filter) => void;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-12 lg:mb-16">
      {/* Left: label + count */}
      <div className="flex flex-col gap-1">
        <span
          className="uppercase tracking-[0.2em] text-xs"
          style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
        >
          Project index
        </span>
        <span
          className="text-sm"
          style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-label)" }}
        >
          {count} project{count !== 1 ? "s" : ""} shown
        </span>
      </div>

      {/* Right: filter pills */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => {
          const isActive = active === f;
          return (
            <button
              key={f}
              onClick={() => onChange(f)}
              className="relative px-4 py-2 text-xs uppercase tracking-[0.14em] transition-colors duration-200"
              style={{
                fontFamily: "var(--font-label)",
                color: isActive ? "#141210" : "rgba(255,255,255,0.45)",
                border: "1px solid",
                borderColor: isActive ? "var(--gold)" : "rgba(255,255,255,0.12)",
                background: isActive ? "var(--gold)" : "transparent",
              }}
            >
              {f}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Project Card ─────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  onOpen,
}: {
  project: Project;
  index: number;
  onOpen: (p: Project) => void;
}) {
  const [hovered, setHovered] = useState(false);

  /* grid span classes */
  const spanClass =
    project.span === "tall"
      ? "row-span-2"
      : project.span === "wide"
        ? "col-span-2"
        : "";

  return (
    <motion.button
      layout
      variants={cardVariants}
      initial="hidden"
      animate="show"
      exit="exit"
      className={`group relative overflow-hidden cursor-pointer text-left w-full ${spanClass}`}
      style={{ minHeight: project.span === "tall" ? "560px" : "280px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(project)}
    >
      {/* Image */}
      <Image
        src={project.image}
        alt={project.title}
        fill
        sizes="(min-width:1280px) 28vw, (min-width:768px) 45vw, 100vw"
        className="object-cover transition-transform duration-[1.1s] ease-out will-change-transform"
        style={{ transform: hovered ? "scale(1.06)" : "scale(1)" }}
      />

      {/* Base gradient */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: "linear-gradient(to top, rgba(7,7,7,0.85) 0%, rgba(7,7,7,0.2) 50%, transparent 100%)",
          opacity: hovered ? 1 : 0.6,
        }}
      />

      {/* Index number — top left */}
      <span
        className="absolute top-4 left-5 select-none"
        style={{
          fontFamily: "var(--font-label)",
          fontSize: "0.62rem",
          letterSpacing: "0.18em",
          color: "rgba(255,255,255,0.4)",
        }}
      >
        {project.id}
      </span>

      {/* Category tag — top right */}
      <span
        className="absolute top-4 right-4 px-2.5 py-1 text-[0.58rem] uppercase tracking-[0.14em] transition-opacity duration-300"
        style={{
          fontFamily: "var(--font-label)",
          color: "var(--gold)",
          border: "1px solid rgba(216,189,125,0.3)",
          background: "rgba(7,7,7,0.5)",
          backdropFilter: "blur(8px)",
          opacity: hovered ? 1 : 0,
        }}
      >
        {project.category}
      </span>

      {/* Caption — always bottom, slides up on hover */}
      <div
        className="absolute bottom-0 left-0 right-0 p-5 flex flex-col gap-1.5 transition-transform duration-500 ease-out"
        style={{ transform: hovered ? "translateY(0)" : "translateY(8px)" }}
      >
        <span
          className="text-xs uppercase tracking-[0.12em]"
          style={{ color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-label)" }}
        >
          {project.location} · {project.year}
        </span>
        <h3
          className="text-white font-light leading-tight"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
          }}
        >
          {project.title}
        </h3>
        <span
          className="text-xs transition-all duration-300"
          style={{
            color: "rgba(255,255,255,0.45)",
            fontFamily: "var(--font-label)",
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(6px)",
          }}
        >
          {project.scope}
        </span>

        {/* View indicator */}
        <div
          className="flex items-center gap-2 mt-1 transition-all duration-300"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? "translateY(0)" : "translateY(8px)",
          }}
        >
          <div className="h-px w-6" style={{ background: "var(--gold)" }} />
          <span
            className="text-[0.62rem] uppercase tracking-[0.16em]"
            style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
          >
            View project
          </span>
        </div>
      </div>
    </motion.button>
  );
}

// ─── Lightbox Modal ───────────────────────────────────────────────────────────

function Lightbox({
  project,
  projects,
  onClose,
}: {
  project: Project;
  projects: Project[];
  onClose: () => void;
}) {
  const currentIdx = projects.findIndex((p) => p.id === project.id);
  const [displayed, setDisplayed] = useState(project);

  useEffect(() => {
    setDisplayed(project);
  }, [project]);

  /* keyboard nav */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") {
        const next = projects[(currentIdx + 1) % projects.length];
        setDisplayed(next);
      }
      if (e.key === "ArrowLeft") {
        const prev = projects[(currentIdx - 1 + projects.length) % projects.length];
        setDisplayed(prev);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentIdx, projects, onClose]);

  const go = (dir: 1 | -1) => {
    const next = projects[(currentIdx + dir + projects.length) % projects.length];
    setDisplayed(next);
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lg:p-10"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{ background: "rgba(7,7,7,0.92)", backdropFilter: "blur(16px)" }}
      onClick={onClose}
    >
      <motion.div
        className="relative w-full max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_340px] overflow-hidden overflow-y-auto"
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          background: "#0d0d0d",
          border: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "90vh",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image pane */}
        <div className="relative" style={{ minHeight: "clamp(240px, 50vw, 60vh)" }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={displayed.id}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Image
                src={displayed.image}
                alt={displayed.title}
                fill
                sizes="(min-width:1024px) 65vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>

          {/* Nav arrows */}
          <button
            className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur-sm text-white hover:border-[--gold] transition-colors duration-200"
            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
            onClick={() => go(-1)}
            aria-label="Previous project"
          >
            ←
          </button>
          <button
            className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center border border-white/20 bg-black/40 backdrop-blur-sm text-white hover:border-[--gold] transition-colors duration-200"
            style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
            onClick={() => go(1)}
            aria-label="Next project"
          >
            →
          </button>

          {/* Counter */}
          <div
            className="absolute bottom-4 left-4 px-3 py-1 text-xs"
            style={{
              fontFamily: "var(--font-label)",
              color: "rgba(255,255,255,0.5)",
              background: "rgba(7,7,7,0.6)",
              backdropFilter: "blur(8px)",
              letterSpacing: "0.1em",
            }}
          >
            {String(projects.findIndex((p) => p.id === displayed.id) + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </div>
        </div>

        {/* Details pane */}
        <AnimatePresence mode="wait">
          <motion.aside
            key={displayed.id + "-detail"}
            className="flex flex-col gap-6 p-8 lg:p-10 overflow-y-auto"
            style={{
              borderLeft: "1px solid rgba(255,255,255,0.06)",
              background: "#0a0a0a",
            }}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
          >
            {/* Meta */}
            <div className="flex items-center gap-3">
              <span
                className="text-[0.6rem] uppercase tracking-[0.2em]"
                style={{ color: "var(--gold)", fontFamily: "var(--font-label)" }}
              >
                {displayed.id}
              </span>
              <div className="h-px w-8 flex-shrink-0" style={{ background: "rgba(216,189,125,0.3)" }} />
              <span
                className="text-[0.6rem] uppercase tracking-[0.15em]"
                style={{ color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-label)" }}
              >
                {displayed.category}
              </span>
            </div>

            {/* Title */}
            <h2
              className="text-white font-light leading-[1.1]"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
              }}
            >
              {displayed.title}
            </h2>

            {/* Gold rule */}
            <div className="h-px w-12" style={{ background: "linear-gradient(90deg, var(--gold), transparent)" }} />

            {/* Details */}
            {[
              { label: "Location", value: displayed.location },
              { label: "Scope", value: displayed.scope },
              { label: "Year", value: displayed.year },
            ].map(({ label, value }) => (
              <div key={label} className="flex flex-col gap-1">
                <span
                  className="text-[0.6rem] uppercase tracking-[0.18em]"
                  style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-label)" }}
                >
                  {label}
                </span>
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.75)", fontFamily: "var(--font-label)" }}
                >
                  {value}
                </span>
              </div>
            ))}

            {/* CTA */}
            <div className="mt-auto pt-4 border-t" style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <Link href="/contact" className="jk-primary-btn w-full justify-center">
                Discuss a similar project
              </Link>
            </div>
          </motion.aside>
        </AnimatePresence>

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center border border-white/20 bg-black/60 backdrop-blur-sm text-white/60 hover:text-white hover:border-white/40 transition-all duration-200 z-10"
          aria-label="Close"
          style={{ fontSize: "1rem" }}
        >
          ✕
        </button>
      </motion.div>
    </motion.div>
  );
}

// ─── Gallery Section ──────────────────────────────────────────────────────────

function GallerySection() {
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState<Project | null>(null);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-5%" });

  const filtered = filter === "All" ? PROJECTS : PROJECTS.filter((p) => p.category === filter);

  /* lock scroll when modal open */
  useEffect(() => {
    document.body.style.overflow = active ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [active]);

  return (
    <section className="py-24 lg:py-32" style={{ background: "#141210" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section intro */}
        <motion.div
          ref={ref}
          initial="hidden"
          animate={inView ? "show" : "hidden"}
          variants={stagger}
          className="flex flex-col gap-5 mb-14 lg:mb-18"
        >
          <motion.div variants={fadeUp} className="flex items-center gap-4">
            <div className="h-px w-12" style={{ background: "var(--gold)" }} />
            <span
              className="uppercase tracking-[0.22em] text-xs"
              style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
            >
              Selected work
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
            Nine projects. One{" "}
            <em style={{ color: "var(--gold-soft)" }}>consistent</em> standard.
          </motion.h2>
        </motion.div>

        {/* Filter + count */}
        <FilterBar active={filter} count={filtered.length} onChange={setFilter} />

        {/* Bento grid */}
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 lg:gap-4"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((project, i) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={i}
                onOpen={setActive}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex items-center justify-center gap-4 mt-16 pt-12 border-t"
          style={{ borderColor: "rgba(255,255,255,0.06)" }}
        >
          <div className="h-px w-10" style={{ background: "var(--gold)" }} />
          <span
            className="text-xs uppercase tracking-[0.2em] text-center"
            style={{ color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-label)" }}
          >
            All photography reflects actual completed projects
          </span>
          <div className="h-px w-10" style={{ background: "var(--gold)" }} />
        </motion.div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {active && (
          <Lightbox project={active} projects={filtered} onClose={() => setActive(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

// ─── CTA Section ─────────────────────────────────────────────────────────────

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
            Your space, next
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
          <Link href="/services" className="jk-secondary-btn">
            Explore our services
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GalleryPage() {
  return (
    <main className="jk-inner-page" style={{ background: "#141210" }}>
      <SiteHeader />
      <HeroSection />
      <GallerySection />
      <CtaSection />
      <SiteFooter />
    </main>
  );
}
