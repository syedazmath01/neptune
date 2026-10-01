"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { createClient } from "@/lib/supabase/client";

// Live progress while the pipeline runs (archicture.md Section 9). RLS limits events to the user's own rows.
export function AnalysisStatus({ round, total, done: initialDone }: { round: number | null; total: number; done: number }) {
  const [done, setDone] = useState(initialDone);
  const router = useRouter();
  const refreshQueued = useRef(false);

  useEffect(() => {
    const supabase = createClient();
    const refreshSoon = () => {
      if (refreshQueued.current) return;
      refreshQueued.current = true;
      setTimeout(() => {
        refreshQueued.current = false;
        router.refresh();
      }, 1500);
    };
    const channel = supabase
      .channel("analysis-progress")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "responses" }, (p) => {
        if ((p.new as { measurement_round: number }).measurement_round === round) setDone((d) => d + 1);
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "prompts" }, refreshSoon)
      .on("postgres_changes", { event: "*", schema: "public", table: "measurement_runs" }, (p) => {
        const status = (p.new as { status?: string }).status;
        if (status === "completed" || status === "failed" || p.eventType === "INSERT") refreshSoon();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [round, router]);

  const stage = !total ? "Generating customer-intent prompts…" : done < total ? `Asking ChatGPT… ${done}/${total} prompts` : "Extracting citations, gaps and recommendations…";
  const pct = !total ? 8 : Math.min(95, 10 + (done / total) * 80);

  return (
    <div className="glass rounded-2xl p-5" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success opacity-60" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-success" />
        </span>
        <p className="font-semibold text-ink">Analysis in progress</p>
      </div>
      <p className="mt-2 text-muted">{stage}</p>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-cream-200">
        <motion.div className="h-full rounded-full bg-forest-600" animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
      </div>
      <p className="mt-2 text-xs text-muted">This usually takes about 10 minutes. You can leave this page — results appear here when ready.</p>
    </div>
  );
}
