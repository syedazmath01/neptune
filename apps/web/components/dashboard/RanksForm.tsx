"use client";

import { useActionState } from "react";
import { saveGoogleRanks, type ActionResult } from "@/lib/actions/analysis";

export function RanksForm({ prompts }: { prompts: { id: string; text: string; google_rank: number | null }[] }) {
  const [state, action, pending] = useActionState<ActionResult, FormData>(saveGoogleRanks, {});

  return (
    <form action={action} className="mt-4">
      <p className="text-sm text-muted">
        Enter where your site ranks on Google for each question (1–100, leave blank if you don&apos;t rank). Gaps where you rank well
        on Google but are missing from AI answers get the highest priority.
      </p>
      <ul className="mt-4 max-h-96 divide-y divide-line overflow-y-auto pr-1">
        {prompts.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 py-2">
            <label htmlFor={`rank-${p.id}`} className="text-sm text-ink">{p.text}</label>
            <input
              id={`rank-${p.id}`}
              name={`rank:${p.id}`}
              type="number"
              min={1}
              max={100}
              inputMode="numeric"
              defaultValue={p.google_rank ?? ""}
              placeholder="—"
              className="w-20 shrink-0 rounded-lg border border-line bg-white px-3 py-2 text-base text-ink outline-none focus:border-forest-500"
            />
          </li>
        ))}
      </ul>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button disabled={pending} className="min-h-11 rounded-full bg-forest-800 px-6 font-semibold text-cream-50 disabled:opacity-60">
          {pending ? "Saving…" : "Save rankings"}
        </button>
        {state.error && <p className="text-sm text-danger">{state.error}</p>}
        {state.message && <p className="text-sm text-success">{state.message}</p>}
      </div>
    </form>
  );
}
