// Feature 1.3 — parse this round's responses into structured citations.
import { chain, db, loadBrands, must, pipelineStep } from "../_shared/runtime.ts";
import { extractCitations } from "../_shared/extract.ts";

pipelineStep("extract-citations", async ({ company_id, round }) => {
  const sb = db();
  const { brands } = await loadBrands(sb, company_id as string);

  const responses = must(
    await sb
      .from("responses")
      .select("id, full_text, citations(id), prompts!inner(company_id)")
      .eq("prompts.company_id", company_id)
      .eq("measurement_round", round),
    "load responses",
  ) as { id: string; full_text: string; citations: { id: string }[] }[];

  const rows = responses
    .filter((r) => !r.citations.length)
    .flatMap((r) => extractCitations(r.full_text, brands).map((c) => ({ response_id: r.id, ...c })));

  for (let i = 0; i < rows.length; i += 500) {
    must(await sb.from("citations").insert(rows.slice(i, i + 500)).select("id"), "insert citations");
  }

  await chain("analyze-competitors", { company_id, round });
});
