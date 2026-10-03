import { assert, assertEquals } from "jsr:@std/assert@1";
import { extractCitations } from "./extract.ts";
import { changeConfidence, metrics, scorecard } from "./score.ts";
import { detectContentGaps, detectGaps, mergeEngineGaps, parseSitemap } from "./gaps.ts";
import { recommend } from "./recommend.ts";
import { parsePrompts, promptGenerationMessages } from "./prompts.ts";
import type { Brand } from "./types.ts";

const brands: Brand[] = [
  { name: "Acme", domain: "acme.com", kind: "own_company" },
  { name: "Asana", domain: "asana.com", kind: "competitor" },
  { name: "ClickUp", domain: "clickup.com", kind: "competitor" },
  { name: "Trello", domain: "trello.com", kind: "competitor" },
];

// Mocked AI engine answer (stands in for the Grok / ChatGPT call).
const ANSWER = `Here are the best project management tools for remote teams:

1. **Asana** – Excellent for structured workflows. See https://asana.com/uses/remote-teams
2. **ClickUp** – Very flexible, though it has a steep learning curve.
3. Trello – simple boards; many teams compare it with Asana.

Acme is another option some teams mention.
Sources: https://www.g2.com/categories/project-management`;

Deno.test("extractCitations classifies context per brand", () => {
  const c = extractCitations(ANSWER, brands);
  const by = Object.fromEntries(c.map((x) => [x.brand_mentioned ?? x.domain, x]));
  assertEquals(by["Asana"].context, "recommended");
  assertEquals(by["Asana"].url, "https://asana.com/uses/remote-teams");
  assertEquals(by["ClickUp"].context, "warning");
  assertEquals(by["Trello"].context, "compared");
  assertEquals(by["Acme"].context, "neutral_mention");
  assertEquals(by["Acme"].needs_review, true);
  assertEquals(by["g2.com"].entity_type, "third_party_source");
  assert(!c.some((x) => x.domain === "asana.com" && x.entity_type === "third_party_source"));
});

Deno.test("brand names match whole words only", () => {
  const c = extractCitations("We tested Asanas and acmecorp tools.", brands);
  assertEquals(c.length, 0);
});

Deno.test("scorecard + metrics compute shares", () => {
  const rows = [
    { prompt_id: "p1", domain: "asana.com", entity_type: "competitor", context: "recommended" as const },
    { prompt_id: "p1", domain: "acme.com", entity_type: "own_company", context: "neutral_mention" as const },
    { prompt_id: "p2", domain: "acme.com", entity_type: "own_company", context: "recommended" as const },
    { prompt_id: "p2", domain: "asana.com", entity_type: "competitor", context: "recommended" as const },
  ];
  const m = metrics(scorecard(rows, brands));
  assertEquals(m.brand_citations_count, 2);
  assertEquals(m.brand_recommendation_count, 1);
  assertEquals(m.citation_share, 50);
  assertEquals(m.recommendation_share, 33.33);
  assertEquals(m.competitor_snapshot["asana.com"].recommendations, 2);
});

Deno.test("changeConfidence: big jump is significant, tiny sample is not", () => {
  assert(changeConfidence(5, 50, 20, 50) > 99);
  assert(changeConfidence(1, 5, 2, 5) < 60);
  assertEquals(changeConfidence(0, 0, 1, 1), 0);
});

Deno.test("detectGaps finds substitution, authority and coverage gaps with rank-weighted priority", () => {
  const gaps = detectGaps(
    [
      { prompt_id: "p1", text: "best pm tool", category: "problem_awareness", google_rank: 2, own: { mentioned: false, recommended: false }, competitors: [{ name: "Asana", mentioned: true, recommended: true }] },
      { prompt_id: "p2", text: "pm for agencies", category: "use_case", google_rank: null, own: { mentioned: true, recommended: false }, competitors: [{ name: "ClickUp", mentioned: true, recommended: true }] },
      { prompt_id: "p3", text: "a vs b", category: "comparison", google_rank: null, own: { mentioned: false, recommended: false }, competitors: [] },
      { prompt_id: "p4", text: "c vs d", category: "comparison", google_rank: null, own: { mentioned: false, recommended: false }, competitors: [] },
      { prompt_id: "p5", text: "all good", category: "feature", google_rank: 1, own: { mentioned: true, recommended: true }, competitors: [] },
    ],
    "Acme",
    "grok",
  );
  const types = gaps.map((g) => g.gap_type);
  assertEquals(gaps[0].gap_type, "substitution_gap");
  assertEquals(gaps[0].priority, "high"); // rank #2 (×3) × missing (×2) × (1+1 competitor)
  assert(gaps[0].description.includes("You rank #2"));
  assert(gaps[0].description.startsWith("Grok recommends Asana"));
  assert(types.includes("authority_gap"));
  assert(types.includes("coverage_gap"));
  assertEquals(types.filter((t) => t === "visibility_gap").length, 2);
  assert(!gaps.some((g) => g.prompt_id === "p5"));
});

Deno.test("content gaps: competitor-cited formats the site lacks", () => {
  const gaps = detectContentGaps(
    [
      { url: "https://asana.com/faq/remote", engine: "grok" },
      { url: "https://clickup.com/vs/asana", engine: "chatgpt" },
      { url: "https://clickup.com/customers/acme-inc", engine: "chatgpt" },
    ],
    ["https://acme.com/", "https://acme.com/vs/asana"],
    "Acme",
  );
  assertEquals(gaps.map((g) => g.gap_type).sort(), ["evidence_gap", "format_gap"]);
  const faq = gaps.find((g) => g.description.includes("FAQ"))!;
  assertEquals(faq.engines, ["grok"]);
  assert(faq.description.startsWith("Grok cites"));
});

Deno.test("parseSitemap reads <loc> entries", () => {
  assertEquals(parseSitemap("<urlset><url><loc> https://a.com/x </loc></url><url><loc>https://a.com/y</loc></url></urlset>"), ["https://a.com/x", "https://a.com/y"]);
});

Deno.test("recommend maps each gap to an evidence-backed action", () => {
  const [gap] = detectGaps([{ prompt_id: "p1", text: "best pm tool", category: "x", google_rank: null, own: { mentioned: false, recommended: false }, competitors: [{ name: "Asana", mentioned: true, recommended: true }] }], "Acme", "grok");
  const r = recommend(gap, "Acme");
  assertEquals(r.action_type, "create_content");
  assert(r.title.includes("best pm tool"));
  assertEquals(r.evidence, gap.description);
  assert(r.description.startsWith("Grok recommends competitors"));
  assert(recommend({ ...gap, engines: ["grok", "chatgpt"] }, "Acme").description.startsWith("Grok and ChatGPT recommend competitors"));
});

Deno.test("mergeEngineGaps: same gap on two engines becomes one, tagged with both, higher priority", () => {
  const fact = (recommended: boolean) => ({
    prompt_id: "p1", text: "best pm tool", category: "x", google_rank: null,
    own: { mentioned: false, recommended: false }, competitors: [{ name: "Asana", mentioned: recommended, recommended }],
  });
  const grok = detectGaps([fact(true)], "Acme", "grok");
  const chatgpt = detectGaps([fact(true)], "Acme", "chatgpt");
  const merged = mergeEngineGaps([...grok, ...chatgpt]);
  assertEquals(merged.length, 1);
  assertEquals(merged[0].engines.sort(), ["chatgpt", "grok"]);
  assertEquals(merged[0].priority_score, grok[0].priority_score + chatgpt[0].priority_score);
  // Different gap types on each engine stay separate.
  assertEquals(mergeEngineGaps([...grok, ...detectGaps([fact(false)], "Acme", "chatgpt")]).length, 2);
});

Deno.test("parsePrompts validates, dedupes and rejects bad categories", () => {
  const raw = JSON.stringify({
    prompts: [
      { text: "best CRM for startups", category: "problem_awareness" },
      { text: "Best CRM for startups ", category: "problem_awareness" },
      { text: "hi", category: "feature" },
      { text: "crm with slack integration", category: "made_up" },
      { text: "hubspot vs pipedrive for small teams", category: "comparison" },
    ],
  });
  assertEquals(parsePrompts(raw).map((p) => p.text), ["best CRM for startups", "hubspot vs pipedrive for small teams"]);
  assertEquals(parsePrompts("not json"), []);
});

Deno.test("prompt generation includes the onboarding goals", () => {
  const [, user] = promptGenerationMessages({ name: "Acme", domain: "acme.com", industry: "saas", products: "CRM", goals: "Reduce CAC — leads are too expensive", competitors: [] });
  assertEquals(JSON.parse(user.content).goals, "Reduce CAC — leads are too expensive");
});

Deno.test("planActive: trial or paid plan in the future", async () => {
  const { planActive } = await import("./runtime.ts");
  const now = Date.parse("2026-10-20T00:00:00Z");
  assert(planActive({ trial_ends_at: "2026-10-21T00:00:00Z", paid_until: null }, now)); // trial running
  assert(!planActive({ trial_ends_at: "2026-10-15T00:00:00Z", paid_until: null }, now)); // trial over, unpaid
  assert(planActive({ trial_ends_at: "2026-10-15T00:00:00Z", paid_until: "2026-11-15T00:00:00Z" }, now)); // paid
  assert(!planActive({ trial_ends_at: "2026-10-15T00:00:00Z", paid_until: "2026-10-16T00:00:00Z" }, now)); // paid period lapsed
});
