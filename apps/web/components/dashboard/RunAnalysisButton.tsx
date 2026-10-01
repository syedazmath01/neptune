"use client";

import { useState, useTransition } from "react";
import { RefreshCw } from "lucide-react";
import { rerunAnalysis } from "@/lib/actions/analysis";

export function RunAnalysisButton({ label = "Re-run analysis", primary = false }: { label?: string; primary?: boolean }) {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<{ error?: string; message?: string }>({});

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        disabled={pending}
        onClick={() => start(async () => setMsg(await rerunAnalysis()))}
        className={`flex min-h-11 items-center gap-2 rounded-full px-5 font-semibold transition disabled:opacity-60 ${
          primary ? "bg-forest-800 text-cream-50 hover:bg-forest-700" : "glass text-ink"
        }`}
      >
        <RefreshCw size={16} className={pending ? "animate-spin" : ""} /> {pending ? "Starting…" : label}
      </button>
      {msg.error && <p className="text-sm text-danger">{msg.error}</p>}
      {msg.message && <p className="text-sm text-success">{msg.message}</p>}
    </div>
  );
}
