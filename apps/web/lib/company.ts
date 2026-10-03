import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return user;
});

export const getCurrentCompany = cache(async () => {
  await getUser();
  const supabase = await createClient();
  const { data } = await supabase
    .from("companies")
    .select("id, name, domain, industry, products_services, business_goals, onboarding_completed, created_at, plan, trial_ends_at, paid_until")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  return data;
});

export async function requireCompany() {
  const company = await getCurrentCompany();
  if (!company) redirect("/onboarding");
  return company;
}
