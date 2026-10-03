import type { Metadata } from "next";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { ENGINE_LABEL, loadRuns } from "@/lib/insights";
import { Download } from "lucide-react";
import { EmptyState, PageHeader, PrintButton } from "@/components/dashboard/ui";
import { RunAnalysisButton } from "@/components/dashboard/RunAnalysisButton";
import { TrendChart } from "@/components/dashboard/Charts";
import { EngineTabs } from "@/components/dashboard/EngineTabs";

export const metadata: Metadata = { title: "Reports" };

function delta(before: number | null, after: number | null) {
  if (before == null || after == null || before === 0) return null;
  return ((after - before) / before) * 100;
}

export default async function ReportsPage({ searchParams }: { searchParams: Promise<{ engine?: string }> }) {
  const company = await requireCompany();
  const supabase = await createClient();
  const [{ runs, engine, engines }, { data: implemented }] = await Promise.all([
    loadRuns(supabase, company.id, (await searchParams).engine),
    supabase.from("recommendations").select("id, title, implemented_at").eq("company_id", company.id).eq("status", "implemented").order("implemented_at"),
  ]);

  // Baseline = first round this engine was measured in (an engine can be switched on later).
  const done = runs.filter((r) => r.status === "completed" && r.measured);
  const baseline = done[0];
  const latest = done.length > 1 ? done[done.length - 1] : undefined;

  // For each implemented action: first completed round that started after it went live.
  const measured = (implemented ?? []).map((rec) => {
    const after = done.find((r) => r.started_at && rec.implemented_at && Date.parse(r.started_at) > Date.parse(rec.implemented_at));
    return { ...rec, after };
  });

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Reports" subtitle="Before/after proof that your changes moved AI visibility, plus exports to share." />
        {baseline && (
          <div className="mb-8 flex flex-wrap items-start gap-2 print:hidden">
            <a href={`/api/companies/${company.id}/export?engine=${engine}`} className="glass flex min-h-11 items-center gap-2 rounded-full px-5 font-semibold text-ink">
              <Download size={16} /> Export CSV
            </a>
            <PrintButton />
          </div>
        )}
      </div>
      <EngineTabs engines={engines} engine={engine} path="/reports" />
      {!baseline || !latest ? (
        <EmptyState
          title="Reports need two completed analyses"
          body="Neptune compares your first analysis (the baseline) with the latest one. It re-checks automatically 14 days after you mark a recommendation implemented — or start a new analysis any time (once per hour)."
          action={baseline ? <div className="flex justify-center"><RunAnalysisButton label="Run a new analysis" primary /></div> : undefined}
        />
      ) : (
        <>
          <section className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-ink">Share of {ENGINE_LABEL[engine]} answers over time</h2>
            <div className="mt-4">
              <TrendChart
                data={done.map((r) => ({ round: r === baseline ? "Baseline" : `Round ${r.round_number}`, citation: Number(r.citation_share ?? 0), recommendation: Number(r.recommendation_share ?? 0) }))}
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
