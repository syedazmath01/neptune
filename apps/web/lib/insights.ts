import "server-only";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type Run = {
  round_number: number;
  status: string;
  brand_citations_count: number | null;
  brand_recommendation_count: number | null;
  citation_share: number | null;
  recommendation_share: number | null;
  competitor_snapshot: Record<string, { name: string; citations: number; recommendations: number }> | null;
  confidence_level: number | null;
  started_at: string | null;
  completed_at: string | null;
};

export async function loadRuns(supabase: Supabase, companyId: string): Promise<Run[]> {
  const { data } = await supabase
    .from("measurement_runs")
    .select("round_number, status, brand_citations_count, brand_recommendation_count, citation_share, recommendation_share, competitor_snapshot, confidence_level, started_at, completed_at")
    .eq("company_id", companyId)
    .order("round_number", { ascending: true });
  return (data ?? []) as Run[];
}

export type PromptResult = {
  id: string;
  text: string;
  category: string;
  google_rank: number | null;
  answer: string | null;
  youMentioned: boolean;
  youRecommended: boolean;
  competitorsRecommended: string[];
  cited: { name: string; context: string }[];
};

type Row = {
  id: string;
  text: string;
  category: string;
  google_rank: number | null;
  responses: { full_text: string; citations: { brand_mentioned: string | null; entity_type: string; context: string | null }[] }[];
};

/** Per-prompt win/loss for one round — the evidence behind every metric (drill-down + CSV export). */
export async function loadBreakdown(supabase: Supabase, companyId: string, round: number): Promise<PromptResult[]> {
  const { data } = await supabase
    .from("prompts")
    .select("id, text, category, google_rank, responses(full_text, measurement_round, citations(brand_mentioned, entity_type, context))")
    .eq("company_id", companyId)
    .eq("active", true)
    .eq("responses.measurement_round", round)
    .order("category");

  return ((data ?? []) as Row[]).map((p) => {
    const r = p.responses[0];
    const brands = (r?.citations ?? []).filter((c) => c.brand_mentioned);
    const own = brands.filter((c) => c.entity_type === "own_company");
    return {
      id: p.id,
      text: p.text,
      category: p.category,
      google_rank: p.google_rank,
      answer: r?.full_text ?? null,
      youMentioned: own.length > 0,
      youRecommended: own.some((c) => c.context === "recommended"),
      competitorsRecommended: brands.filter((c) => c.entity_type === "competitor" && c.context === "recommended").map((c) => c.brand_mentioned!),
      cited: brands.map((c) => ({ name: c.brand_mentioned!, context: (c.context ?? "neutral_mention").replace("_", " ") })),
    };
  });
}
