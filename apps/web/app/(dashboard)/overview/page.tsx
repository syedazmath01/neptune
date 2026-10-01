import type { Metadata } from "next";
import { Download } from "lucide-react";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { loadBreakdown, loadRuns } from "@/lib/insights";
import { EmptyState, MetricCard, PageHeader, PrintButton } from "@/components/dashboard/ui";
import { AnalysisStatus } from "@/components/dashboard/AnalysisStatus";
import { RunAnalysisButton } from "@/components/dashboard/RunAnalysisButton";
import { CompetitorChart } from "@/components/dashboard/Charts";

export const metadata: Metadata = { title: "Overview" };

const DAY = 24 * 60 * 60 * 1000;
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

export default async function OverviewPage() {
  const company = await requireCompany();
  const supabase = await createClient();

  const [runs, { count: promptCount }, { data: recs }] = await Promise.all([
    loadRuns(supabase, company.id),
    supabase.from("prompts").select("id", { count: "exact", head: true }).eq("company_id", company.id).eq("active", true),
    supabase.from("recommendations").select("status, implemented_at").eq("company_id", company.id),
  ]);

  const latest = runs.at(-1);
  const last = runs.filter((r) => r.status === "completed").at(-1);
  const running = !latest ? false : latest.status === "running" || latest.status === "pending";

  let done = 0;
  if (running && latest) {
    const { count } = await supabase
      .from("responses")
      .select("id, prompts!inner(company_id)", { count: "exact", head: true })
      .eq("prompts.company_id", company.id)
      .eq("measurement_round", latest.round_number);
    done = count ?? 0;
  }

  const breakdown = last ? await loadBreakdown(supabase, company.id, last.round_number) : [];
  const chart = last
    ? [
        { name: company.name, mentions: last.brand_citations_count ?? 0, recommendations: last.brand_recommendation_count ?? 0 },
        ...Object.values(last.competitor_snapshot ?? {}).map((c) => ({ name: c.name, mentions: c.citations, recommendations: c.recommendations })),
      ]
    : [];

  const counts = (recs ?? []).reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.status ?? "pending"]: (acc[r.status ?? "pending"] ?? 0) + 1 }), {});
  const upcoming = (recs ?? [])
    .filter((r) => r.status === "implemented" && r.implemented_at)
    .map((r) => Date.parse(r.implemented_at!) + 14 * DAY)
    .filter((t) => t > Date.now() - DAY)
    .sort((a, b) => a - b)[0];

  const wins = breakdown.filter((p) => p.youRecommended).length;
  const losses = breakdown.filter((p) => !p.youMentioned && p.competitorsRecommended.length).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Overview" subtitle={`How ${company.name} shows up in ChatGPT answers.`} />
        <div className="mb-8 flex flex-wrap items-start gap-2 print:hidden">
          {last && (
            <>
              <a href={`/api/companies/${company.id}/export`} className="glass flex min-h-11 items-center gap-2 rounded-full px-5 font-semibold text-ink">
                <Download size={16} /> Export CSV
              </a>
              <PrintButton />
            </>
          )}
          {!running && (promptCount || runs.length) ? <RunAnalysisButton /> : null}
        </div>
      </div>

      {running && latest && (
        <div className="mb-8">
          <AnalysisStatus round={latest.round_number} total={promptCount ?? 0} done={done} />
        </div>
      )}

      {latest?.status === "failed" && (
        <div className="mb-8 rounded-2xl border border-danger/30 bg-danger/10 p-5">
          <p className="font-semibold text-danger">The last analysis didn&apos;t finish.</p>
          <p className="mt-1 text-sm text-ink">This is usually a temporary ChatGPT API issue. Your previous results are unchanged.</p>
          <div className="mt-3"><RunAnalysisButton label="Try again" primary /></div>
        </div>
      )}

      {!last && !running && latest?.status !== "failed" && (
        <EmptyState
          title="Your first analysis hasn't run yet"
          body="Neptune will generate ~50 real customer questions for your market, ask ChatGPT each one, and show where you win and lose."
          action={<div className="flex justify-center"><RunAnalysisButton label="Run first analysis" primary /></div>}
        />
      )}

      {last && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <a href="#prompts"><MetricCard index={0} label="Brand mentions" value={last.brand_citations_count} hint="Prompts where ChatGPT mentioned you" /></a>
            <a href="#prompts"><MetricCard index={1} label="Recommendations" value={last.brand_recommendation_count} hint="Prompts where you were recommended" /></a>
            <MetricCard index={2} label="Citation share" value={last.citation_share != null ? Number(last.citation_share) : null} suffix="%" hint="Your mentions ÷ all tracked brands" />
            <MetricCard index={3} label="Recommendation share" value={last.recommendation_share != null ? Number(last.recommendation_share) : null} suffix="%" hint="Your recommendations ÷ all tracked brands" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-ink">You vs. competitors</h2>
              <p className="text-sm text-muted">Round {last.round_number} · {breakdown.length} prompts</p>
              <div className="mt-4"><CompetitorChart data={chart} /></div>
            </section>
            <div className="grid gap-4">
              <section className="glass rounded-2xl p-5">
                <h2 className="font-semibold text-ink">Actions</h2>
                <ul className="mt-3 space-y-1.5 text-sm">
                  {[["pending", "Awaiting review"], ["approved", "Approved"], ["in_progress", "In progress"], ["implemented", "Implemented"]].map(([k, label]) => (
                    <li key={k} className="flex justify-between"><span className="text-muted">{label}</span><span className="font-semibold text-ink">{counts[k] ?? 0}</span></li>
                  ))}
                </ul>
                <a href="/recommendations" className="mt-3 inline-block text-sm font-semibold text-forest-700">Review recommendations →</a>
              </section>
              <section className="glass rounded-2xl p-5">
                <h2 className="font-semibold text-ink">Next re-measurement</h2>
                <p className="mt-2 text-2xl font-semibold text-ink">{upcoming ? fmtDate(upcoming) : "—"}</p>
                <p className="mt-1 text-sm text-muted">{upcoming ? "14 days after your latest implemented action." : "Mark a recommendation implemented to schedule one."}</p>
              </section>
            </div>
          </div>

          <section id="prompts" className="glass mt-6 scroll-mt-6 rounded-2xl p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold text-ink">Prompt breakdown</h2>
              <p className="text-sm text-muted"><span className="font-semibold text-success">{wins} won</span> · <span className="font-semibold text-danger">{losses} lost to competitors</span></p>
            </div>
            <ul className="mt-4 divide-y divide-line">
              {breakdown.map((p) => (
                <li key={p.id}>
                  <details className="group py-3">
                    <summary className="flex cursor-pointer list-none items-start justify-between gap-3">
                      <span className="text-ink">{p.text}</span>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                          p.youRecommended ? "bg-success/15 text-success" : p.youMentioned ? "bg-severity-medium/15 text-severity-medium" : "bg-danger/10 text-danger"
                        }`}
                      >
                        {p.youRecommended ? "Recommended" : p.youMentioned ? "Mentioned" : "Missing"}
                      </span>
                    </summary>
                    <div className="mt-3 space-y-2 text-sm">
                      <p className="text-muted">
                        Category: {p.category.replace(/_/g, " ")}
                        {p.google_rank != null && ` · Google rank #${p.google_rank}`}
                      </p>
                      {p.cited.length > 0 && (
                        <p className="text-ink">Brands in the answer: {p.cited.map((c) => `${c.name} (${c.context})`).join(", ")}</p>
                      )}
                      {p.answer && (
                        <blockquote className="max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl bg-cream-100 p-3 text-ink/80">{p.answer}</blockquote>
                      )}
                    </div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
