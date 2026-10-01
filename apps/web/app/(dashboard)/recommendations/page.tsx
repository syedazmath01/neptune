import type { Metadata } from "next";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader, SeverityBadge, StatusBadge } from "@/components/dashboard/ui";
import { RecommendationActions } from "@/components/dashboard/RecommendationActions";
import type { RecStatus } from "@/lib/actions/recommendations";

export const metadata: Metadata = { title: "Recommendations" };

const IMPACT_ORDER = { high: 0, medium: 1, low: 2 } as const;
const STATUS_ORDER: Record<string, number> = { pending: 0, approved: 1, in_progress: 2, implemented: 3, skipped: 4, rejected: 5 };

export default async function RecommendationsPage() {
  const company = await requireCompany();
  const supabase = await createClient();
  const { data } = await supabase
    .from("recommendations")
    .select("id, title, description, implementation_example, evidence, expected_impact, time_estimate_hours, status, implemented_at, implementation_notes")
    .eq("company_id", company.id);

  const recs = (data ?? []).sort(
    (a, b) =>
      STATUS_ORDER[a.status ?? "pending"] - STATUS_ORDER[b.status ?? "pending"] ||
      IMPACT_ORDER[a.expected_impact as keyof typeof IMPACT_ORDER] - IMPACT_ORDER[b.expected_impact as keyof typeof IMPACT_ORDER],
  );

  return (
    <>
      <PageHeader title="Recommendations" subtitle="Evidence-backed actions ranked by expected impact. Approve, implement, and Neptune re-measures 14 days later." />
      {!recs.length ? (
        <EmptyState title="No recommendations yet" body="Recommendations are generated from your gaps once the first analysis completes." />
      ) : (
        <ul className="space-y-4">
          {recs.map((r) => (
            <li key={r.id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center gap-2">
                <SeverityBadge level={r.expected_impact as "high" | "medium" | "low"} />
                <StatusBadge status={r.status ?? "pending"} />
                {r.time_estimate_hours != null && <span className="text-xs text-muted">~{r.time_estimate_hours}h</span>}
              </div>
              <h2 className="mt-3 text-lg font-semibold text-ink">{r.title}</h2>
              <p className="mt-1 text-muted">{r.description}</p>
              {r.implementation_example && (
                <p className="mt-3 rounded-xl bg-cream-100 p-3 text-sm text-ink"><span className="font-semibold">How: </span>{r.implementation_example}</p>
              )}
              {r.evidence && <p className="mt-3 text-sm text-forest-700"><span className="font-semibold">Evidence: </span>{r.evidence}</p>}
              {r.status === "implemented" && r.implemented_at && (
                <p className="mt-3 text-sm text-muted">
                  Implemented {new Date(r.implemented_at).toLocaleDateString()} — re-measured automatically after 14 days.
                  {r.implementation_notes && ` Notes: ${r.implementation_notes}`}
                </p>
              )}
              <RecommendationActions id={r.id} status={(r.status ?? "pending") as RecStatus} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
