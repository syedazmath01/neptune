"use client";

import { useActionState, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { createCompany, type OnboardingState } from "./actions";

const STEPS = ["Company", "Competitors", "Goals"] as const;

const input =
  "w-full rounded-xl border border-line bg-white px-4 py-3 text-base outline-none transition focus:border-forest-500 focus:ring-2 focus:ring-forest-500/20";

export function OnboardingForm() {
  const [state, action, pending] = useActionState<OnboardingState, FormData>(createCompany, {});
  const [step, setStep] = useState(0);
  const [competitors, setCompetitors] = useState(["", ""]);

  return (
    <form action={action} className="w-full max-w-xl glass rounded-3xl p-6 md:p-8">
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

      <div className={step === 0 ? "mt-6 space-y-4" : "hidden"}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Company name</span>
          <input name="name" required className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Website domain</span>
          <input name="domain" required placeholder="acme.com" className={input} />
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

      <div className={step === 1 ? "mt-6 space-y-3" : "hidden"}>
        <p className="text-sm text-muted">Add 2–5 competitor domains.</p>
        {competitors.map((value, i) => (
          <input
            key={i}
            name="competitor"
            value={value}
            onChange={(e) => setCompetitors((c) => c.map((v, j) => (j === i ? e.target.value : v)))}
            placeholder={`competitor${i + 1}.com`}
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

      <div className={step === 2 ? "mt-6 space-y-4" : "hidden"}>
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
            onClick={() => setStep((s) => s + 1)}
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
