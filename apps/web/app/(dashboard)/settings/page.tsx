import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { getUser, requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { PRICE, planStatus, upgradeHref } from "@/lib/plan";
import { logout } from "@/app/(auth)/actions";
import { PageHeader } from "@/components/dashboard/ui";
import { CompanyForm, CompetitorsEditor } from "@/components/dashboard/SettingsForms";

export const metadata: Metadata = { title: "Settings" };

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

export default async function SettingsPage() {
  const [company, user] = await Promise.all([requireCompany(), getUser()]);
  const supabase = await createClient();
  const { data: competitors } = await supabase.from("competitors").select("id, name, domain").eq("company_id", company.id).order("created_at");
  const s = planStatus(company);

  return (
    <>
      <PageHeader title="Settings" subtitle="Your account, plan, company details and the competitors Neptune compares you with." />

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-ink">Account</h2>
          <dl className="mt-4 space-y-3">
            <div><dt className="text-sm text-muted">Name</dt><dd className="font-medium text-ink">{(user.user_metadata?.full_name as string | undefined) || "—"}</dd></div>
            <div><dt className="text-sm text-muted">Email</dt><dd className="break-all font-medium text-ink">{user.email}</dd></div>
          </dl>
          <form action={logout} className="mt-5">
            <button className="glass inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-semibold text-ink">
              <LogOut size={16} /> Sign out
            </button>
          </form>
        </section>

        <section className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-ink">Plan</h2>
          <p className="mt-3 text-2xl font-semibold text-ink">{s.label}</p>
          <p className="mt-1 text-sm text-muted">
            {s.paid && company.paid_until
              ? `Paid until ${fmt(company.paid_until)}.`
              : s.active
                ? `${s.trialDaysLeft} day${s.trialDaysLeft === 1 ? "" : "s"} left — your trial ends ${fmt(company.trial_ends_at)}.`
                : "Your trial has ended. New analyses are paused until you choose a plan; your results stay available."}
          </p>
          {!s.paid && (
            <>
              <div className="mt-4 flex flex-wrap gap-2">
                <a href={upgradeHref(company.name, "monthly")} className="inline-flex min-h-11 items-center rounded-full bg-forest-800 px-5 text-sm font-semibold text-cream-50 hover:bg-forest-700">
                  Monthly · ${PRICE.monthly}/month
                </a>
                <a href={upgradeHref(company.name, "yearly")} className="glass inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-ink">
                  Yearly · ${PRICE.yearly}/year · 2 months free
                </a>
              </div>
              <p className="mt-3 text-xs text-muted">Choosing a plan emails us; we reply with an invoice and your plan is active as soon as it&apos;s paid.</p>
            </>
          )}
        </section>
      </div>

      <CompanyForm company={company} />
      <CompetitorsEditor competitors={competitors ?? []} />
    </>
  );
}
