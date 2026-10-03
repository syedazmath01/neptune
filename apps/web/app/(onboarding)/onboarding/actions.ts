"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runPipeline } from "@/lib/pipeline";
import { INDUSTRIES, nameFromDomain, normalizeDomain } from "@/lib/domain";

export type OnboardingState = { error?: string };

export async function createCompany(_: OnboardingState, formData: FormData): Promise<OnboardingState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const industry = String(formData.get("industry") ?? "");
  const product = String(formData.get("product") ?? "").trim().slice(0, 1000);
  const goal = String(formData.get("goal") ?? "").trim().slice(0, 200);
  const painPoint = String(formData.get("pain_point") ?? "").trim().slice(0, 1000);

  if (!name) return { error: "Company name is required." };
  if (!domain) return { error: "Enter a valid website domain, e.g. acme.com." };
  if (!INDUSTRIES.includes(industry as (typeof INDUSTRIES)[number])) return { error: "Choose an industry." };

  const rawCompetitors = formData.getAll("competitor").map((c) => String(c).trim()).filter(Boolean);
  const notADomain = rawCompetitors.find((c) => !normalizeDomain(c));
  if (notADomain) return { error: `"${notADomain.slice(0, 60)}" isn't a website address. Enter the competitor's domain, e.g. hubspot.com.` };
  const competitorDomains = rawCompetitors
    .map((c) => normalizeDomain(c))
    .filter((d): d is string => !!d && d !== domain);
  const uniqueCompetitors = [...new Set(competitorDomains)].slice(0, 5);
  if (uniqueCompetitors.length < 2) return { error: "Add at least 2 competitor domains." };

  const { data: company, error } = await supabase
    .from("companies")
    .insert({
      owner_id: user.id,
      name,
      domain,
      industry,
      products_services: product ? [product] : null,
      business_goals: [goal, painPoint].filter(Boolean).join(" — ") || null,
      onboarding_completed: true,
    })
    .select("id")
    .single();
  if (error || !company) {
    console.error("[onboarding] insert company:", error?.message);
    return { error: "Could not save your company. Please try again." };
  }

  const { error: compError } = await supabase.from("competitors").insert(
    uniqueCompetitors.map((d) => ({
      company_id: company.id,
      name: nameFromDomain(d),
      domain: d,
    })),
  );
  if (compError) return { error: "Saved your company, but competitors failed to save. Add them in Settings." };

  try {
    await runPipeline("generate-prompts", { company_id: company.id });
  } catch (e) {
    // Company is saved; Overview offers a "Run analysis" button to retry.
    console.error("[onboarding] could not start analysis:", e instanceof Error ? e.message : e);
  }
  redirect("/overview");
}
