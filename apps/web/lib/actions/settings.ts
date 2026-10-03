"use server";

import { revalidatePath } from "next/cache";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { INDUSTRIES, nameFromDomain, normalizeDomain } from "@/lib/domain";

export type SettingsState = { error?: string; message?: string };

const MAX_COMPETITORS = 5;
const MIN_COMPETITORS = 2;

export async function updateCompany(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const company = await requireCompany();
  const name = String(formData.get("name") ?? "").trim().slice(0, 120);
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const industry = String(formData.get("industry") ?? "");
  const product = String(formData.get("product") ?? "").trim().slice(0, 1000);
  const goals = String(formData.get("goals") ?? "").trim().slice(0, 1200);

  if (!name) return { error: "Company name is required." };
  if (!domain) return { error: "Enter your website address, e.g. acme.com." };
  if (!INDUSTRIES.includes(industry as (typeof INDUSTRIES)[number])) return { error: "Choose an industry." };

  const supabase = await createClient();
  const { data: clash } = await supabase.from("competitors").select("id").eq("company_id", company.id).eq("domain", domain).maybeSingle();
  if (clash) return { error: `${domain} is one of your competitors — remove it below first.` };

  // RLS + column grants: users can only update these fields on their own company.
  const { error } = await supabase
    .from("companies")
    .update({ name, domain, industry, products_services: product ? [product] : null, business_goals: goals || null, updated_at: new Date().toISOString() })
    .eq("id", company.id);
  if (error) {
    console.error("[settings] update company:", error.message);
    return { error: "Couldn't save. Please try again." };
  }
  revalidatePath("/", "layout");
  return { message: "Saved. Changes apply from your next analysis." };
}

export async function addCompetitor(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const company = await requireCompany();
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  if (!domain) return { error: "Enter the competitor's website address, e.g. hubspot.com." };
  if (domain === company.domain) return { error: "That's your own website." };
  const name = String(formData.get("name") ?? "").trim().slice(0, 80) || nameFromDomain(domain);

  const supabase = await createClient();
  const { data: existing } = await supabase.from("competitors").select("domain").eq("company_id", company.id);
  if ((existing?.length ?? 0) >= MAX_COMPETITORS) return { error: `You can track up to ${MAX_COMPETITORS} competitors.` };
  if (existing?.some((c) => c.domain === domain)) return { error: `${domain} is already tracked.` };

  const { error } = await supabase.from("competitors").insert({ company_id: company.id, name, domain });
  if (error) {
    console.error("[settings] add competitor:", error.message);
    return { error: "Couldn't add the competitor. Please try again." };
  }
  revalidatePath("/", "layout");
  return { message: `Added ${name}. It's included from your next analysis.` };
}

export async function removeCompetitor(_: SettingsState, formData: FormData): Promise<SettingsState> {
  const company = await requireCompany();
  const id = String(formData.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/i.test(id)) return { error: "Invalid competitor." };

  const supabase = await createClient();
  const { count } = await supabase.from("competitors").select("id", { count: "exact", head: true }).eq("company_id", company.id);
  if ((count ?? 0) <= MIN_COMPETITORS) return { error: `Keep at least ${MIN_COMPETITORS} competitors — Neptune needs them to compare against.` };

  const { error } = await supabase.from("competitors").delete().eq("id", id).eq("company_id", company.id);
  if (error) {
    console.error("[settings] remove competitor:", error.message);
    return { error: "Couldn't remove the competitor. Please try again." };
  }
  revalidatePath("/", "layout");
  return { message: "Removed. Takes effect from your next analysis." };
}
