"use client";

import { FormEvent, useState } from "react";
import { api } from "@/lib/api";
import {
  CONSULTATION_DESCRIPTION,
  CONSULTATION_QUESTIONS,
  CONSULTATION_TITLE,
  type ConsultationAnswers,
  type ConsultationQuestion,
} from "@/lib/consultationForm";

// Public page (no login): customers open jkcrm.site/consultation and their answers are saved to the CRM.

const OTHER = "__other__";

export default function ConsultationPage() {
  const [values, setValues] = useState<Record<string, string | string[]>>({});
  const [otherText, setOtherText] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  function setText(id: string, value: string) {
    setValues((v) => ({ ...v, [id]: value }));
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
    const answers = buildAnswers();
    if (!answers.name || !answers.phone) {
      setError("Please fill in your Full Name and Phone Number.");
      return;
    }
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
    <div className="min-h-screen bg-teal-50 text-slate-900 py-6 px-4">
      <div className="mx-auto max-w-2xl space-y-3">
        <header className="rounded-lg bg-white border border-slate-200 border-t-8 border-t-teal-700 p-6 shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-semibold">{CONSULTATION_TITLE}</h1>
          <p className="mt-3 whitespace-pre-line text-sm text-slate-600 leading-relaxed">{CONSULTATION_DESCRIPTION}</p>
          {!done && <p className="mt-4 text-xs text-red-600">* Indicates required question</p>}
        </header>

        {done ? (
          <div className="rounded-lg bg-white border border-slate-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Thank you!</h2>
            <p className="mt-2 text-sm text-slate-600">Your response has been recorded. Our team will contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {CONSULTATION_QUESTIONS.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                value={values[q.id]}
                otherText={otherText[q.id] || ""}
                onText={(v) => setText(q.id, v)}
                onToggle={(o) => toggleOption(q.id, o)}
                onOtherText={(v) => setOtherText((t) => ({ ...t, [q.id]: v }))}
              />
            ))}

            {error && <p className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</p>}

            <div className="flex items-center justify-between pt-2 pb-10">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-md bg-teal-700 px-6 py-2.5 text-sm font-medium text-white hover:bg-teal-800 disabled:opacity-60"
              >
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button
                type="button"
                onClick={() => { setValues({}); setOtherText({}); setError(""); }}
                className="text-sm font-medium text-teal-700 hover:underline"
              >
                Clear form
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

type QuestionCardProps = {
  question: ConsultationQuestion;
  value: string | string[] | undefined;
  otherText: string;
  onText: (value: string) => void;
  onToggle: (option: string) => void;
  onOtherText: (value: string) => void;
};

function QuestionCard({ question: q, value, otherText, onText, onToggle, onOtherText }: QuestionCardProps) {
  const inputLine = "w-full border-0 border-b border-slate-300 bg-transparent px-0 py-2 text-sm focus:border-teal-700 focus:outline-none focus:ring-0";
  const selected = (o: string) => (q.type === "checkbox" ? ((value as string[]) || []).includes(o) : value === o);
  const choose = (o: string) => (q.type === "checkbox" ? onToggle(o) : onText(o));

  return (
    <div className="rounded-lg bg-white border border-slate-200 p-6 shadow-sm">
      <p className="text-base font-medium">
        {q.label} {q.required && <span className="text-red-600">*</span>}
      </p>

      {q.type === "text" && (
        <input
          className={`${inputLine} mt-4 sm:w-1/2`}
          placeholder="Your answer"
          type={q.id === "phone" ? "tel" : q.id === "email" ? "email" : "text"}
          value={(value as string) || ""}
          onChange={(e) => onText(e.target.value)}
        />
      )}

      {q.type === "paragraph" && (
        <textarea
          className={`${inputLine} mt-4 resize-y`}
          rows={3}
          placeholder="Your answer"
          value={(value as string) || ""}
          onChange={(e) => onText(e.target.value)}
        />
      )}

      {(q.type === "radio" || q.type === "checkbox") && (
        <div className="mt-4 space-y-3">
          {q.options?.map((o) => (
            <label key={o} className="flex cursor-pointer items-center gap-3 text-sm">
              <input
                type={q.type}
                name={q.id}
                checked={selected(o)}
                onChange={() => choose(o)}
                className={`h-4 w-4 accent-teal-700 ${q.type === "checkbox" ? "rounded" : ""}`}
              />
              {o}
            </label>
          ))}
          {q.other && (
            <label className="flex items-center gap-3 text-sm">
              <input
                type={q.type}
                name={q.id}
                checked={selected(OTHER)}
                onChange={() => choose(OTHER)}
                className="h-4 w-4 accent-teal-700"
              />
              Other:
              <input
                className={`${inputLine} py-1`}
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
    </div>
  );
}
