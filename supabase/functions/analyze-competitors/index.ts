// Feature 1.4 — per-engine visibility scorecard for the round, stored on
// measurement_runs.engine_metrics (Feature 3.1 metrics). Engines are never mixed.
import { chain, db, loadBrands, must, pipelineStep, roundCitations } from "../_shared/runtime.ts";
import { changeConfidence, metrics, scorecard, type CitationRow } from "../_shared/score.ts";
import type { Engine } from "../_shared/types.ts";

type EngineMetrics = ReturnType<typeof metrics> & { answers: number; confidence_level: number | null };

pipelineStep("analyze-competitors", async ({ company_id, round }) => {
  const sb = db();
  const companyId = company_id as string;
  const r = round as number;
  const { brands } = await loadBrands(sb, companyId);
  const citations = await roundCitations(sb, companyId, r);

  const responses = must(
    await sb.from("responses").select("engine, prompts!inner(company_id)").eq("prompts.company_id", companyId).eq("measurement_round", r),
    "load responses",
  ) as { engine: Engine }[];
  const earlier = must(
    await sb.from("measurement_runs").select("engine_metrics").eq("company_id", companyId).lt("round_number", r).order("round_number"),
    "load earlier runs",
  ) as { engine_metrics: Partial<Record<Engine, EngineMetrics>> }[];

  const engine_metrics: Partial<Record<Engine, EngineMetrics>> = {};
  for (const engine of new Set(responses.map((x) => x.engine))) {
    const m = metrics(scorecard(citations.filter((c) => c.engine === engine) as CitationRow[], brands));
    const answers = responses.filter((x) => x.engine === engine).length;
    // Baseline = the first round this engine was measured in (an engine can be switched on later).
    const base = earlier.find((run) => run.engine_metrics[engine])?.engine_metrics[engine];
    engine_metrics[engine] = {
      ...m,
      answers,
      confidence_level: base ? changeConfidence(base.brand_recommendation_count, base.answers, m.brand_recommendation_count, answers) : null,
    };
  }

  must(
    await sb.from("measurement_runs").update({ engine_metrics }).eq("company_id", companyId).eq("round_number", r).select("id"),
    "save metrics",
  );
  await chain("analyze-gaps", { company_id, round });
});
