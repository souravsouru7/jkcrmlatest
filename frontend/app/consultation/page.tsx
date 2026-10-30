"use client";

import { FormEvent, useState } from "react";
import { Cormorant_Garamond, Josefin_Sans } from "next/font/google";
import { api } from "@/lib/api";
import {
  CONSULTATION_DESCRIPTION,
  CONSULTATION_QUESTIONS,
  CONSULTATION_TITLE,
  type ConsultationAnswers,
  type ConsultationQuestion,
  validateConsultationField,
} from "@/lib/consultationForm";

// Public page (no login): customers open jkcrm.site/consultation and their answers are saved to the CRM.
// Look follows thejkinteriors.com: dark background, gold accents, Cormorant Garamond + Josefin Sans.

const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["400", "500", "600"] });
const label = Josefin_Sans({ subsets: ["latin"], weight: ["300", "400", "600"] });

const OTHER = "__other__";

export default function ConsultationPage() {
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function setText(id: string, value: string) {
    setValues((v) => ({ ...v, [id]: value }));
    if (fieldErrors[id]) setFieldErrors((e) => ({ ...e, [id]: "" }));
  }

  // Errors for every question; "Other" ticked but left empty counts as an error.
  function validateAll(): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const q of CONSULTATION_QUESTIONS) {
      const value = values[q.id];
      if (q.type === "text" || q.type === "paragraph") {
        const msg = validateConsultationField(q.id, typeof value === "string" ? value : "");
        if (msg) errors[q.id] = msg;
      }
      const otherChosen = Array.isArray(value) ? value.includes(OTHER) : value === OTHER;
      if (q.other && otherChosen && !(otherText[q.id] || "").trim()) errors[q.id] = "Please specify your \"Other\" answer.";
    }
    return errors;
  }

  function toggleOption(id: string, option: string) {
    setValues((v) => {
      const current = Array.isArray(v[id]) ? (v[id] as string[]) : [];
      return { ...v, [id]: current.includes(option) ? current.filter((o) => o !== option) : [...current, option] };
    });
  }

  // "Other" choices are stored as the typed text, like Google Forms does.
  function buildAnswers(): ConsultationAnswers {
    const answers: ConsultationAnswers = {};
    for (const q of CONSULTATION_QUESTIONS) {
      const value = values[q.id];
      const other = (otherText[q.id] || "").trim();
      if (q.type === "checkbox") {
        const list = ((value as string[]) || []).filter((o) => o !== OTHER);
        if ((value as string[] | undefined)?.includes(OTHER) && other) list.push(other);
        if (list.length) answers[q.id] = list;
      } else if (q.type === "radio") {
        const chosen = value === OTHER ? other : (value as string) || "";
        if (chosen) answers[q.id] = chosen;
      } else if (typeof value === "string" && value.trim()) {
        answers[q.id] = value.trim();
      }
    }
    return answers;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    const errors = validateAll();
    setFieldErrors(errors);
    const firstInvalid = CONSULTATION_QUESTIONS.find((q) => errors[q.id]);
    if (firstInvalid) {
      setError("Please correct the highlighted fields.");
      document.getElementById(`q-${firstInvalid.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    const answers = buildAnswers();
    setSubmitting(true);
    try {
      await api.submitConsultation(answers);
      setDone(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${label.className} min-h-screen bg-[#141210] text-[#f3e7d4]`}>
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(216,189,125,0.12),transparent_60%)]" />

      <div className="relative mx-auto max-w-2xl px-4 py-10 sm:py-14">
        <header className="text-center">
          <a href="https://www.thejkinteriors.com/" target="_blank" rel="noopener noreferrer" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/jk-logo.png"
              alt="JK Interior's Studio — Designing Dreams, Defining Luxury"
              className="mx-auto h-28 w-28 rounded-full object-cover ring-1 ring-[#d8bd7d]/40 sm:h-32 sm:w-32"
            />
          </a>
          <p className="mt-6 text-[11px] uppercase tracking-[0.35em] text-[#d8bd7d]">Design Consultation</p>
          <h1 className={`${display.className} mt-3 text-4xl font-medium leading-tight text-white sm:text-5xl`}>
            {CONSULTATION_TITLE}
          </h1>
          <div className="mx-auto mt-5 h-px w-16 bg-[#d8bd7d]/60" />
          <p className="mx-auto mt-5 max-w-xl whitespace-pre-line text-sm font-light leading-relaxed text-[#f3e7d4]/75">
            {CONSULTATION_DESCRIPTION}
          </p>
          {!done && <p className="mt-4 text-xs text-[#d8bd7d]/80">* Indicates required question</p>}
        </header>

        {done ? (
          <div className="mt-10 rounded-2xl border border-[#d8bd7d]/25 bg-[#1b1712] p-8 text-center">
            <p className="text-[11px] uppercase tracking-[0.35em] text-[#d8bd7d]">Response recorded</p>
            <h2 className={`${display.className} mt-3 text-3xl text-white`}>Thank you</h2>
            <p className="mt-3 text-sm font-light text-[#f3e7d4]/75">
              Our design team will review your preferences and contact you shortly.
            </p>
            <a
              href="https://www.thejkinteriors.com/"
              className="mt-6 inline-block rounded-full border border-[#d8bd7d] px-6 py-2.5 text-xs uppercase tracking-[0.2em] text-[#d8bd7d] hover:bg-[#d8bd7d] hover:text-[#141210]"
            >
              Visit our website
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            {CONSULTATION_QUESTIONS.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                value={values[q.id]}
                otherText={otherText[q.id] || ""}
                error={fieldErrors[q.id]}
                onText={(v) => setText(q.id, v)}
                onBlur={(v) => setFieldErrors((e) => ({ ...e, [q.id]: validateConsultationField(q.id, v) }))}
                onToggle={(o) => toggleOption(q.id, o)}
                onOtherText={(v) => {
                  setOtherText((t) => ({ ...t, [q.id]: v }));
                  if (fieldErrors[q.id]) setFieldErrors((e) => ({ ...e, [q.id]: "" }));
                }}
              />
            ))}

            {error && (
              <p className="rounded-xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p>
            )}

            <div className="flex flex-col-reverse items-center gap-4 pt-4 pb-10 sm:flex-row sm:justify-between">
              <button
                type="button"
                onClick={() => { setValues({}); setOtherText({}); setError(""); setFieldErrors({}); }}
                className="text-xs uppercase tracking-[0.2em] text-[#f3e7d4]/60 hover:text-[#d8bd7d]"
              >
                Clear form
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-[#d8bd7d] px-10 py-3.5 text-xs font-semibold uppercase tracking-[0.25em] text-[#141210] transition hover:bg-[#f1dfb6] disabled:opacity-60 sm:w-auto"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </form>
        )}

        <footer className="border-t border-[#d8bd7d]/15 pt-6 text-center text-[11px] uppercase tracking-[0.3em] text-[#f3e7d4]/40">
          JK Interior&apos;s Studio · Hyderabad
        </footer>
      </div>
    </div>
  );
}

type QuestionCardProps = {
  question: ConsultationQuestion;
  value: string | string[] | undefined;
  otherText: string;
  error?: string;
  onText: (value: string) => void;
  onBlur: (value: string) => void;
  onToggle: (option: string) => void;
  onOtherText: (value: string) => void;
};

function QuestionCard({ question: q, value, otherText, error, onText, onBlur, onToggle, onOtherText }: QuestionCardProps) {
  const inputLine =
    "w-full border-0 border-b border-[#d8bd7d]/30 bg-transparent px-0 py-2 text-sm text-white placeholder:text-[#f3e7d4]/35 focus:border-[#d8bd7d] focus:outline-none focus:ring-0";
  const selected = (o: string) => (q.type === "checkbox" ? ((value as string[]) || []).includes(o) : value === o);
  const choose = (o: string) => (q.type === "checkbox" ? onToggle(o) : onText(o));
  const chip = (on: boolean) =>
    `flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition ${
      on ? "border-[#d8bd7d] bg-[#d8bd7d]/10 text-white" : "border-[#d8bd7d]/15 text-[#f3e7d4]/85 hover:border-[#d8bd7d]/50"
    }`;

  return (
    <div id={`q-${q.id}`} className={`rounded-2xl border bg-[#1b1712]/80 p-5 sm:p-6 ${error ? "border-red-400/70" : "border-[#d8bd7d]/15"}`}>
      <p className="text-[15px] font-normal leading-snug text-white">
        {q.label} {q.required && <span className="text-[#d8bd7d]">*</span>}
      </p>
      {q.type === "checkbox" && <p className="mt-1 text-[11px] uppercase tracking-[0.15em] text-[#d8bd7d]/70">Select all that apply</p>}

      {q.type === "text" && (
        <input
          className={`${inputLine} mt-4`}
          placeholder="Your answer"
          type={q.id === "phone" ? "tel" : q.id === "email" ? "email" : "text"}
          inputMode={q.id === "phone" ? "tel" : q.id === "email" ? "email" : "text"}
          autoComplete={q.id === "name" ? "name" : q.id === "phone" ? "tel" : q.id === "email" ? "email" : "off"}
          maxLength={q.id === "phone" ? 16 : q.id === "name" ? 60 : 100}
          value={(value as string) || ""}
          onChange={(e) => onText(q.id === "phone" ? e.target.value.replace(/[^\d+\s-]/g, "") : e.target.value)}
          onBlur={(e) => e.target.value && onBlur(e.target.value)}
        />
      )}

      {q.type === "paragraph" && (
        <textarea
          className={`${inputLine} mt-4 resize-y`}
          rows={3}
          maxLength={1000}
          placeholder="Your answer"
          value={(value as string) || ""}
          onChange={(e) => onText(e.target.value)}
        />
      )}

      {(q.type === "radio" || q.type === "checkbox") && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {q.options?.map((o) => (
            <label key={o} className={chip(selected(o))}>
              <input
                type={q.type}
                name={q.id}
                checked={selected(o)}
                onChange={() => choose(o)}
                className="h-4 w-4 shrink-0 accent-[#d8bd7d]"
              />
              {o}
            </label>
          ))}
          {q.other && (
            <label className={`${chip(selected(OTHER))} sm:col-span-2`}>
              <input
                type={q.type}
                name={q.id}
                checked={selected(OTHER)}
                onChange={() => choose(OTHER)}
                className="h-4 w-4 shrink-0 accent-[#d8bd7d]"
              />
              <span className="shrink-0">Other:</span>
              <input
                className={`${inputLine} py-1`}
                maxLength={100}
                placeholder="Please specify"
                value={otherText}
                onChange={(e) => {
                  onOtherText(e.target.value);
                  if (e.target.value && !selected(OTHER)) choose(OTHER);
                }}
              />
            </label>
          )}
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-300">{error}</p>}
    </div>
  );
}
