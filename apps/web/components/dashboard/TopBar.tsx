import { PRICE, planStatus, upgradeHref, type PlanFields } from "@/lib/plan";
import { ProfileMenu } from "./ProfileMenu";

/** Plan status + profile, above every dashboard page. A lapsed trial gets a full-width banner. */
export function TopBar({ company, name, email }: { company: PlanFields & { name: string }; name: string | null; email: string }) {
  const s = planStatus(company);

  return (
    <div className="print:hidden">
      <div className="mb-6 flex flex-wrap items-center justify-end gap-3">
        {s.paid ? (
          <span className="rounded-full bg-success/15 px-4 py-2 text-sm font-semibold text-success">{s.label}</span>
        ) : (
          s.active && (
            <>
              <span className="glass rounded-full px-4 py-2 text-sm text-ink">
                <span className="font-semibold">Free trial</span> · {s.trialDaysLeft} day{s.trialDaysLeft === 1 ? "" : "s"} left
              </span>
              <a href={upgradeHref(company.name)} className="inline-flex min-h-11 items-center rounded-full bg-terracotta-500 px-4 text-sm font-semibold text-white hover:bg-terracotta-600">
                Upgrade
              </a>
            </>
          )
        )}
        <ProfileMenu name={name} email={email} />
      </div>

      {!s.active && (
        <div className="mb-8 rounded-2xl border border-danger/30 bg-danger/10 p-5">
          <p className="font-semibold text-danger">Your free trial has ended — new analyses are paused.</p>
          <p className="mt-1 text-sm text-ink">Your results stay available. Choose a plan and we&apos;ll send you an invoice.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a href={upgradeHref(company.name, "monthly")} className="inline-flex min-h-11 items-center rounded-full bg-forest-800 px-5 text-sm font-semibold text-cream-50">
              Monthly · ${PRICE.monthly}/month
            </a>
            <a href={upgradeHref(company.name, "yearly")} className="glass inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold text-ink">
              Yearly · ${PRICE.yearly}/year (2 months free)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
