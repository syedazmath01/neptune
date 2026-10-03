"use client";

import { motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { NAV } from "@/components/dashboard/nav";

// Illustration of the real Overview page (same menu via NAV, same widgets) with sample numbers.
const QUERIES = [
  ["best project management tool for agencies", "Recommended"],
  ["how to plan sprints for a small team", "Mentioned"],
  ["alternatives to spreadsheets for task tracking", "Recommended"],
  ["project tool with client portal", "Mentioned"],
] as const;
const MENTIONS = [
  ["Competitor A", 31, "forest"],
  ["Your brand", 19, "terracotta"],
  ["g2.com", 14, "forest"],
  ["Competitor B", 9, "forest"],
] as const;
const ROUNDS = ["Baseline", "Round 2", "Round 3", "Round 4", "Round 5"];
const LINE = "M0,66 L140,58 L280,44 L420,36 L560,18";

export function DashboardPreview() {
  return (
    <div className="glass relative overflow-hidden rounded-3xl">
      <span className="absolute bottom-3 right-4 z-10 rounded-full bg-ink/70 px-2.5 py-0.5 text-[10px] font-medium text-white">Sample data</span>
      <div className="flex">
        <aside className="hidden w-44 shrink-0 border-r border-white/60 p-4 md:block">
          <p className="mb-4 text-sm font-bold tracking-wider text-ink">NEPTUNE</p>
          {NAV.map(({ label, icon: Icon }, i) => (
            <p key={label} className={`mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${i === 0 ? "bg-white/80 text-ink shadow-sm" : "text-muted"}`}>
              <Icon size={15} /> {label}
            </p>
          ))}
        </aside>

        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 flex items-center justify-between gap-2">
            <span className="font-display text-lg text-forest-800">Overview</span>
            <span className="flex items-center gap-2">
              <span className="rounded-full bg-white/70 px-2.5 py-1 text-[10px] text-ink">Free trial · 12 days left</span>
              <span className="h-7 w-7 rounded-full bg-gradient-to-br from-terracotta-400 to-forest-600" />
            </span>
          </div>

          <div className="rounded-2xl bg-white/70 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink">AI visibility</p>
                <p className="mt-1 flex items-baseline gap-2 text-2xl font-bold text-ink">
                  38% <span className="text-xs font-semibold text-success">↑ 12 pts vs last round</span>
                </p>
                <p className="text-[11px] text-muted">of 50 Grok answers mention you</p>
              </div>
              <span className="rounded-lg border border-line bg-white px-2 py-1 text-[11px] text-muted">5 rounds</span>
            </div>
            <svg viewBox="0 0 560 80" className="mt-2 h-20 w-full" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="var(--color-forest-500)" stopOpacity="0.25" />
                  <stop offset="1" stopColor="var(--color-forest-500)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path d={`${LINE} L560,80 L0,80 Z`} fill="url(#fill)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.6 }} />
              <motion.path d={LINE} fill="none" stroke="var(--color-forest-500)" strokeWidth="2.5" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeInOut" }} />
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              {ROUNDS.map((r) => <span key={r}>{r}</span>)}
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-3">
              <p className="mb-2 flex items-center justify-between text-xs font-semibold">Queries where you appear <ArrowRight size={12} /></p>
              {QUERIES.map(([q, status]) => (
                <p key={q} className="mb-1.5 flex items-center justify-between gap-2 rounded-md border border-line/70 bg-white/80 px-2 py-1.5 text-[11px]">
                  <span className="truncate">{q}</span>
                  <span className={`shrink-0 rounded-full px-1.5 text-[10px] font-semibold ${status === "Recommended" ? "bg-success/15 text-success" : "bg-severity-medium/15 text-severity-medium"}`}>{status}</span>
                </p>
              ))}
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <p className="mb-2 flex items-center justify-between text-xs font-semibold">Top mentions <ArrowRight size={12} /></p>
              {MENTIONS.map(([name, n, tone]) => (
                <div key={name} className="mb-2">
                  <p className="flex justify-between text-[11px]"><span className={tone === "terracotta" ? "font-semibold text-forest-800" : ""}>{name}</span><span className="text-muted">{n} answers</span></p>
                  <span className="mt-0.5 block h-1.5 overflow-hidden rounded-full bg-cream-200">
                    <motion.span
                      className={`block h-full rounded-full ${tone === "terracotta" ? "bg-terracotta-500" : "bg-forest-600"}`}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(n / 50) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8 }}
                    />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
