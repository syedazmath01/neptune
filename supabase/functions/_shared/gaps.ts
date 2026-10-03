// Feature 1.5 (AI visibility gaps) + 1.6 (content gaps).
import { engineNames, list, type Engine, type Gap, type Priority } from "./types.ts";

export type PromptFacts = {
  prompt_id: string;
  text: string;
  category: string;
  google_rank: number | null;
  own: { mentioned: boolean; recommended: boolean };
  competitors: { name: string; mentioned: boolean; recommended: boolean }[];
};

function rankWeight(rank: number | null) {
  if (rank == null) return 1;
  if (rank <= 3) return 3;
  if (rank <= 10) return 2;
  if (rank <= 20) return 1.5;
  return 1;
}

function priorityOf(score: number): Priority {
  return score >= 6 ? "high" : score >= 3 ? "medium" : "low";
}

/** Gaps in one engine's answers. Merge engines with mergeEngineGaps. */
export function detectGaps(facts: PromptFacts[], companyName: string, engine: Engine): Gap[] {
  const gaps: Gap[] = [];
  const ai = engineNames([engine]);

  for (const f of facts) {
    const recommended = f.competitors.filter((c) => c.recommended).map((c) => c.name);
    const mentionedCount = f.competitors.filter((c) => c.mentioned).length;
    const rankNote = f.google_rank != null ? ` You rank #${f.google_rank} on Google for this.` : "";
    const base = {
      prompt_id: f.prompt_id,
      google_rank: f.google_rank,
      competitor_citation_count: mentionedCount,
      own_citation_count: f.own.mentioned ? 1 : 0,
      engines: [engine],
    };

    // PRD scoring intent: (google strength × missing AI mention) scaled by competitor wins.
    if (!f.own.mentioned) {
      const score = rankWeight(f.google_rank) * 2 * (1 + recommended.length);
      gaps.push({
        ...base,
        gap_type: recommended.length ? "substitution_gap" : "visibility_gap",
        description: recommended.length
          ? `${ai} recommends ${list(recommended)} for "${f.text}" — ${companyName} isn't mentioned.${rankNote}`
          : `${companyName} doesn't appear in ${ai}'s answer to "${f.text}".${rankNote}`,
        priority: priorityOf(score),
        priority_score: score,
      });
    } else if (!f.own.recommended && recommended.length) {
      const score = rankWeight(f.google_rank) * (1 + recommended.length);
      gaps.push({
        ...base,
        gap_type: "authority_gap",
        description: `${companyName} is mentioned for "${f.text}", but ${ai} recommends ${list(recommended)} instead.`,
        priority: priorityOf(score),
        priority_score: score,
      });
    }
  }

  // Coverage: whole intent categories where the brand never appears.
  const byCategory = new Map<string, PromptFacts[]>();
  for (const f of facts) byCategory.set(f.category, [...(byCategory.get(f.category) ?? []), f]);
  for (const [category, fs] of byCategory) {
    if (fs.length < 2 || fs.some((f) => f.own.mentioned)) continue;
    const score = fs.length;
    gaps.push({
      prompt_id: null,
      gap_type: "coverage_gap",
      description: `${companyName} is absent from all ${fs.length} "${category.replace(/_/g, " ")}" questions ${ai} was asked.`,
      google_rank: null,
      competitor_citation_count: fs.reduce((s, f) => s + f.competitors.filter((c) => c.mentioned).length, 0),
      own_citation_count: 0,
      priority: priorityOf(score),
      priority_score: score,
      engines: [engine],
    });
  }

  return gaps.sort((a, b) => b.priority_score - a.priority_score);
}

/** Same gap on several engines -> one gap tagged with all of them; priorities add up. */
export function mergeEngineGaps(gaps: Gap[]): Gap[] {
  const byKey = new Map<string, Gap>();
  // Quoted text = the prompt (or category for coverage gaps), so it identifies the gap across engines.
  for (const g of [...gaps].sort((a, b) => b.priority_score - a.priority_score)) {
    const key = `${g.gap_type}|${g.prompt_id}|${g.description.match(/"([^"]+)"/)?.[1]}`;
    const prev = byKey.get(key);
    if (!prev) byKey.set(key, { ...g });
    else {
      prev.engines = [...new Set([...prev.engines, ...g.engines])];
      prev.priority_score += g.priority_score;
      prev.priority = priorityOf(prev.priority_score);
    }
  }
  return [...byKey.values()].sort((a, b) => b.priority_score - a.priority_score);
}

// --- Feature 1.6: content-format gaps (competitor-cited page types your site lacks) ---

const CONTENT_TYPES = [
  { label: "FAQ", gap_type: "format_gap", re: /\/(faqs?|questions|help)(\/|$|-)/i },
  { label: "comparison", gap_type: "format_gap", re: /\/(vs|versus|compare|comparison|alternatives?)(\/|$|-)|-vs-/i },
  { label: "guide", gap_type: "format_gap", re: /\/(guides?|how-to|learn|academy)(\/|$|-)/i },
  { label: "case study", gap_type: "evidence_gap", re: /\/(case-stud(y|ies)|customers?|success-stories)(\/|$|-)/i },
  { label: "pricing", gap_type: "evidence_gap", re: /\/pricing(\/|$|-)/i },
  { label: "reviews", gap_type: "social_proof_gap", re: /\/(reviews?|testimonials?|wall-of-love)(\/|$|-)/i },
] as const;

export function detectContentGaps(competitorUrls: { url: string; engine: Engine }[], ownUrls: string[], companyName: string): Gap[] {
  const gaps: Gap[] = [];
  for (const t of CONTENT_TYPES) {
    const hits = competitorUrls.filter((c) => t.re.test(c.url));
    if (!hits.length || ownUrls.some((u) => t.re.test(u))) continue;
    const cited = hits.map((c) => c.url);
    const engines = [...new Set(hits.map((c) => c.engine))];
    const score = cited.length;
    gaps.push({
      prompt_id: null,
      gap_type: t.gap_type,
      description: `${engineNames(engines)} ${engines.length > 1 ? "cite" : "cites"} competitor ${t.label} pages ${cited.length}× (e.g. ${cited[0]}), but ${companyName}'s site has no ${t.label} page.`,
      google_rank: null,
      competitor_citation_count: cited.length,
      own_citation_count: 0,
      priority: score >= 5 ? "high" : score >= 2 ? "medium" : "low",
      priority_score: score,
      engines,
    });
  }
  return gaps;
}

/** Pull <loc> URLs out of a sitemap / sitemap index. */
export function parseSitemap(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
}
