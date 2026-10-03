import type { Metadata } from "next";
import Link from "next/link";
import { Download } from "lucide-react";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { ENGINE_LABEL, loadLatest, mentionTotals, recommendedRate, visibility } from "@/lib/insights";
import { CardHeader, EmptyState, Meter, MetricCard, PageHeader, PresenceBadge, PrintButton } from "@/components/dashboard/ui";
import { AnalysisStatus } from "@/components/dashboard/AnalysisStatus";
import { RunAnalysisButton } from "@/components/dashboard/RunAnalysisButton";
import { TrendChart } from "@/components/dashboard/Charts";
import { EngineTabs } from "@/components/dashboard/EngineTabs";

export const metadata: Metadata = { title: "Overview" };

const DAY = 24 * 60 * 60 * 1000;
const fmtDate = (ms: number) => new Date(ms).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" });

export default async function OverviewPage({ searchParams }: { searchParams: Promise<{ engine?: string }> }) {
  const company = await requireCompany();
  const supabase = await createClient();

  const [{ runs, measured, last, engine, engines, breakdown }, { count: promptCount }, { data: recs }] = await Promise.all([
    loadLatest(supabase, company.id, (await searchParams).engine),
    supabase.from("prompts").select("id", { count: "exact", head: true }).eq("company_id", company.id).eq("active", true),
    supabase.from("recommendations").select("status, implemented_at").eq("company_id", company.id),
  ]);

  const latest = runs.at(-1);
  const running = latest?.status === "running" || latest?.status === "pending";
  const ai = ENGINE_LABEL[engine];

  // Progress = answers so far ÷ (prompts × engines answering this round).
  let done = 0;
  let engineCount = 1;
  if (running && latest) {
    const { data: answered } = await supabase
      .from("responses")
      .select("engine, prompts!inner(company_id)")
      .eq("prompts.company_id", company.id)
      .eq("measurement_round", latest.round_number);
    done = answered?.length ?? 0;
    engineCount = Math.max(1, new Set(answered?.map((a) => a.engine)).size);
  }

  const answered = breakdown.filter((p) => p.answered).length;
  const vis = last ? visibility(last) : null;
  const prev = measured.at(-2);
  const prevVis = prev ? visibility(prev) : null;
  const delta = vis != null && prevVis != null ? Math.round((vis - prevVis) * 10) / 10 : null;
  const trend = measured.map((r, i) => ({
    round: i === 0 ? "Baseline" : `Round ${r.round_number}`,
    citation: visibility(r) ?? 0,
    recommendation: recommendedRate(r) ?? 0,
  }));
  const appears = breakdown.filter((p) => p.youMentioned).sort((a, b) => Number(b.youRecommended) - Number(a.youRecommended));
  const mentions = mentionTotals(breakdown).slice(0, 5);

  const counts = (recs ?? []).reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.status ?? "pending"]: (acc[r.status ?? "pending"] ?? 0) + 1 }), {});
  const upcoming = (recs ?? [])
    .filter((r) => r.status === "implemented" && r.implemented_at)
    .map((r) => Date.parse(r.implemented_at!) + 14 * DAY)
    .filter((t) => t > Date.now() - DAY)
    .sort((a, b) => a - b)[0];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeader title="Overview" subtitle={`How ${company.name} shows up in ${last ? ai : "AI"} answers.`} />
        <div className="mb-8 flex flex-wrap items-start gap-2 print:hidden">
          {last && (
            <>
              <a href={`/api/companies/${company.id}/export?engine=${engine}`} className="glass flex min-h-11 items-center gap-2 rounded-full px-5 font-semibold text-ink">
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
          <AnalysisStatus round={latest.round_number} total={(promptCount ?? 0) * engineCount} done={done} />
        </div>
      )}

      {latest?.status === "failed" && (
        <div className="mb-8 rounded-2xl border border-danger/30 bg-danger/10 p-5">
          <p className="font-semibold text-danger">The last analysis didn&apos;t finish.</p>
          <p className="mt-1 text-sm text-ink">This is usually a temporary AI engine API issue. Your previous results are unchanged.</p>
          <div className="mt-3"><RunAnalysisButton label="Try again" primary /></div>
        </div>
      )}

      {!last && !running && latest?.status !== "failed" && (
        <EmptyState
          title="Your first analysis hasn't run yet"
          body="Neptune will generate ~50 real customer questions for your market, ask AI answer engines each one, and show where you win and lose."
          action={<div className="flex justify-center"><RunAnalysisButton label="Run first analysis" primary /></div>}
        />
      )}

      {last && (
        <>
          <EngineTabs engines={engines} engine={engine} path="/overview" />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard index={0} label="Brand mentions" value={last.brand_citations_count} hint={`Answers where ${ai} mentioned you`} />
            <MetricCard index={1} label="Recommendations" value={last.brand_recommendation_count} hint="Answers that recommended you" />
            <MetricCard index={2} label="Citation share" value={last.citation_share != null ? Number(last.citation_share) : null} suffix="%" hint="Your mentions ÷ all tracked brands" />
            <MetricCard index={3} label="Recommendation share" value={last.recommendation_share != null ? Number(last.recommendation_share) : null} suffix="%" hint="Your recommendations ÷ all tracked brands" />
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
            <section className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-ink">AI visibility</h2>
                  <p className="mt-1 flex flex-wrap items-baseline gap-x-3 text-4xl font-semibold text-ink">
                    {vis ?? 0}%
                    {delta != null && (
                      <span className={`text-base font-semibold ${delta >= 0 ? "text-success" : "text-danger"}`}>
                        {delta >= 0 ? "↑" : "↓"} {Math.abs(delta)} pts vs last round
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-muted">
                    of {last.answers ?? answered} {ai} answers mention {company.name}
                  </p>
                </div>
                <span className="rounded-lg border border-line bg-white/60 px-2.5 py-1 text-xs text-muted">
                  {measured.length} round{measured.length === 1 ? "" : "s"}
                </span>
              </div>
              {trend.length >= 2 ? (
                <div className="mt-4"><TrendChart data={trend} names={["Mentioned in (%)", "Recommended in (%)"]} /></div>
              ) : (
                <div className="mt-6 space-y-5">
                  {[
                    ["Mentioned in", vis ?? 0, "forest"],
                    ["Recommended in", recommendedRate(last) ?? 0, "terracotta"],
                  ].map(([label, value, tone]) => (
                    <div key={label as string}>
                      <div className="mb-1.5 flex justify-between text-sm">
                        <span className="text-ink">{label} {ai} answers</span>
                        <span className="font-semibold text-ink">{value}%</span>
                      </div>
                      <Meter value={value as number} max={100} tone={tone as "forest" | "terracotta"} />
                    </div>
                  ))}
                  <p className="rounded-xl bg-cream-100 p-4 text-sm text-muted">
                    Your trend line appears after the next analysis — re-run any time (once per hour), or Neptune re-checks automatically 14 days
                    after you implement a recommendation.
                  </p>
                </div>
              )}
            </section>

            <div className="grid content-start gap-4">
              <section className="glass rounded-2xl p-5">
                <CardHeader title="Actions" href="/opportunities" link="Review" />
                <ul className="mt-2 space-y-1.5 text-sm">
                  {[["pending", "Awaiting review"], ["approved", "Approved"], ["in_progress", "In progress"], ["implemented", "Implemented"]].map(([k, label]) => (
                    <li key={k} className="flex justify-between"><span className="text-muted">{label}</span><span className="font-semibold text-ink">{counts[k] ?? 0}</span></li>
                  ))}
                </ul>
              </section>
              <section className="glass rounded-2xl p-5">
                <h2 className="font-semibold text-ink">Next re-measurement</h2>
                <p className="mt-2 text-2xl font-semibold text-ink">{upcoming ? fmtDate(upcoming) : "—"}</p>
                <p className="mt-1 text-sm text-muted">{upcoming ? "14 days after your latest implemented action." : "Mark a recommendation implemented to schedule one."}</p>
              </section>
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <section className="glass rounded-2xl p-5">
              <CardHeader title="Queries where you appear" href="/queries" link="All queries" />
              {appears.length ? (
                <ul className="mt-2 space-y-2">
                  {appears.slice(0, 5).map((p) => (
                    <li key={p.id} className="flex items-start justify-between gap-3 rounded-xl border border-line bg-white/60 px-3 py-2 text-sm">
                      <span className="text-ink">{p.text}</span>
                      <PresenceBadge recommended={p.youRecommended} mentioned={p.youMentioned} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 rounded-xl bg-cream-100 p-4 text-sm text-ink">
                  {ai} didn&apos;t mention {company.name} in any of its {answered} answers yet.{" "}
                  <Link href="/opportunities" className="font-semibold text-forest-700">See what to fix →</Link>
                </p>
              )}
              {appears.length > 5 && <p className="mt-2 text-sm text-muted">+{appears.length - 5} more</p>}
            </section>

            <section className="glass rounded-2xl p-5">
              <CardHeader title="Top mentions" href="/mentions" link="All mentions" />
              <ul className="mt-2 space-y-3">
                {mentions.map((m) => (
                  <li key={`${m.kind}:${m.name}`}>
                    <div className="flex items-baseline justify-between gap-3 text-sm">
                      <span className={m.kind === "you" ? "font-semibold text-forest-800" : "text-ink"}>
                        {m.name}
                        {m.kind === "you" && <span className="ml-1.5 text-xs text-terracotta-600">you</span>}
                        {m.kind === "source" && <span className="ml-1.5 text-xs text-muted">website</span>}
                      </span>
                      <span className="shrink-0 text-muted">{m.answers} answer{m.answers === 1 ? "" : "s"}</span>
                    </div>
                    <div className="mt-1"><Meter value={m.answers} max={answered} tone={m.kind === "you" ? "terracotta" : "forest"} /></div>
                  </li>
                ))}
              </ul>
              {!mentions.length && <p className="mt-3 text-sm text-muted">No brands or websites were mentioned in this round.</p>}
            </section>
          </div>
        </>
      )}
    </>
  );
}
