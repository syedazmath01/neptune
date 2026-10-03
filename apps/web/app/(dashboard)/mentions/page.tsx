import type { Metadata } from "next";
import Link from "next/link";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { ENGINE_LABEL, loadLatest, mentionTotals } from "@/lib/insights";
import { EmptyState, Meter, PageHeader } from "@/components/dashboard/ui";
import { EngineTabs } from "@/components/dashboard/EngineTabs";

export const metadata: Metadata = { title: "Brand Mentions" };

export default async function MentionsPage({ searchParams }: { searchParams: Promise<{ engine?: string }> }) {
  const company = await requireCompany();
  const supabase = await createClient();
  const { last, engine, engines, breakdown } = await loadLatest(supabase, company.id, (await searchParams).engine);

  const ai = ENGINE_LABEL[engine];
  const answered = breakdown.filter((p) => p.answered).length;
  // Brands come from the round's scorecard so tracked competitors with zero mentions still show.
  const brands = last
    ? [
        { name: company.name, you: true, answers: last.brand_citations_count ?? 0, recommended: last.brand_recommendation_count ?? 0 },
        ...Object.values(last.competitor_snapshot ?? {}).map((c) => ({ name: c.name, you: false, answers: c.citations, recommended: c.recommendations })),
      ].sort((a, b) => b.answers - a.answers)
    : [];
  const sources = mentionTotals(breakdown).filter((m) => m.kind === "source").slice(0, 20);

  return (
    <>
      <PageHeader title="Brand Mentions" subtitle={last ? `Which brands and websites ${ai} brings up across ${answered} answers.` : "Which brands and websites AI assistants bring up for your market."} />
      {!last ? (
        <EmptyState title="No mentions yet" body="Mentions appear here once your first analysis finishes." />
      ) : (
        <>
          <EngineTabs engines={engines} engine={engine} path="/mentions" />
          <div className="grid gap-6 lg:grid-cols-2">
            <section className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-ink">Brands in {ai} answers</h2>
              <p className="mt-1 text-sm text-muted">You and the competitors you track. &ldquo;Recommended&rdquo; means the answer actively suggested the brand.</p>
              <ul className="mt-5 space-y-4">
                {brands.map((b) => (
                  <li key={b.name}>
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                      <span className={b.you ? "font-semibold text-forest-800" : "font-medium text-ink"}>
                        {b.name}
                        {b.you && <span className="ml-2 rounded-full bg-terracotta-400/15 px-2 py-0.5 text-xs text-terracotta-600">you</span>}
                      </span>
                      <span className="text-muted">
                        {b.answers} of {answered} answers · recommended in {b.recommended}
                      </span>
                    </div>
                    <div className="mt-1.5"><Meter value={b.answers} max={answered} tone={b.you ? "terracotta" : "forest"} /></div>
                  </li>
                ))}
              </ul>
              {(last.brand_citations_count ?? 0) === 0 && (
                <p className="mt-5 rounded-xl bg-danger/10 p-3 text-sm text-danger">
                  {company.name} wasn&apos;t mentioned in any answer this round. <Link href="/opportunities" className="font-semibold underline">See what to fix</Link>
                </p>
              )}
            </section>

            <section className="glass rounded-2xl p-5">
              <h2 className="font-semibold text-ink">Websites {ai} cites</h2>
              <p className="mt-1 text-sm text-muted">
                Sources the answers link to. Getting listed, reviewed or quoted on these sites is one of the fastest ways to start appearing in AI answers.
              </p>
              {sources.length ? (
                <ul className="mt-5 space-y-4">
                  {sources.map((s) => (
                    <li key={s.name}>
                      <div className="flex items-baseline justify-between gap-3 text-sm">
                        <span className="truncate font-medium text-ink">{s.name}</span>
                        <span className="shrink-0 text-muted">{s.answers} answer{s.answers === 1 ? "" : "s"}</span>
                      </div>
                      <div className="mt-1.5"><Meter value={s.answers} max={answered} /></div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-xl bg-cream-100 p-4 text-sm text-muted">No answers linked to outside websites this round — some assistants answer without citing sources.</p>
              )}
            </section>
          </div>
          <p className="mt-6 text-xs text-muted">
            Neptune detects your brand and your tracked competitors by name, plus every website an answer links to. To track another brand, add it in{" "}
            <Link href="/settings" className="font-semibold text-forest-700 underline">Settings</Link>.
          </p>
        </>
      )}
    </>
  );
}
