// Feature 2.1: gap -> actionable recommendation. Deterministic templates (ML-based
// generation is out of MVP scope per prd.md Section 6). Only our own structured data
// is interpolated — never raw AI response text.
import { engineNames, type Gap } from "./types.ts";

export type Recommendation = {
  action_type: "create_content" | "optimize_existing" | "authority_building" | "internal_linking";
  title: string;
  description: string;
  implementation_example: string;
  evidence: string;
  expected_impact: Gap["priority"];
  time_estimate_hours: number;
};

const quoted = (d: string) => d.match(/"([^"]+)"/)?.[1] ?? "this question";

export function recommend(gap: Gap, companyName: string): Recommendation {
  const q = quoted(gap.description);
  const base = { evidence: gap.description, expected_impact: gap.priority };
  const ai = engineNames(gap.engines);
  const one = gap.engines.length === 1;

  switch (gap.gap_type) {
    case "substitution_gap":
      return {
        ...base,
        action_type: "create_content",
        title: `Publish a page that directly answers "${q}"`,
        description: `${ai} ${one ? "recommends" : "recommend"} competitors here and ${one ? "skips" : "skip"} you. A focused page with a clear comparison gives ${one ? "it" : "them"} a reason to include you.`,
        implementation_example: `Create a "${companyName} vs alternatives" page targeting "${q}": a feature comparison table, pricing, and 2–3 customer results with numbers.`,
        time_estimate_hours: 6,
      };
    case "visibility_gap":
      return {
        ...base,
        action_type: "create_content",
        title: `Answer "${q}" on your site`,
        description: `No brand clearly owns this answer yet, so ${companyName} can be first with a direct, specific answer.`,
        implementation_example: `Add an FAQ entry or short guide whose heading is "${q}" and whose first paragraph answers it in 2–3 sentences, with FAQPage structured data.`,
        time_estimate_hours: 3,
      };
    case "authority_gap":
      return {
        ...base,
        action_type: "authority_building",
        title: `Turn mentions into recommendations for "${q}"`,
        description: `${ai} ${one ? "knows" : "know"} you but ${one ? "trusts" : "trust"} competitors more. Add third-party proof and concrete evidence.`,
        implementation_example: "Publish a case study with measurable outcomes, and get listed on 2–3 independent review or comparison sites in your category.",
        time_estimate_hours: 8,
      };
    case "coverage_gap":
      return {
        ...base,
        action_type: "create_content",
        title: "Cover a missing question category",
        description: "You're absent from a whole type of customer question.",
        implementation_example: `Write a use-case guide and link it from your homepage so ${companyName} is associated with this category.`,
        time_estimate_hours: 6,
      };
    case "social_proof_gap":
      return {
        ...base,
        action_type: "authority_building",
        title: "Add a reviews / testimonials page",
        description: `${ai} ${one ? "cites" : "cite"} competitor review pages; you have none ${one ? "it" : "they"} can cite.`,
        implementation_example: "Create a /customers page with named, attributable customer quotes and links to your profiles on review sites.",
        time_estimate_hours: 4,
      };
    default:
      return {
        ...base,
        action_type: "optimize_existing",
        title: `Add the page type competitors get cited for`,
        description: "Competitors are cited for a content format your site doesn't have.",
        implementation_example: `Create the missing page (see evidence), link it from your main navigation, and include specific numbers ${ai} can quote.`,
        time_estimate_hours: 4,
      };
  }
}
