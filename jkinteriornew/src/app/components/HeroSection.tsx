"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const NAV_LINKS = [
  { label: "Gallery", href: "/gallery" },
  { label: "Services", href: "/services" },
  { label: "Philosophy", href: "/philosophy" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const METRICS = [
  { value: "50+", label: "Projects Delivered" },
  { value: "4.5+", label: "Years of Experience" },
  { value: "45–60", label: "Day Timelines" },
  { value: "1 yr", label: "Free Maintenance" },
  { value: "10 yr", label: "Material Warranty" },
];

const TYPED_LINES = [
  "Luxury villas",
  "Premium residences",
  "Hospitality interiors",
  "Turnkey execution",
];

const HERO_VIDEO_SRC = "/1000113951.mp4";

export default function HeroSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [typedText, setTypedText] = useState("");
  const [lineIndex, setLineIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const currentLine = TYPED_LINES[lineIndex];

  /* ── Typewriter ── */
  useEffect(() => {
    const complete = typedText === currentLine;
    const empty = typedText.length === 0;
    const delay = complete && !isDeleting ? 1400 : isDeleting ? 32 : 60;

    const t = window.setTimeout(() => {
      if (!isDeleting && complete) { setIsDeleting(true); return; }
      if (isDeleting && empty) {
        setIsDeleting(false);
        setLineIndex((i) => (i + 1) % TYPED_LINES.length);
        return;
      }
      setTypedText((s) =>
        isDeleting ? currentLine.slice(0, Math.max(0, s.length - 1)) : currentLine.slice(0, s.length + 1)
      );
    }, delay);

    return () => window.clearTimeout(t);
  }, [currentLine, isDeleting, typedText]);

  /* ── Video loop ── */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.playbackRate = 0.92;
    const onCanPlay = () => setVideoReady(true);
    video.addEventListener("canplay", onCanPlay);
    if (video.readyState >= 3) setVideoReady(true);
    const onTime = () => {
      if (!Number.isFinite(video.duration) || video.duration <= 1) return;
      if (video.currentTime >= video.duration - 0.28) {
        video.currentTime = 0.04;
        void video.play();
      }
    };
    video.addEventListener("timeupdate", onTime);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("canplay", onCanPlay);
    };
  }, []);

  return (
    <section className="jk-hero relative isolate min-h-screen overflow-hidden bg-[#141210] text-white">
      {/* ── Video loading screen ── */}
      <AnimatePresence>
        {!videoReady && (
          <motion.div
            className="jk-premium-loader fixed inset-0 z-[999] flex items-center justify-center"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, filter: "blur(12px)" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="jk-premium-loader-grid" aria-hidden="true" />
            <div className="jk-premium-loader-glow" aria-hidden="true" />

            <motion.div
              className="jk-premium-loader-panel"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="jk-loader-mark-wrap">
                <span className="jk-loader-corner top-left" />
                <span className="jk-loader-corner top-right" />
                <span className="jk-loader-corner bottom-left" />
                <span className="jk-loader-corner bottom-right" />

                <div className="jk-loader-orbit" aria-hidden="true">
                  <span />
                  <span />
                </div>

                <motion.div
                  className="jk-loader-logo"
                  animate={{ opacity: [0.72, 1, 0.72], scale: [0.985, 1, 0.985] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Image src="/logo.png" alt="JK Interiors" width={92} height={92} className="object-contain" priority />
                </motion.div>
              </div>

              <div className="jk-loader-copy">
                <span>JK Interiors</span>
                <strong>Composing your experience</strong>
              </div>

              <div className="jk-loader-progress" aria-hidden="true">
                <span />
                <span />
                <span />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video background */}
      <div className="absolute inset-0 -z-10">
        <video
          ref={videoRef}
          className="jk-hero-video"
          autoPlay muted loop playsInline preload="auto"
          disablePictureInPicture
          controlsList="nodownload nofullscreen noremoteplayback"
          aria-hidden="true"
        >
          <source src={HERO_VIDEO_SRC} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#1a1715_0%,rgba(26,23,21,0.86)_24%,rgba(26,23,21,0.48)_55%,rgba(26,23,21,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(20,18,16,0.50)_0%,rgba(20,18,16,0.08)_46%,#141210_100%)]" />
      </div>

      {/* Nav */}
      <nav className="jk-nav relative z-30 mx-auto flex w-full max-w-[1500px] items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link href="/" className="jk-logo" aria-label="JK Interiors home">
          <Image src="/logo.png" alt="JK Interiors" width={48} height={48} className="object-contain" style={{ maxHeight: "48px", width: "auto" }} />
          <span className="jk-logo-copy">
            <strong>JK Interiors</strong>
            <span>Design & Build Studio</span>
          </span>
        </Link>
        <div className="hidden items-center gap-8 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="jk-nav-link">
              {link.label}
            </Link>
          ))}
        </div>
        <a
          href={`https://wa.me/919063096060?text=${encodeURIComponent("Hi, I'd like to schedule a consultation with JK Interiors.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="jk-nav-cta"
        >Schedule a call</a>
      </nav>

      {/* Content */}
      <div className="relative z-20 mx-auto grid min-h-[calc(100vh-122px)] w-full max-w-[1500px] items-center gap-8 px-5 pb-8 pt-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.5fr)] lg:px-12 xl:gap-20">

        {/* Left: copy */}
        <div className="flex flex-col gap-0 max-w-[740px]">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: "easeOut" }}
            className="flex items-center gap-4 mb-7"
          >
            <div className="h-px w-10" style={{ background: "var(--gold)" }} />
            <span
              className="uppercase tracking-[0.22em]"
              style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)", fontSize: "0.7rem" }}
            >
              Premium interior design studio
            </span>
          </motion.div>

          {/* Main headline */}
          <motion.h1
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.1, delay: 0.3, ease: "easeOut" }}
            className="font-light text-white leading-[1.03]"
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "clamp(3rem, 7vw, 6.8rem)",
            }}
          >
            Luxury Interiors.{" "}
            <em style={{ color: "var(--gold-soft)" }}>Executed Without Chaos.</em>
          </motion.h1>

          {/* Typed line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.75 }}
            className="mt-6 flex items-center gap-3"
            aria-live="polite"
          >
            <div className="h-px w-6 flex-shrink-0" style={{ background: "rgba(216,189,125,0.5)" }} />
            <span
              className="italic"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                color: "rgba(255,255,255,0.6)",
              }}
            >
              {typedText}
            </span>
            <span
              className="inline-block w-0.5 h-5 animate-pulse flex-shrink-0"
              style={{ background: "var(--gold)", animationDuration: "1s" }}
              aria-hidden
            />
          </motion.div>

          {/* Sub copy */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.9, ease: "easeOut" }}
            className="mt-7 leading-relaxed max-w-[580px]"
            style={{
              color: "rgba(255,255,255,0.52)",
              fontFamily: "var(--font-label)",
              fontSize: "clamp(0.9rem, 1.3vw, 1.05rem)",
            }}
          >
            Premium turnkey interiors planned with clarity, executed with discipline,
            and built around how people actually live.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link href="/contact" className="jk-primary-btn">Start your project</Link>
            <Link href="/gallery" className="jk-secondary-btn">View portfolio</Link>
          </motion.div>

          {/* Metrics */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.35 }}
            className="mt-10 flex flex-wrap gap-x-6 gap-y-5 sm:gap-x-8 border-t pt-8"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            {METRICS.map((m) => (
              <div key={m.label} className="flex flex-col gap-1">
                <span
                  className="leading-none"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(1.4rem, 2.5vw, 2.2rem)",
                    color: "var(--gold-soft)",
                    fontWeight: 300,
                  }}
                >
                  {m.value}
                </span>
                <span
                  className="uppercase tracking-[0.12em]"
                  style={{
                    fontFamily: "var(--font-label)",
                    fontSize: "0.58rem",
                    color: "rgba(255,255,255,0.35)",
                  }}
                >
                  {m.label}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: info card */}
        <motion.aside
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: "easeOut" }}
          className="hidden lg:flex flex-col gap-6 p-8"
          style={{
            border: "1px solid rgba(216,189,125,0.22)",
            background: "rgba(26,23,21,0.72)",
            backdropFilter: "blur(16px)",
          }}
          aria-label="Studio approach"
        >
          <div className="flex items-center justify-between">
            <span
              className="uppercase tracking-[0.2em] text-xs"
              style={{ color: "var(--gold-soft)", fontFamily: "var(--font-label)" }}
            >
              Design intelligence
            </span>
            <span
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "2rem",
                color: "rgba(255,255,255,0.07)",
                fontWeight: 300,
                lineHeight: 1,
              }}
            >
              01
            </span>
          </div>

          <div className="h-px" style={{ background: "rgba(216,189,125,0.15)" }} />

          <p
            className="leading-relaxed text-sm"
            style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-label)" }}
          >
            Every project moves through a clear system — from planning and costing to
            execution and final handover. We balance aesthetics, functionality, storage,
            materials, and site precision to create homes that feel refined for years.
          </p>

          <div className="flex flex-col gap-3">
            {["Concept planning", "Material curation", "Site execution", "Final styling"].map((pt, i) => (
              <div key={pt} className="flex items-center gap-3">
                <span
                  style={{
                    fontFamily: "var(--font-label)",
                    fontSize: "0.6rem",
                    letterSpacing: "0.15em",
                    color: "var(--gold)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="h-px w-4 flex-shrink-0" style={{ background: "rgba(216,189,125,0.25)" }} />
                <span
                  className="text-sm"
                  style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-label)" }}
                >
                  {pt}
                </span>
              </div>
            ))}
          </div>

          <div className="h-px" style={{ background: "rgba(216,189,125,0.15)" }} />

          <Link
            href="/services"
            className="flex items-center gap-3 group"
          >
            <span
              className="text-xs uppercase tracking-[0.16em] transition-colors duration-200 group-hover:opacity-100"
              style={{ color: "var(--gold)", fontFamily: "var(--font-label)", opacity: 0.7 }}
            >
              Explore services
            </span>
            <span
              className="transition-transform duration-200 group-hover:translate-x-1"
              style={{ color: "var(--gold)", fontSize: "0.8rem" }}
            >
              →
            </span>
          </Link>
        </motion.aside>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8, duration: 0.8 }}
      >
        <span
          className="uppercase tracking-[0.2em]"
          style={{ color: "rgba(255,255,255,0.25)", fontFamily: "var(--font-label)", fontSize: "0.58rem" }}
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
