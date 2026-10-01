"use client";

import { motion } from "motion/react";
import { ArrowRight, ArrowUp, BarChart3, CalendarClock, FileText, LayoutGrid, MessageSquareText, Search, Sparkles, Target, Users } from "lucide-react";

const NAV = [
  [Search, "Overview"],
  [MessageSquareText, "AI Answers"],
  [LayoutGrid, "Queries"],
  [BarChart3, "Brand Mentions"],
  [Users, "Competitors"],
  [Target, "Opportunities"],
  [FileText, "Reports"],
] as const;

const QUERIES = [["best project management tools", 12], ["ai tools for startups", 8], ["neptune ai seo", 6], ["brand visibility in chatgpt", 4]] as const;
const MENTIONS = [["ChatGPT", 12, "+200%"], ["Your Brand", 8, "+100%"], ["Competitor A", 5, "+25%"], ["Competitor B", 3, "-20%"]] as const;
const LINE = "M0,70 L40,64 L80,60 L120,54 L160,57 L200,48 L240,50 L280,47 L320,46 L360,43 L400,34 L440,40 L480,28 L520,22 L560,14";

export function DashboardPreview() {
  return (
    <div className="glass relative overflow-hidden rounded-3xl">
      <span className="absolute bottom-3 right-4 rounded-full bg-ink/70 px-2.5 py-0.5 text-[10px] font-medium text-white">Sample data</span>
      <div className="flex">
        <aside className="hidden w-44 shrink-0 border-r border-white/60 p-4 md:block">
          <p className="mb-4 flex items-center gap-2 text-sm font-bold tracking-wider text-ink">
            <Sparkles size={14} className="text-forest-700" /> NEPTUNE
          </p>
          {NAV.map(([Icon, label], i) => (
            <p key={label} className={`mb-1 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] ${i === 0 ? "bg-sky-100/80 text-ink" : "text-muted"}`}>
              <Icon size={15} /> {label}
            </p>
          ))}
        </aside>

        <div className="min-w-0 flex-1 p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex w-48 items-center gap-2 rounded-lg bg-white/70 px-3 py-1.5 text-xs text-muted">
              <Search size={12} /> Overview
            </span>
            <span className="h-7 w-7 rounded-full bg-gradient-to-br from-terracotta-400 to-forest-600" />
          </div>

          <div className="rounded-2xl bg-white/70 p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-ink">AI Visibility</p>
                <p className="mt-1 flex items-center text-2xl font-bold text-success"><ArrowUp size={22} strokeWidth={3} />112%</p>
              </div>
              <span className="flex items-center gap-1 rounded-lg border border-sky-200 bg-white px-2 py-1 text-[11px] text-sky-700">
                <CalendarClock size={12} /> Last 30 days
              </span>
            </div>
            <svg viewBox="0 0 560 80" className="mt-2 h-20 w-full" preserveAspectRatio="none" aria-hidden>
              <defs>
                <linearGradient id="fill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0" stopColor="#3b82f6" stopOpacity="0.25" />
                  <stop offset="1" stopColor="#3b82f6" stopOpacity="0" />
                </linearGradient>
              </defs>
              <motion.path d={`${LINE} L560,80 L0,80 Z`} fill="url(#fill)" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 0.6 }} />
              <motion.path d={LINE} fill="none" stroke="#3b82f6" strokeWidth="2.5" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ duration: 1.4, ease: "easeInOut" }} />
            </svg>
            <div className="mt-1 flex justify-between text-[10px] text-muted">
              {["Aug 1", "Aug 7", "Aug 14", "Aug 21", "Aug 28"].map((d) => <span key={d}>{d}</span>)}
            </div>
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white/70 p-3">
              <p className="mb-2 flex items-center justify-between text-xs font-semibold">Top Mentioned Queries <ArrowRight size={12} /></p>
              {QUERIES.map(([q, n]) => (
                <p key={q} className="mb-1.5 flex justify-between rounded-md border border-line/70 bg-white/80 px-2 py-1.5 text-[11px]"><span className="truncate">{q}</span><span>{n}</span></p>
              ))}
            </div>
            <div className="rounded-2xl bg-white/70 p-3">
              <p className="mb-2 flex items-center justify-between text-xs font-semibold">Top Mentions <ArrowRight size={12} /></p>
              {MENTIONS.map(([name, n, d]) => (
                <p key={name} className="mb-1.5 grid grid-cols-[1fr_auto_3rem] gap-2 rounded-md border border-line/70 bg-white/80 px-2 py-1.5 text-[11px]">
                  <span className="truncate">{name}</span><span>{n}</span>
                  <span className={`text-right font-semibold ${d.startsWith("-") ? "text-danger" : "text-success"}`}>{d}</span>
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
