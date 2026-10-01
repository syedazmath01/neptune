"use client";

import { useState, useTransition } from "react";
import { setRecommendationStatus, type RecStatus } from "@/lib/actions/recommendations";

const btn = "min-h-11 rounded-full px-4 text-sm font-semibold transition disabled:opacity-60";

export function RecommendationActions({ id, status }: { id: string; status: RecStatus }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const [notes, setNotes] = useState("");

  const go = (next: RecStatus, n?: string) =>
    start(async () => {
      const r = await setRecommendationStatus(id, next, n);
      setError(r.error ?? null);
      if (!r.error) setNotesOpen(false);
    });

  if (status === "implemented") return null;

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2">
        {status === "pending" && (
          <>
            <button disabled={pending} onClick={() => go("approved")} className={`${btn} bg-forest-800 text-cream-50`}>Approve</button>
            <button disabled={pending} onClick={() => go("rejected")} className={`${btn} glass text-ink`}>Reject</button>
          </>
        )}
        {status === "approved" && (
          <button disabled={pending} onClick={() => go("in_progress")} className={`${btn} glass text-ink`}>Start working on it</button>
        )}
        {(status === "approved" || status === "in_progress") && (
          <>
            <button disabled={pending} onClick={() => setNotesOpen((o) => !o)} className={`${btn} bg-forest-800 text-cream-50`}>Mark implemented</button>
            <button disabled={pending} onClick={() => go("skipped")} className={`${btn} glass text-ink`}>Skip</button>
          </>
        )}
        {(status === "rejected" || status === "skipped") && (
          <button disabled={pending} onClick={() => go("pending")} className={`${btn} glass text-ink`}>Restore</button>
        )}
      </div>

      {notesOpen && (
        <div className="mt-3 space-y-2">
          <label className="block text-sm font-medium text-ink" htmlFor={`notes-${id}`}>What did you change? (optional)</label>
          <textarea
            id={`notes-${id}`}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            maxLength={2000}
            className="w-full rounded-xl border border-line bg-white px-4 py-3 text-base text-ink outline-none focus:border-forest-500"
          />
          <button disabled={pending} onClick={() => go("implemented", notes)} className={`${btn} bg-terracotta-500 text-white`}>
            Confirm — re-measure in 14 days
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
