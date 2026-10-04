"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Minus, Plus } from "lucide-react";

const FAQ = [
  ["What does Neptune track right now?", "Right now Neptune tracks how your brand appears in Grok answers. ChatGPT is next, followed by Google, Perplexity, Gemini and other platforms."],
  ["Do I need technical knowledge to use Neptune?", "No. Enter your domain and competitors — Neptune generates the prompts, runs them, and explains the results in plain language."],
  ["How do you prove a change worked?", "Neptune re-runs the exact same prompts after you implement a recommendation and shows the before/after difference."],
  ["Why does the before/after take 14 days?", "AI assistants need time to discover a change on your website, and asking the next day usually shows nothing. So Neptune re-checks automatically 14 days after you mark a recommendation implemented — and you can run a new analysis yourself at any time."],
  ["How much does Neptune cost?", "Every account starts with a 14-day free trial — no credit card needed. After that it's $29/month, or $290/year (2 months free). Your dashboard shows the days left in your trial; choose a plan any time and we invoice you directly."],
] as const;

export function Faq() {
  const [open, setOpen] = useState(0);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      <div className="space-y-3">
        {FAQ.map(([q, a], i) => (
          <div key={q} className="glass rounded-xl">
            <button
              onClick={() => setOpen(i)}
              aria-expanded={open === i}
              className="flex min-h-14 w-full items-center justify-between gap-4 px-5 text-left text-[15px] font-semibold text-ink"
            >
              {q}
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-line bg-white">
                {open === i ? <Minus size={14} /> : <Plus size={14} />}
              </span>
            </button>
            {/* Mobile: answer inline under its question */}
            {open === i && <p className="px-5 pb-4 text-muted md:hidden">{a}</p>}
          </div>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.p
          key={open}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          className="glass hidden self-start rounded-xl px-5 py-4 text-muted md:block"
        >
          {FAQ[open][1]}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}
