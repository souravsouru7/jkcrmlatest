"use client";

import { useEffect, useRef } from "react";

const ITEMS = [
  { strong: "VR Experience Centre", rest: " — Walk Through Your Dream Home Virtually" },
  { strong: "1 Year", rest: " Post-Handover Maintenance Support" },
  { strong: "Complimentary Smart Lock", rest: " with Every Project" },
  { strong: "10-Year", rest: " Material Warranty" },
  { strong: "Korean-Imported", rest: " Premium Materials" },
];

export default function AnnouncementStrip() {
  const trackRef = useRef<HTMLDivElement>(null);

  /* Duplicate children so the marquee loops seamlessly */
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    /* nothing extra needed — CSS handles the loop via duplicated markup */
  }, []);

  const rendered = [...ITEMS, ...ITEMS]; /* duplicate for seamless loop */

  return (
    <div
      className="jk-strip overflow-hidden"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 61,
        background: "rgba(10,9,7,0.96)",
        borderBottom: "1px solid rgba(176,137,104,0.18)",
        backdropFilter: "blur(8px)",
        height: "38px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        ref={trackRef}
        className="jk-strip-track"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          animation: "jk-marquee 38s linear infinite",
          willChange: "transform",
          whiteSpace: "nowrap",
        }}
      >
        {rendered.map((item, i) => (
          <span
            key={i}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontFamily: "var(--font-label)",
              fontSize: "0.68rem",
              letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.55)",
              paddingRight: "56px",
            }}
          >
            {/* Pulse dot */}
            <span
              style={{
                display: "inline-block",
                width: "5px",
                height: "5px",
                borderRadius: "50%",
                background: "var(--gold)",
                flexShrink: 0,
                animation: "jk-pulse 2s ease-in-out infinite",
                animationDelay: `${(i % ITEMS.length) * 0.4}s`,
              }}
            />
            <strong style={{ color: "var(--gold-soft)", fontWeight: 600 }}>{item.strong}</strong>
            {item.rest}
          </span>
        ))}
      </div>
    </div>
  );
}
