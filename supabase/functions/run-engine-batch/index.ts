// Feature 1.2 — ask every active AI engine (Grok, ChatGPT) each of a company's prompts for one round.
// Processes PER_INVOCATION (prompt, engine) pairs per call and re-invokes itself, staying under the
// Edge Function wall-clock limit. Already-answered pairs are skipped (idempotent). An engine whose
// every call in a batch fails is dropped for the rest of the round, so one bad key can't sink the others.
import { chain, db, must, pipelineStep, startRound } from "../_shared/runtime.ts";
import { activeEngines, ask } from "../_shared/engines.ts";
import { extractUrls } from "../_shared/extract.ts";
import { ENGINES, type Engine } from "../_shared/types.ts";

const BATCH = 8;
const PER_INVOCATION = 24;

pipelineStep("run-engine-batch", async (body, run) => {
  const sb = db();

  if (body.trigger === "scheduled_weekly") {
    const companies = must(await sb.from("companies").select("id").eq("onboarding_completed", true), "load companies");
    await Promise.all(companies.map((c: { id: string }) => chain("run-engine-batch", { company_id: c.id })));
    return;
  }

  const company_id = body.company_id as string;
  let round = body.round as number | undefined;
  if (!round) {
    const opened = await startRound(sb, company_id, (body.triggered_by_recommendation_id as string | undefined) ?? null);
    if (!opened) return; // a round is already running
    round = opened;
  }
  run.round = round; // from here on, a failure marks this round failed

  const skip = (Array.isArray(body.skip) ? body.skip : []).filter((e): e is Engine => (ENGINES as readonly unknown[]).includes(e));
  const engines = activeEngines().filter((e) => !skip.includes(e));
  if (!engines.length) throw new Error(`every AI engine failed this round (${skip.join(", ")})`);

  const prompts = must(
    await sb.from("prompts").select("id, text, responses(measurement_round, engine)").eq("company_id", company_id).eq("active", true),
    "load prompts",
  ) as { id: string; text: string; responses: { measurement_round: number; engine: string }[] }[];
  const todo = prompts.flatMap((p) =>
    engines.filter((e) => !p.responses.some((r) => r.measurement_round === round && r.engine === e)).map((engine) => ({ ...p, engine })),
  );
  const slice = todo.slice(0, PER_INVOCATION);

  let ok = 0;
  const working = new Set<Engine>();
  for (let i = 0; i < slice.length; i += BATCH) {
    const batch = slice.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (t) => {
        const { text, model } = await ask(t.engine, [{ role: "user", content: t.text }]);
        must(
          await sb.from("responses").insert({ prompt_id: t.id, engine: t.engine, full_text: text, raw_sources: extractUrls(text), measurement_round: round, model_version: model }).select("id"),
          "insert response",
        );
      }),
    );
    results.forEach((r, j) => {
      if (r.status === "fulfilled") {
        ok++;
        working.add(batch[j].engine);
      } else console.error(`[run-engine-batch] ${batch[j].engine} prompt failed:`, String(r.reason));
    });
  }

  const dead = [...new Set(slice.map((t) => t.engine))].filter((e) => !working.has(e));
  if (dead.length) console.error(`[run-engine-batch] dropping ${dead.join(", ")} for round ${round}: every call failed`);
  if (dead.length === engines.length) throw new Error(`every AI engine failed this round (${dead.join(", ")})`);

  const nextSkip = [...skip, ...dead];
  const remaining = todo.filter((t) => !nextSkip.includes(t.engine)).length - ok;
  await chain(remaining > 0 ? "run-engine-batch" : "extract-citations", { company_id, round, skip: nextSkip });
});
