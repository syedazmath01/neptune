// Feature 2.1 — one recommendation per open gap that doesn't have one; closes the round.
import { db, must, pipelineStep } from "../_shared/runtime.ts";
import { recommend } from "../_shared/recommend.ts";
import type { Gap } from "../_shared/types.ts";

pipelineStep("generate-recommendations", async ({ company_id, round }) => {
  const sb = db();
  const companyId = company_id as string;

  const { name } = must(await sb.from("companies").select("name").eq("id", companyId).single(), "load company") as { name: string };
  const gaps = must(await sb.from("gaps").select("*, recommendations(id)").eq("company_id", companyId).eq("status", "open"), "load gaps") as (Gap & {
    id: string;
    recommendations: { id: string }[];
  })[];

  const rows = gaps.filter((g) => !g.recommendations.length).map((g) => ({ company_id: companyId, gap_id: g.id, ...recommend(g, name) }));
  if (rows.length) must(await sb.from("recommendations").insert(rows).select("id"), "insert recommendations");

  if (round) {
    must(
      await sb.from("measurement_runs").update({ status: "completed", completed_at: new Date().toISOString() }).eq("company_id", companyId).eq("round_number", round).select("id"),
      "complete run",
    );
  }
});
