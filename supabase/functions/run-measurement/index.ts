// Feature 3.1 — start a re-measurement round 14 days after a recommendation is implemented.
// Daily via pg_cron ({trigger:"scheduled_check"}) or for one company ({company_id}).
import { chain, db, must, pipelineStep } from "../_shared/runtime.ts";

const WAIT_MS = 14 * 24 * 60 * 60 * 1000;

pipelineStep("run-measurement", async (body) => {
  const sb = db();
  let q = sb.from("recommendations").select("id, company_id, implemented_at").eq("status", "implemented").lte("implemented_at", new Date(Date.now() - WAIT_MS).toISOString());
  if (body.company_id) q = q.eq("company_id", body.company_id);
  const due = must(await q, "load implemented recs") as { id: string; company_id: string; implemented_at: string }[];

  const byCompany = new Map<string, typeof due>();
  for (const r of due) byCompany.set(r.company_id, [...(byCompany.get(r.company_id) ?? []), r]);

  for (const [companyId, recs] of byCompany) {
    const [last] = must(
      await sb.from("measurement_runs").select("started_at, status").eq("company_id", companyId).order("round_number", { ascending: false }).limit(1),
      "load last run",
    ) as { started_at: string | null; status: string }[];
    const lastStart = last?.started_at ? Date.parse(last.started_at) : 0;
    // Due = its 14-day window has passed and no round has started since then.
    const pending = recs.filter((r) => Date.parse(r.implemented_at) + WAIT_MS > lastStart);
    if (!pending.length || last?.status === "running" || last?.status === "pending") continue;
    await chain("run-chatgpt-batch", { company_id: companyId, triggered_by_recommendation_id: pending[0].id });
  }
});
