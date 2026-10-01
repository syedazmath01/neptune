import type { Metadata } from "next";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { loadRuns } from "@/lib/insights";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { TrendChart } from "@/components/dashboard/Charts";

export const metadata: Metadata = { title: "Results" };

function delta(before: number | null, after: number | null) {
  if (before == null || after == null || before === 0) return null;
  return ((after - before) / before) * 100;
}

export default async function ResultsPage() {
  const company = await requireCompany();
  const supabase = await createClient();
  const [runs, { data: implemented }] = await Promise.all([
    loadRuns(supabase, company.id),
    supabase.from("recommendations").select("id, title, implemented_at").eq("company_id", company.id).eq("status", "implemented").order("implemented_at"),
  ]);

  const done = runs.filter((r) => r.status === "completed");
  const baseline = done[0];
  const latest = done.length > 1 ? done[done.length - 1] : undefined;

  // For each implemented action: first completed round that started after it went live.
  const measured = (implemented ?? []).map((rec) => {
    const after = done.find((r) => r.started_at && rec.implemented_at && Date.parse(r.started_at) > Date.parse(rec.implemented_at));
    return { ...rec, after };
  });

  return (
    <>
      <PageHeader title="Results" subtitle="Before/after proof that your changes moved AI visibility." />
      {!baseline || !latest ? (
        <EmptyState
          title="Results need two measurement rounds"
          body="After you implement a recommendation, Neptune re-runs the same prompts about 2 weeks later and shows the before/after change here."
        />
      ) : (
        <>
          <section className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-ink">Share of AI answers over time</h2>
            <div className="mt-4">
              <TrendChart
                data={done.map((r) => ({ round: r.round_number === 1 ? "Baseline" : `Round ${r.round_number}`, citation: Number(r.citation_share ?? 0), recommendation: Number(r.recommendation_share ?? 0) }))}
              />
            </div>
          </section>

          <div className="glass mt-6 overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[520px] text-left">
              <thead className="border-b border-line text-sm text-muted">
                <tr>
                  <th className="p-4 font-medium">Metric</th>
                  <th className="p-4 font-medium">Baseline</th>
                  <th className="p-4 font-medium">Latest (round {latest.round_number})</th>
                  <th className="p-4 font-medium">Change</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["Brand mentions", baseline.brand_citations_count, latest.brand_citations_count],
                    ["Recommendations", baseline.brand_recommendation_count, latest.brand_recommendation_count],
                    ["Citation share (%)", baseline.citation_share, latest.citation_share],
                    ["Recommendation share (%)", baseline.recommendation_share, latest.recommendation_share],
                  ] as const
                ).map(([label, b, a]) => {
                  const d = delta(b == null ? null : Number(b), a == null ? null : Number(a));
                  return (
                    <tr key={label} className="border-b border-line last:border-0">
                      <td className="p-4 font-medium">{label}</td>
                      <td className="p-4">{b ?? "—"}</td>
                      <td className="p-4">{a ?? "—"}</td>
                      <td className={`p-4 font-semibold ${d == null ? "text-muted" : d >= 0 ? "text-success" : "text-danger"}`}>
                        {d == null ? "—" : `${d >= 0 ? "+" : ""}${d.toFixed(0)}%`}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {latest.confidence_level != null && (
              <p className="border-t border-line p-4 text-sm text-muted">
                Statistical confidence that the recommendation change is real: <span className="font-semibold text-ink">{Number(latest.confidence_level).toFixed(0)}%</span>
                {Number(latest.confidence_level) < 80 && " — treat as directional until more rounds are measured."}
              </p>
            )}
          </div>

          {measured.length > 0 && (
            <section className="glass mt-6 rounded-2xl p-5">
              <h2 className="font-semibold text-ink">Implemented actions</h2>
              <ul className="mt-3 divide-y divide-line">
                {measured.map((m) => (
                  <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                    <span className="text-ink">{m.title}</span>
                    <span className="text-muted">
                      {m.after
                        ? `Measured in round ${m.after.round_number}: recommendation share ${Number(m.after.recommendation_share ?? 0)}% (baseline ${Number(baseline.recommendation_share ?? 0)}%)`
                        : "Awaiting re-measurement"}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </>
  );
}
