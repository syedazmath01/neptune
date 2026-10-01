"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type RecStatus = "pending" | "approved" | "rejected" | "in_progress" | "implemented" | "skipped";

// Server-side source of truth for the approval workflow (Feature 2.1/2.2).
const TRANSITIONS: Record<RecStatus, RecStatus[]> = {
  pending: ["approved", "rejected"],
  approved: ["in_progress", "implemented", "skipped"],
  in_progress: ["implemented", "skipped"],
  rejected: ["pending"],
  skipped: ["pending"],
  implemented: [],
};

export async function setRecommendationStatus(id: string, next: RecStatus, notes?: string): Promise<{ error?: string }> {
  if (!/^[0-9a-f-]{36}$/i.test(id) || !(next in TRANSITIONS)) return { error: "Invalid request." };

  const supabase = await createClient();
  // RLS scopes this to the caller's own company; a foreign id simply isn't found.
  const { data: rec } = await supabase.from("recommendations").select("status").eq("id", id).maybeSingle();
  if (!rec) return { error: "Recommendation not found." };
  if (!TRANSITIONS[rec.status as RecStatus]?.includes(next)) return { error: `Can't move from ${rec.status} to ${next}.` };

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("recommendations")
    .update({
      status: next,
      updated_at: now,
      ...(next === "implemented" ? { implemented_at: now, implementation_notes: notes?.trim().slice(0, 2000) || null } : {}),
    })
    .eq("id", id);
  if (error) return { error: "Couldn't update. Please try again." };

  revalidatePath("/recommendations");
  revalidatePath("/overview");
  return {};
}
