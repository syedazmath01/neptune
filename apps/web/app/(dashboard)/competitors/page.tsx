import type { Metadata } from "next";
import Link from "next/link";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { ENGINE_LABEL, loadLatest } from "@/lib/insights";
import { EmptyState, PageHeader } from "@/components/dashboard/ui";
import { EngineTabs } from "@/components/dashboard/EngineTabs";
import { CompetitorChart } from "@/components/dashboard/Charts";

export const metadata: Metadata = { title: "Competitors" };

export default async function CompetitorsPage({ searchParams }: { searchParams: Promise<{ engine?: string }> }) {
  const company = await requireCompany();
  const supabase = await createClient();
  const { last, engine, engines, breakdown } = await loadLatest(supabase, company.id, (await searchParams).engine);

  const ai = ENGINE_LABEL[engine];
  const answered = breakdown.filter((p) => p.answered).length;
  const rivals = Object.entries(last?.competitor_snapshot ?? {}).map(([domain, c]) => ({ domain, ...c }));
  const chart = last
    ? [
        { name: company.name, mentions: last.brand_citations_count ?? 0, recommendations: last.brand_recommendation_count ?? 0 },
        ...rivals.map((c) => ({ name: c.name, mentions: c.citations, recommendations: c.recommendations })),
      ]
    : [];

  return (
    <>
      <PageHeader title="Competitors" subtitle={`How ${company.name} compares with the competitors you track${last ? ` in ${ai} answers` : ""}.`} />
      {!last ? (
        <EmptyState title="No comparison yet" body="Competitor results appear here once your first analysis finishes." />
      ) : (
        <>
          <EngineTabs engines={engines} engine={engine} path="/competitors" />
          <section className="glass rounded-2xl p-5">
            <h2 className="font-semibold text-ink">You vs. competitors</h2>
            <p className="text-sm text-muted">Round {last.round_number} · {answered} answers</p>
            <div className="mt-4"><CompetitorChart data={chart} /></div>
          </section>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            {rivals.map((c) => {
              const wins = breakdown.filter((p) => p.competitorsRecommended.includes(c.name) && !p.youMentioned);
              return (
                <section key={c.domain} className="glass rounded-2xl p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-semibold text-ink">{c.name}</h2>
                      <p className="text-sm text-muted">{c.domain}</p>
                    </div>
                    <div className="text-right text-sm">
                      <p><span className="font-semibold text-ink">{c.citations}</span> <span className="text-muted">mentions</span></p>
                      <p><span className="font-semibold text-ink">{c.recommendations}</span> <span className="text-muted">recommendations</span></p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-ink">Questions where {ai} recommends {c.name} and skips you</p>
                  {wins.length ? (
                    <ul className="mt-2 space-y-1.5 text-sm text-ink">
                      {wins.slice(0, 4).map((p) => (
                        <li key={p.id} className="rounded-lg bg-white/60 px-3 py-2">{p.text}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-sm text-muted">None this round.</p>
                  )}
                  {wins.length > 4 && (
                    <Link href="/answers?filter=missing" className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-forest-700">
                      +{wins.length - 4} more →
                    </Link>
                  )}
                </section>
              );
            })}
          </div>
          <p className="mt-6 text-sm text-muted">
            Want to compare against someone else? <Link href="/settings" className="font-semibold text-forest-700 underline">Manage competitors in Settings</Link>.
          </p>
        </>
      )}
    </>
  );
}
