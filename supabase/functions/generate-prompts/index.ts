// Feature 1.1 — open a measurement round, generate customer-intent prompts if the company has none,
// then start the engine run. Opening the round first lets the dashboard show progress and any failure.
import { chain, db, must, pipelineStep, startRound } from "../_shared/runtime.ts";
import { activeEngines, ask } from "../_shared/engines.ts";
import { parsePrompts, promptGenerationMessages } from "../_shared/prompts.ts";

pipelineStep("generate-prompts", async ({ company_id }, run) => {
  const sb = db();
  const round = await startRound(sb, company_id as string);
  if (!round) return; // a round is already running
  run.round = round;

  const { count } = await sb.from("prompts").select("id", { count: "exact", head: true }).eq("company_id", company_id).eq("active", true);

  if (!count) {
    const c = must(
      await sb.from("companies").select("name, domain, industry, products_services, business_goals, competitors(name, domain)").eq("id", company_id).single(),
      "load company",
    ) as { name: string; domain: string; industry: string; products_services: string[] | null; business_goals: string | null; competitors: { name: string; domain: string }[] };

    const { text } = await ask(
      activeEngines()[0],
      promptGenerationMessages({ name: c.name, domain: c.domain, industry: c.industry, products: c.products_services?.join("; ") ?? "", goals: c.business_goals ?? "", competitors: c.competitors }),
      true,
    );
    const prompts = parsePrompts(text);
    if (prompts.length < 10) throw new Error(`prompt generation returned only ${prompts.length} valid prompts`);
    must(await sb.from("prompts").insert(prompts.map((p) => ({ company_id, ...p }))).select("id"), "insert prompts");
  }

  await chain("run-engine-batch", { company_id, round });
});
