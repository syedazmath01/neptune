import { CONTACT_EMAIL } from "@/lib/site";

// 14-day free trial, then monthly or yearly. Billing is manual (invoice) until online checkout exists;
// after payment, set companies.plan + paid_until in Supabase's Table Editor.
export const TRIAL_DAYS = 14;
export const PRICE = { monthly: 29, yearly: 290 } as const;
const DAY = 86_400_000;

export type PlanFields = { plan: string; trial_ends_at: string; paid_until: string | null };

/** Mirrors planActive() in supabase/functions/_shared/runtime.ts — the pipeline enforces the same rule. */
export function planStatus(c: PlanFields, now = Date.now()) {
  const paid = c.paid_until != null && Date.parse(c.paid_until) > now;
  const msLeft = Date.parse(c.trial_ends_at) - now;
  return {
    paid,
    label: paid ? (c.plan === "yearly" ? "Yearly plan" : "Monthly plan") : "Free trial",
    active: paid || msLeft > 0,
    trialDaysLeft: Math.max(0, Math.ceil(msLeft / DAY)),
  };
}

export function upgradeHref(companyName: string, interval?: "monthly" | "yearly") {
  const plan = interval ? `${interval} plan ($${PRICE[interval]}/${interval === "monthly" ? "month" : "year"})` : "monthly or yearly plan";
  const subject = `Upgrade Neptune — ${companyName}`;
  const body = `Hi Neptune team,\n\nI'd like to continue with the ${plan} for ${companyName}. Please send me the invoice.\n\nThanks!`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
