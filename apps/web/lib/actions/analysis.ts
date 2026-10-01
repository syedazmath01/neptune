"use server";

import { revalidatePath } from "next/cache";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { runPipeline } from "@/lib/pipeline";

export type ActionResult = { error?: string; message?: string };

const RERUN_COOLDOWN_MS = 60 * 60 * 1000;

export async function rerunAnalysis(): Promise<ActionResult> {
  const company = await requireCompany();
  const supabase = await createClient();

  const { data: last } = await supabase
    .from("measurement_runs")
    .select("status, started_at")
    .eq("company_id", company.id)
    .order("round_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (last && (last.status === "running" || last.status === "pending")) return { error: "An analysis is already running." };
  // Cost guardrail: each run makes ~50 ChatGPT calls.
  if (last?.status === "completed" && last.started_at && Date.now() - Date.parse(last.started_at) < RERUN_COOLDOWN_MS) {
    return { error: "You can re-run the analysis once per hour." };
  }

  const { count } = await supabase.from("prompts").select("id", { count: "exact", head: true }).eq("company_id", company.id);
  try {
    await runPipeline(count ? "run-chatgpt-batch" : "generate-prompts", { company_id: company.id });
  } catch {
    return { error: "Couldn't start the analysis. Please try again in a minute." };
  }
  revalidatePath("/overview");
  return { message: "Analysis started." };
}

export async function saveGoogleRanks(_: ActionResult, formData: FormData): Promise<ActionResult> {
  const company = await requireCompany();
  const supabase = await createClient();

  const updates: { id: string; rank: number | null }[] = [];
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("rank:")) continue;
    const id = key.slice(5);
    if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid prompt." };
    const raw = String(value).trim();
    const rank = raw === "" ? null : Number(raw);
    if (rank !== null && !(Number.isInteger(rank) && rank >= 1 && rank <= 100)) {
      return { error: "Google rank must be a whole number from 1 to 100, or empty." };
    }
    updates.push({ id, rank });
  }

  const results = await Promise.all(
    updates.map(({ id, rank }) => supabase.from("prompts").update({ google_rank: rank }).eq("id", id).eq("company_id", company.id)),
  );
  if (results.some((r) => r.error)) return { error: "Some rankings couldn't be saved." };

  const { data: run } = await supabase
    .from("measurement_runs")
    .select("round_number")
    .eq("company_id", company.id)
    .eq("status", "completed")
    .order("round_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (run) {
    try {
      await runPipeline("analyze-gaps", { company_id: company.id, round: run.round_number });
    } catch {
      return { error: "Rankings saved, but gap recalculation couldn't start. Try again shortly." };
    }
  }
  revalidatePath("/gaps");
  return { message: run ? "Rankings saved — recalculating gaps and recommendations…" : "Rankings saved. They'll be used in your first analysis." };
}
