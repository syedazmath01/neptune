// Feature 1.4 + 3.1: visibility scorecard and measurement metrics for one round.
import type { Brand, Context } from "./types.ts";

export type CitationRow = { prompt_id: string; domain: string; entity_type: string; context: Context | null };

export type Card = { name: string; domain: string; kind: Brand["kind"]; citations: number; recommendations: number };

export function scorecard(rows: CitationRow[], brands: Brand[]): Card[] {
  return brands.map((b) => {
    const mine = rows.filter((r) => r.domain === b.domain && r.entity_type === b.kind);
    const prompts = new Set(mine.map((r) => r.prompt_id));
    const recommended = new Set(mine.filter((r) => r.context === "recommended").map((r) => r.prompt_id));
    return { name: b.name, domain: b.domain, kind: b.kind, citations: prompts.size, recommendations: recommended.size };
  });
}

const pct = (part: number, total: number) => (total ? Math.round((part / total) * 10000) / 100 : 0);

export function metrics(cards: Card[]) {
  const own = cards.find((c) => c.kind === "own_company");
  const totalCitations = cards.reduce((s, c) => s + c.citations, 0);
  const totalRecs = cards.reduce((s, c) => s + c.recommendations, 0);
  return {
    brand_citations_count: own?.citations ?? 0,
    brand_recommendation_count: own?.recommendations ?? 0,
    citation_share: pct(own?.citations ?? 0, totalCitations),
    recommendation_share: pct(own?.recommendations ?? 0, totalRecs),
    competitor_snapshot: Object.fromEntries(
      cards
        .filter((c) => c.kind === "competitor")
        .map((c) => [c.domain, { name: c.name, citations: c.citations, recommendations: c.recommendations }]),
    ),
  };
}

// Abramowitz-Stegun erf approximation (|error| < 1.5e-7) — enough for a confidence readout.
function erf(x: number) {
  const s = Math.sign(x);
  x = Math.abs(x);
  const t = 1 / (1 + 0.3275911 * x);
  const y = 1 - ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return s * y;
}

/** Two-proportion z-test: % confidence that rate x2/n2 differs from baseline x1/n1. */
export function changeConfidence(x1: number, n1: number, x2: number, n2: number): number {
  if (!n1 || !n2) return 0;
  const p = (x1 + x2) / (n1 + n2);
  const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));
  if (!se) return 0;
  const z = Math.abs(x2 / n2 - x1 / n1) / se;
  return Math.round(erf(z / Math.SQRT2) * 10000) / 100;
}
