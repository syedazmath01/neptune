export type EntityType = "own_company" | "competitor" | "third_party_source";
export type Context = "recommended" | "compared" | "alternative" | "warning" | "neutral_mention";
export type Priority = "high" | "medium" | "low";
export type PromptCategory = "problem_awareness" | "comparison" | "feature" | "use_case" | "competitive";

export const ENGINES = ["grok", "chatgpt"] as const;
export type Engine = (typeof ENGINES)[number];
const LABEL: Record<Engine, string> = { grok: "Grok", chatgpt: "ChatGPT" };
export const list = (names: string[]) => (names.length <= 2 ? names.join(" and ") : `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`);
/** "Grok", "Grok and ChatGPT"; falls back to a neutral phrase. */
export const engineNames = (es: Engine[]) => (es.length ? list(es.map((e) => LABEL[e])) : "AI assistants");

export type Brand = { name: string; domain: string; kind: "own_company" | "competitor" };

export type ExtractedCitation = {
  domain: string;
  url: string | null;
  brand_mentioned: string | null;
  entity_type: EntityType;
  context: Context;
  confidence_score: number;
  needs_review: boolean;
};

export type GapType =
  | "visibility_gap"
  | "substitution_gap"
  | "authority_gap"
  | "coverage_gap"
  | "format_gap"
  | "evidence_gap"
  | "tone_gap"
  | "social_proof_gap";

export type Gap = {
  prompt_id: string | null;
  gap_type: GapType;
  description: string;
  google_rank: number | null;
  competitor_citation_count: number;
  own_citation_count: number;
  priority: Priority;
  priority_score: number;
  engines: Engine[];
};
