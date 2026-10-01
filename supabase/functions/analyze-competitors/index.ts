// Feature 1.4 — visibility scorecard for the round, stored on measurement_runs (Feature 3.1 metrics).
import { chain, db, loadBrands, must, pipelineStep, roundCitations } from "../_shared/runtime.ts";
import { changeConfidence, metrics, scorecard, type CitationRow } from "../_shared/score.ts";

async function responseCount(sb: ReturnType<typeof db>, companyId: string, round: number) {
  const { count } = await sb
    .from("responses")
    .select("id, prompts!inner(company_id)", { count: "exact", head: true })
    .eq("prompts.company_id", companyId)
    .eq("measurement_round", round);
  return count ?? 0;
}

pipelineStep("analyze-competitors", async ({ company_id, round }) => {
  const sb = db();
  const companyId = company_id as string;
  const r = round as number;
  const { brands } = await loadBrands(sb, companyId);

  const m = metrics(scorecard((await roundCitations(sb, companyId, r)) as CitationRow[], brands));

  let confidence_level: number | null = null;
  if (r > 1) {
    const base = must(
      await sb.from("measurement_runs").select("brand_recommendation_count").eq("company_id", companyId).eq("round_number", 1).single(),
      "load baseline",
    ) as { brand_recommendation_count: number | null };
    confidence_level = changeConfidence(
      base.brand_recommendation_count ?? 0,
      await responseCount(sb, companyId, 1),
      m.brand_recommendation_count,
      await responseCount(sb, companyId, r),
    );
  }

  must(
    await sb.from("measurement_runs").update({ ...m, confidence_level }).eq("company_id", companyId).eq("round_number", r).select("id"),
    "save metrics",
  );
  await chain("analyze-gaps", { company_id, round });
});
