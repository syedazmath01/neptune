// Feature 1.2 — run a company's prompts through ChatGPT for one measurement round.
// Processes PER_INVOCATION prompts per call and re-invokes itself, staying under the
// Edge Function wall-clock limit. Already-answered prompts are skipped (idempotent).
import { chain, db, must, pipelineStep } from "../_shared/runtime.ts";
import { ask } from "../_shared/openai.ts";
import { extractUrls } from "../_shared/extract.ts";

const BATCH = 8;
const PER_INVOCATION = 24;

pipelineStep("run-chatgpt-batch", async (body) => {
  const sb = db();

  if (body.trigger === "scheduled_weekly") {
    const companies = must(await sb.from("companies").select("id").eq("onboarding_completed", true), "load companies");
    await Promise.all(companies.map((c: { id: string }) => chain("run-chatgpt-batch", { company_id: c.id })));
    return;
  }

  const company_id = body.company_id as string;
  let round = body.round as number | undefined;

  if (!round) {
    const [last] = must(
      await sb.from("measurement_runs").select("round_number, status").eq("company_id", company_id).order("round_number", { ascending: false }).limit(1),
      "load runs",
    ) as { round_number: number; status: string }[];
    if (last && (last.status === "running" || last.status === "pending")) return; // one round at a time
    round = (last?.round_number ?? 0) + 1;
    must(
      await sb.from("measurement_runs").insert({
        company_id,
        round_number: round,
        status: "running",
        started_at: new Date().toISOString(),
        triggered_by_recommendation_id: (body.triggered_by_recommendation_id as string | undefined) ?? null,
      }).select("id"),
      "create run",
    );
  }

  const prompts = must(
    await sb.from("prompts").select("id, text, responses(measurement_round)").eq("company_id", company_id).eq("active", true),
    "load prompts",
  ) as { id: string; text: string; responses: { measurement_round: number }[] }[];
  const todo = prompts.filter((p) => !p.responses.some((r) => r.measurement_round === round));
  const slice = todo.slice(0, PER_INVOCATION);

  let ok = 0;
  for (let i = 0; i < slice.length; i += BATCH) {
    const results = await Promise.allSettled(
      slice.slice(i, i + BATCH).map(async (p) => {
        const { text, model } = await ask([{ role: "user", content: p.text }]);
        must(
          await sb.from("responses").insert({ prompt_id: p.id, engine: "chatgpt", full_text: text, raw_sources: extractUrls(text), measurement_round: round, model_version: model }).select("id"),
          "insert response",
        );
      }),
    );
    ok += results.filter((r) => r.status === "fulfilled").length;
    for (const r of results) if (r.status === "rejected") console.error("[run-chatgpt-batch] prompt failed:", String(r.reason));
  }

  if (slice.length && !ok) throw new Error("every ChatGPT call in this batch failed");
  await chain(todo.length - ok > 0 ? "run-chatgpt-batch" : "extract-citations", { company_id, round });
});
