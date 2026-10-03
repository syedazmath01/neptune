// Feature 1.5 — compare AI visibility (this round) with Google rank input and record gaps.
// Gaps are found per engine, then merged so a gap seen on several engines appears once, tagged with each.
// Also re-run on its own when the user saves Google rankings (no AI engine cost).
import { chain, db, loadBrands, must, pipelineStep, roundCitations } from "../_shared/runtime.ts";
import { detectGaps, mergeEngineGaps, type PromptFacts } from "../_shared/gaps.ts";
import type { Engine } from "../_shared/types.ts";

pipelineStep("analyze-gaps", async ({ company_id, round }) => {
  const sb = db();
  const companyId = company_id as string;
  const { name, brands } = await loadBrands(sb, companyId);
  const citations = await roundCitations(sb, companyId, round as number);

  const prompts = must(
    await sb
      .from("prompts")
      .select("id, text, category, google_rank, responses!inner(measurement_round, engine)")
      .eq("company_id", companyId)
      .eq("active", true)
      .eq("responses.measurement_round", round),
    "load prompts",
  ) as { id: string; text: string; category: string; google_rank: number | null; responses: { engine: Engine }[] }[];

  // From answers, not citations: an engine that cited nobody is exactly the "you're invisible" case.
  const engines = [...new Set(prompts.flatMap((p) => p.responses.map((r) => r.engine)))];
  const factsFor = (engine: Engine): PromptFacts[] => prompts.filter((p) => p.responses.some((r) => r.engine === engine)).map((p) => {
    const cs = citations.filter((c) => c.prompt_id === p.id && c.engine === engine);
    const own = cs.filter((c) => c.entity_type === "own_company");
    return {
      prompt_id: p.id,
      text: p.text,
      category: p.category,
      google_rank: p.google_rank,
      own: { mentioned: own.length > 0, recommended: own.some((c) => c.context === "recommended") },
      competitors: brands
        .filter((b) => b.kind === "competitor")
        .map((b) => {
          const mine = cs.filter((c) => c.entity_type === "competitor" && c.domain === b.domain);
          return { name: b.name, mentioned: mine.length > 0, recommended: mine.some((c) => c.context === "recommended") };
        }),
    };
  });

  // Replace open gaps + untouched (pending) recommendations; keep anything the user already acted on.
  must(await sb.from("recommendations").delete().eq("company_id", companyId).eq("status", "pending").select("id"), "clear pending recs");
  const kept = must(
    await sb.from("recommendations").select("gap_id").eq("company_id", companyId).not("gap_id", "is", null),
    "load kept recs",
  ) as { gap_id: string }[];
  let del = sb.from("gaps").delete().eq("company_id", companyId).eq("status", "open");
  if (kept.length) del = del.not("id", "in", `(${kept.map((k) => k.gap_id).join(",")})`);
  must(await del.select("id"), "clear open gaps");

  const gaps = mergeEngineGaps(engines.flatMap((e) => detectGaps(factsFor(e), name, e)));
  if (gaps.length) must(await sb.from("gaps").insert(gaps.map((g) => ({ company_id: companyId, ...g }))).select("id"), "insert gaps");

  await chain("map-content-gaps", { company_id, round });
});
