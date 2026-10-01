// Feature 1.1: build the prompt-generation request and validate the model's output.
import type { PromptCategory } from "./types.ts";

export const CATEGORIES: PromptCategory[] = ["problem_awareness", "comparison", "feature", "use_case", "competitive"];

export type CompanyProfile = {
  name: string;
  domain: string;
  industry: string;
  products: string;
  competitors: { name: string; domain: string }[];
};

export function promptGenerationMessages(c: CompanyProfile) {
  return [
    {
      role: "system" as const,
      content:
        "You generate realistic questions that potential buyers type into ChatGPT when researching products. " +
        'Return JSON: {"prompts":[{"text":string,"category":one of ' + CATEGORIES.join("|") + "}]}. " +
        "Write 50 unique prompts, roughly 10 per category. Natural phrasing, no brand name of the target company " +
        "except in comparison/competitive prompts. Each prompt under 150 characters.",
    },
    {
      role: "user" as const,
      content: JSON.stringify({
        company: c.name,
        website: c.domain,
        industry: c.industry,
        product: c.products,
        competitors: c.competitors.map((x) => `${x.name} (${x.domain})`),
      }),
    },
  ];
}

export function parsePrompts(raw: string): { text: string; category: PromptCategory }[] {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  const items = (data as { prompts?: unknown })?.prompts;
  if (!Array.isArray(items)) return [];

  const seen = new Set<string>();
  const out: { text: string; category: PromptCategory }[] = [];
  for (const it of items) {
    const text = typeof it?.text === "string" ? it.text.trim().replace(/\s+/g, " ") : "";
    const category = it?.category as PromptCategory;
    const key = text.toLowerCase();
    if (text.length < 8 || text.length > 200 || !CATEGORIES.includes(category) || seen.has(key)) continue;
    seen.add(key);
    out.push({ text, category });
    if (out.length === 60) break;
  }
  return out;
}
