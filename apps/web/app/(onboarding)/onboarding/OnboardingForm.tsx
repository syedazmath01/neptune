"use client";

import { useActionState, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createCompany, type OnboardingState } from "./actions";
import { DOMAIN_PATTERN as DOMAIN } from "@/lib/domain";

const STEPS = ["Company", "Competitors", "Goals"] as const;

const input =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20";

export function OnboardingForm() {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(createCompany, {});
  const [step, setStep] = useState(0);
  const [competitors, setCompetitors] = useState(["", ""]);
  const formRef = useRef<HTMLFormElement>(null);

  // Steps are hidden, not unmounted, so the browser can't flag a hidden empty field on submit.
  // Check the visible step's fields before moving on.
  const next = () => {
    const fields = formRef.current?.querySelectorAll<HTMLInputElement>(`[data-step="${step}"] :is(input, select, textarea)`) ?? [];
    if ([...fields].every((f) => f.reportValidity())) setStep((s) => s + 1);
  };

  return (
    <form
      ref={formRef}
      action={action}
      // A required field on a hidden step blocks submit silently; jump to that step and show why.
      onInvalidCapture={(e) => {
        const field = e.target as HTMLInputElement;
        const s = Number(field.closest("[data-step]")?.getAttribute("data-step"));
        if (s !== step) {
          setStep(s);
          requestAnimationFrame(() => field.reportValidity());
        }
      }}
      className="w-full max-w-xl glass rounded-3xl p-6 md:p-8"
    >
      <ol className="mb-8 flex gap-2">
        {STEPS.map((label, i) => (
          <li key={label} className="flex-1">
            <div className="h-1.5 overflow-hidden rounded-full bg-cream-200">
              <motion.div
                className="h-full bg-forest-600"
                initial={false}
                animate={{ width: i <= step ? "100%" : "0%" }}
                transition={{ duration: 0.35 }}
              />
            </div>
            <p className={`mt-2 text-xs font-medium ${i <= step ? "text-forest-700" : "text-muted"}`}>{label}</p>
          </li>
        ))}
      </ol>

      {/* All steps stay mounted so every field is submitted; only visibility changes. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.25 }}
        >
          <h2 className="font-display text-2xl text-forest-800">
            {["Tell us about your company", "Who do you compete with?", "What are you optimizing for?"][step]}
          </h2>
        </motion.div>
      </AnimatePresence>

      <div data-step="0" className={step === 0 ? "mt-6 space-y-4" : "hidden"}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Company name</span>
          <input name="name" required className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Website domain</span>
          <input name="domain" required placeholder="acme.com" pattern={DOMAIN} title="Enter your website address, e.g. acme.com" className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Industry</span>
          <select name="industry" required defaultValue="" className={input}>
            <option value="" disabled>Select…</option>
            <option value="saas">SaaS</option>
            <option value="professional_services">Professional Services</option>
            <option value="ecommerce">E-commerce</option>
            <option value="other">Other</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Main product or service</span>
          <textarea name="product" rows={3} className={input} />
        </label>
      </div>

      <div data-step="1" className={step === 1 ? "mt-6 space-y-3" : "hidden"}>
        <p className="text-sm text-muted">Add the website addresses (like hubspot.com) of 2–5 companies that sell something similar to you. Neptune checks whether AI recommends them instead of you.</p>
        {competitors.map((value, i) => (
          <input
            key={i}
            name="competitor"
            required={i < 2}
            pattern={DOMAIN}
            title="Enter the competitor's website address, e.g. hubspot.com (not just the name)"
            aria-label={`Competitor ${i + 1} website`}
            value={value}
            onChange={(e) => setCompetitors((c) => c.map((v, j) => (j === i ? e.target.value : v)))}
            placeholder={i === 0 ? "e.g. hubspot.com" : `competitor${i + 1}.com`}
            className={input}
          />
        ))}
        {competitors.length < 5 && (
          <button
            type="button"
            onClick={() => setCompetitors((c) => [...c, ""])}
            className="min-h-11 text-sm font-semibold text-forest-700"
          >
            + Add another competitor
          </button>
        )}
      </div>

      <div data-step="2" className={step === 2 ? "mt-6 space-y-4" : "hidden"}>
        <p className="text-sm text-muted">Neptune uses your goal and pain point to choose which customer questions to ask AI assistants.</p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Primary goal</span>
          <select name="goal" defaultValue="Increase inbound leads" className={input}>
            <option>Increase inbound leads</option>
            <option>Improve brand visibility</option>
            <option>Reduce CAC</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Current pain point</span>
          <textarea name="pain_point" rows={3} className={input} />
        </label>
      </div>

      {state.error && <p className="mt-4 rounded-lg bg-danger/10 px-3 py-2 text-sm text-danger">{state.error}</p>}

      <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={`min-h-11 rounded-xl px-5 font-medium text-muted hover:bg-cream-100 ${step === 0 ? "invisible" : ""}`}
        >
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={next}
            className="min-h-11 rounded-xl bg-forest-700 px-6 font-semibold text-cream-50 hover:bg-forest-800"
          >
            Continue
          </button>
        ) : (
          <button
            disabled={pending}
            className="min-h-11 rounded-xl bg-terracotta-500 px-6 font-semibold text-white hover:bg-terracotta-600 disabled:opacity-60"
          >
            {pending ? "Setting up…" : "Start analysis"}
          </button>
        )}
      </div>
    </form>
  );
}
