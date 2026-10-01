"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { runPipeline } from "@/lib/pipeline";

export type OnboardingState = { error?: string };

const INDUSTRIES = ["saas", "professional_services", "ecommerce", "other"] as const;

function normalizeDomain(raw: string) {
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
    const host = url.hostname.replace(/^www\./, "");
    return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(host) ? host : null;
  } catch {
    return null;
  }
}

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

  const competitorDomains = formData
    .getAll("competitor")
    .map((c) => normalizeDomain(String(c)))
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
  if (error || !company) return { error: "Could not save your company. Please try again." };

  const { error: compError } = await supabase.from("competitors").insert(
    uniqueCompetitors.map((d) => ({
      company_id: company.id,
      name: d.split(".")[0].replace(/^\w/, (c) => c.toUpperCase()),
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
