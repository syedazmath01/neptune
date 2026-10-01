// Feature 1.3: rule-based citation extraction. AI response text is untrusted data:
// it is only pattern-matched here, never sent back to an LLM.
import type { Brand, Context, ExtractedCitation } from "./types.ts";

const URL_RE = /https?:\/\/[^\s)\]>"'`]+/gi;

// First match wins, so a caveat ("X is great but expensive") is flagged as a warning.
const CONTEXT_RULES: [Context, RegExp, number][] = [
  ["warning", /\b(avoid|downsides?|drawbacks?|lacks?|limited|pricey|expensive|not (?:recommended|ideal)|complain\w*|steep learning curve)\b/i, 0.85],
  ["recommended", /\b(recommend\w*|best|top pick|top choice|great choice|ideal|excellent|stands? out|leading|go-to)\b/i, 0.85],
  ["alternative", /\b(alternatives?|instead of|other options?|consider also)\b/i, 0.8],
  ["compared", /\b(vs\.?|versus|compared?|comparison|than)\b/i, 0.8],
];

const LIST_ITEM_RE = /^\s*(?:\d+[.)]|[-*•])\s+/;

export function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname.toLowerCase().replace(/^www\./, "");
  } catch {
    return null;
  }
}

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function brandMatcher(b: Brand): RegExp {
  const alts = [escapeRe(b.name.trim()), escapeRe(b.domain)].filter(Boolean);
  return new RegExp(`(?<![\\w.])(?:${alts.join("|")})(?![\\w])`, "i");
}

function segments(text: string): { text: string; listItem: boolean }[] {
  return text
    .split(/\n+/)
    .flatMap((line) => {
      const listItem = LIST_ITEM_RE.test(line);
      return line
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim())
        .map((s) => ({ text: s, listItem }));
    });
}

function classify(sentence: string, listItem: boolean): { context: Context; confidence: number } {
  for (const [context, re, confidence] of CONTEXT_RULES) {
    if (re.test(sentence)) return { context, confidence };
  }
  // Brands listed as items in an answer to a "best X" question are de-facto recommendations.
  if (listItem) return { context: "recommended", confidence: 0.7 };
  return { context: "neutral_mention", confidence: 0.6 };
}

const STRENGTH: Record<Context, number> = { warning: 4, recommended: 3, alternative: 2, compared: 1, neutral_mention: 0 };

export function extractCitations(text: string, brands: Brand[]): ExtractedCitation[] {
  const segs = segments(text);
  const out: ExtractedCitation[] = [];
  const brandDomains = new Set(brands.map((b) => b.domain));

  for (const brand of brands) {
    const re = brandMatcher(brand);
    let best: { context: Context; confidence: number } | null = null;
    let url: string | null = null;
    for (const seg of segs) {
      if (!re.test(seg.text)) continue;
      const c = classify(seg.text, seg.listItem);
      if (!best || STRENGTH[c.context] > STRENGTH[best.context]) best = c;
      url ??= (seg.text.match(URL_RE) ?? []).find((u) => domainOf(u)?.endsWith(brand.domain)) ?? null;
    }
    if (best) {
      out.push({
        domain: brand.domain,
        url,
        brand_mentioned: brand.name,
        entity_type: brand.kind,
        context: best.context,
        confidence_score: best.confidence,
        needs_review: best.confidence < 0.7,
      });
    }
  }

  // Third-party sources: any cited URL not belonging to a tracked brand.
  const seen = new Set<string>();
  for (const url of text.match(URL_RE) ?? []) {
    const d = domainOf(url);
    if (!d || seen.has(d) || [...brandDomains].some((bd) => d === bd || d.endsWith("." + bd))) continue;
    seen.add(d);
    out.push({
      domain: d,
      url,
      brand_mentioned: null,
      entity_type: "third_party_source",
      context: "neutral_mention",
      confidence_score: 0.9,
      needs_review: false,
    });
  }
  return out;
}

export function extractUrls(text: string): string[] {
  return [...new Set(text.match(URL_RE) ?? [])];
}
