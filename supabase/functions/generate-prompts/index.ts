// Feature 1.1 — generate customer-intent prompts for a company, then start the ChatGPT run.
import { chain, db, must, pipelineStep } from "../_shared/runtime.ts";
import { ask } from "../_shared/openai.ts";
import { parsePrompts, promptGenerationMessages } from "../_shared/prompts.ts";

pipelineStep("generate-prompts", async ({ company_id }) => {
  const sb = db();
  const { count } = await sb.from("prompts").select("id", { count: "exact", head: true }).eq("company_id", company_id).eq("active", true);

  if (!count) {
    const c = must(
      await sb.from("companies").select("name, domain, industry, products_services, competitors(name, domain)").eq("id", company_id).single(),
      "load company",
    ) as { name: string; domain: string; industry: string; products_services: string[] | null; competitors: { name: string; domain: string }[] };

    const { text } = await ask(
      promptGenerationMessages({ name: c.name, domain: c.domain, industry: c.industry, products: c.products_services?.join("; ") ?? "", competitors: c.competitors }),
      true,
    );
    const prompts = parsePrompts(text);
    if (prompts.length < 10) throw new Error(`prompt generation returned only ${prompts.length} valid prompts`);
    must(await sb.from("prompts").insert(prompts.map((p) => ({ company_id, ...p }))).select("id"), "insert prompts");
  }

  await chain("run-chatgpt-batch", { company_id });
});
