import "server-only";
import type { createClient } from "@/lib/supabase/server";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export const ENGINES = ["grok", "chatgpt"] as const;
export type Engine = (typeof ENGINES)[number];
export const ENGINE_LABEL: Record<Engine, string> = { grok: "Grok", chatgpt: "ChatGPT" };

type Metrics = {
  brand_citations_count: number | null;
  brand_recommendation_count: number | null;
  citation_share: number | null;
  recommendation_share: number | null;
  competitor_snapshot: Record<string, { name: string; citations: number; recommendations: number }> | null;
  confidence_level: number | null;
  /** Answers collected from this engine in the round. */
  answers: number | null;
};

export type Run = Metrics & {
  round_number: number;
  status: string;
  started_at: string | null;
  completed_at: string | null;
  /** This round has results for the selected engine. */
  measured: boolean;
};

const NO_METRICS: Metrics = {
  brand_citations_count: null,
  brand_recommendation_count: null,
  citation_share: null,
  recommendation_share: null,
  competitor_snapshot: null,
  confidence_level: null,
  answers: null,
};

const pct = (part: number | null, whole: number | null) => (whole ? Math.round(((part ?? 0) / whole) * 1000) / 10 : null);
/** % of the round's answers that mention you — the headline "AI visibility" number. */
export const visibility = (r: Run) => pct(r.brand_citations_count, r.answers);
/** % of the round's answers that recommend you. */
export const recommendedRate = (r: Run) => pct(r.brand_recommendation_count, r.answers);

/** Runs carrying one engine's metrics (engines are never mixed), plus the engines that have data. */
export async function loadRuns(supabase: Supabase, companyId: string, requested?: string): Promise<{ runs: Run[]; engine: Engine; engines: Engine[] }> {
  const { data } = await supabase
    .from("measurement_runs")
    .select("round_number, status, started_at, completed_at, engine_metrics")
    .eq("company_id", companyId)
    .order("round_number", { ascending: true });
  const raw = (data ?? []) as (Omit<Run, keyof Metrics | "measured"> & { engine_metrics: Partial<Record<Engine, Metrics>> | null })[];

  const engines = ENGINES.filter((e) => raw.some((r) => r.engine_metrics?.[e]));
  const engine = engines.find((e) => e === requested) ?? engines[0] ?? ENGINES[0];
  const runs = raw.map(({ engine_metrics, ...r }) => {
    const m = engine_metrics?.[engine];
    return { ...r, ...NO_METRICS, ...m, measured: !!m };
  });
  return { runs, engine, engines };
}

export type Cited = { name: string; kind: "you" | "competitor"; context: string };

export type PromptResult = {
  id: string;
  text: string;
  category: string;
  google_rank: number | null;
  /** This engine answered the question in the round. */
  answered: boolean;
  answer: string | null;
  youMentioned: boolean;
  youRecommended: boolean;
  competitorsMentioned: string[];
  competitorsRecommended: string[];
  cited: Cited[];
  /** Third-party websites the answer linked to. */
  sources: string[];
};

type Row = {
  id: string;
  text: string;
  category: string;
  google_rank: number | null;
  responses: {
    full_text: string;
    engine: string;
    citations: { brand_mentioned: string | null; entity_type: string; context: string | null; domain: string }[];
  }[];
};

const uniq = (xs: string[]) => [...new Set(xs)];

/** Per-prompt win/loss for one round — the evidence behind every metric (drill-downs + CSV export). */
export async function loadBreakdown(supabase: Supabase, companyId: string, round: number, engine: Engine): Promise<PromptResult[]> {
  const { data } = await supabase
    .from("prompts")
    .select("id, text, category, google_rank, responses(full_text, measurement_round, engine, citations(brand_mentioned, entity_type, context, domain))")
    .eq("company_id", companyId)
    .eq("active", true)
    .eq("responses.measurement_round", round)
    .eq("responses.engine", engine)
    .order("category");

  return ((data ?? []) as Row[]).map((p) => {
    const r = p.responses[0];
    const cs = r?.citations ?? [];
    const brands = cs.filter((c) => c.brand_mentioned && c.entity_type !== "third_party_source");
    const own = brands.filter((c) => c.entity_type === "own_company");
    const rivals = brands.filter((c) => c.entity_type === "competitor");
    return {
      id: p.id,
      text: p.text,
      category: p.category,
      google_rank: p.google_rank,
      answered: !!r,
      answer: r?.full_text ?? null,
      youMentioned: own.length > 0,
      youRecommended: own.some((c) => c.context === "recommended"),
      competitorsMentioned: uniq(rivals.map((c) => c.brand_mentioned!)),
      competitorsRecommended: uniq(rivals.filter((c) => c.context === "recommended").map((c) => c.brand_mentioned!)),
      cited: brands.map((c) => ({
        name: c.brand_mentioned!,
        kind: c.entity_type === "own_company" ? ("you" as const) : ("competitor" as const),
        context: (c.context ?? "neutral_mention").replace("_", " "),
      })),
      sources: uniq(cs.filter((c) => c.entity_type === "third_party_source").map((c) => c.domain)),
    };
  });
}

/** Latest measured round for the chosen engine, plus its per-question breakdown. */
export async function loadLatest(supabase: Supabase, companyId: string, requestedEngine?: string) {
  const { runs, engine, engines } = await loadRuns(supabase, companyId, requestedEngine);
  const measured = runs.filter((r) => r.status === "completed" && r.measured);
  const last = measured.at(-1);
  const breakdown = last ? await loadBreakdown(supabase, companyId, last.round_number, engine) : [];
  return { runs, measured, last, engine, engines, breakdown };
}

export type Mention = { name: string; kind: "you" | "competitor" | "source"; answers: number; recommended: number };

/** Brands and websites ranked by how many answers mention them (each answer counts once per name). */
export function mentionTotals(rows: PromptResult[]): Mention[] {
  const totals = new Map<string, Mention>();
  const add = (name: string, kind: Mention["kind"], recommended: boolean) => {
    const key = `${kind}:${name.toLowerCase()}`;
    const t = totals.get(key) ?? { name, kind, answers: 0, recommended: 0 };
    t.answers++;
    if (recommended) t.recommended++;
    totals.set(key, t);
  };
  for (const p of rows) {
    const brands = new Map<string, { kind: Cited["kind"]; recommended: boolean }>();
    for (const c of p.cited) {
      const prev = brands.get(c.name);
      brands.set(c.name, { kind: c.kind, recommended: (prev?.recommended ?? false) || c.context === "recommended" });
    }
    for (const [name, b] of brands) add(name, b.kind, b.recommended);
    for (const d of p.sources) add(d, "source", false);
  }
  return [...totals.values()].sort((a, b) => b.answers - a.answers || b.recommended - a.recommended);
}
