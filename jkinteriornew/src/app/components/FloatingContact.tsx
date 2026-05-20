"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHONE = "+919063096060";
const PHONE_DISPLAY = "+91 90630 96060";
const EMAIL = "Info.thejkinteriors@gmail.com";
const WA_MSG = "Hi, I'm interested in your interior design services. Can we schedule a consultation?";
const WA_URL = `https://wa.me/${PHONE.replace("+", "")}?text=${encodeURIComponent(WA_MSG)}`;

const ACTIONS = [
  {
    id: "whatsapp",
    label: "WhatsApp",
    sub: "Chat now",
    href: WA_URL,
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    ),
    color: "#25D366",
    bg: "rgba(37,211,102,0.12)",
    border: "rgba(37,211,102,0.3)",
  },
  {
    id: "phone",
    label: "Call us",
    sub: PHONE_DISPLAY,
    href: `tel:${PHONE}`,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.85 10.77a19.79 19.79 0 01-3.07-8.67A2 2 0 012.77 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.74a16 16 0 006.35 6.35l1.11-1.11a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
      </svg>
    ),
    color: "var(--gold-soft)",
    bg: "rgba(216,189,125,0.1)",
    border: "rgba(216,189,125,0.3)",
  },
  {
    id: "email",
    label: "Email",
    sub: "Send a message",
    href: `mailto:${EMAIL}`,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
    color: "rgba(255,255,255,0.72)",
    bg: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.15)",
  },
];

export default function FloatingContact() {
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div
      className="fixed z-[60] flex flex-col gap-2"
      style={{ right: "16px", top: "50%", transform: "translateY(-50%)" }}
      aria-label="Quick contact options"
    >
      {ACTIONS.map((action) => (
        <div key={action.id} className="relative flex items-center justify-end">
          {/* Label tooltip */}
          <AnimatePresence>
            {hovered === action.id && (
              <motion.div
                initial={{ opacity: 0, x: 8, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 8, scale: 0.95 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute right-14 flex flex-col items-end gap-0.5 pointer-events-none"
                style={{ whiteSpace: "nowrap" }}
              >
                <span
                  style={{
                    background: "#1a1715",
                    border: `1px solid ${action.border}`,
                    color: action.color,
                    fontFamily: "var(--font-label)",
                    fontSize: "0.65rem",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    padding: "4px 10px",
                    display: "block",
                  }}
                >
                  {action.label}
                </span>
                <span
                  style={{
                    background: "#1a1715",
                    border: `1px solid rgba(255,255,255,0.07)`,
                    borderTop: "none",
                    color: "rgba(255,255,255,0.38)",
                    fontFamily: "var(--font-label)",
                    fontSize: "0.6rem",
                    padding: "3px 10px",
                    display: "block",
                    maxWidth: "200px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {action.sub}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Icon button */}
          <motion.a
            href={action.href}
            target={action.id === "whatsapp" ? "_blank" : undefined}
            rel={action.id === "whatsapp" ? "noopener noreferrer" : undefined}
            aria-label={action.label}
            onMouseEnter={() => setHovered(action.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(action.id)}
            onBlur={() => setHovered(null)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="flex items-center justify-center"
            style={{
              width: "44px",
              height: "44px",
              background: hovered === action.id ? action.bg : "rgba(7,7,7,0.85)",
              border: `1px solid ${hovered === action.id ? action.border : "rgba(255,255,255,0.1)"}`,
              color: hovered === action.id ? action.color : "rgba(255,255,255,0.45)",
              backdropFilter: "blur(12px)",
              transition: "background 0.2s, border-color 0.2s, color 0.2s",
              flexShrink: 0,
            }}
          >
            {action.icon}
          </motion.a>
        </div>
      ))}

      {/* Vertical line below */}
      <motion.div
        className="mx-auto"
        style={{
          width: "1px",
          height: "36px",
          background: "linear-gradient(to bottom, rgba(216,189,125,0.3), transparent)",
          marginTop: "4px",
        }}
        animate={{ scaleY: [0.6, 1, 0.6], opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}
