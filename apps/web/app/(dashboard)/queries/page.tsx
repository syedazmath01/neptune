import type { Metadata } from "next";
import Link from "next/link";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { ENGINE_LABEL, loadLatest } from "@/lib/insights";
import { EmptyState, Meter, PageHeader, PresenceBadge } from "@/components/dashboard/ui";
import { EngineTabs, FilterTabs } from "@/components/dashboard/EngineTabs";
import { RanksForm } from "@/components/dashboard/RanksForm";

export const metadata: Metadata = { title: "Queries" };

const label = (c: string) => c.replace(/_/g, " ").replace(/^\w/, (x) => x.toUpperCase());

export default async function QueriesPage({ searchParams }: { searchParams: Promise<{ engine?: string; category?: string }> }) {
  const sp = await searchParams;
  const company = await requireCompany();
  const supabase = await createClient();
  const [{ last, engine, engines, breakdown }, { data: prompts }] = await Promise.all([
    loadLatest(supabase, company.id, sp.engine),
    supabase.from("prompts").select("id, text, category, google_rank").eq("company_id", company.id).eq("active", true).order("category"),
  ]);

  const ai = ENGINE_LABEL[engine];
  const all = prompts ?? [];
  const categories = [...new Set(all.map((p) => p.category as string))];
  const category = sp.category && categories.includes(sp.category) ? sp.category : null;
  const byId = new Map(breakdown.map((p) => [p.id, p]));
  const stats = categories.map((c) => {
    const ps = breakdown.filter((p) => p.category === c && p.answered);
    return { c, total: ps.length, appear: ps.filter((p) => p.youMentioned).length };
  });
  const rows = all.filter((p) => !category || p.category === category);

  return (
    <>
      <PageHeader title="Queries" subtitle="The customer questions Neptune tracks for you, grouped by buying intent." />
      {!all.length ? (
        <EmptyState title="No queries yet" body="Neptune writes about 50 real customer questions for your market during your first analysis." />
      ) : (
        <>
          {last && (
            <>
              <EngineTabs engines={engines} engine={engine} path="/queries" />
              <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                {stats.map((s) => (
                  <Link key={s.c} href={`/queries?category=${s.c}`} className="glass rounded-2xl p-4 transition hover:bg-white/70">
                    <p className="text-sm text-muted">{label(s.c)}</p>
                    <p className="mt-1 text-2xl font-semibold text-ink">
                      {s.appear}<span className="text-base font-normal text-muted">/{s.total}</span>
                    </p>
                    <p className="mb-2 text-xs text-muted">{ai} answers mention you</p>
                    <Meter value={s.appear} max={s.total} />
                  </Link>
                ))}
              </div>
            </>
          )}

          <FilterTabs
            label="Category"
            items={[
              { label: "All", href: "/queries", active: !category, count: all.length },
              ...categories.map((c) => ({ label: label(c), href: `/queries?category=${c}`, active: category === c, count: all.filter((p) => p.category === c).length })),
            ]}
          />

          <div className="glass overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  <th className="p-4 font-medium">Question</th>
                  <th className="p-4 font-medium">Category</th>
                  <th className="p-4 font-medium">Google rank</th>
                  <th className="p-4 font-medium">You in {ai}</th>
                  <th className="p-4 font-medium">Competitors recommended</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => {
                  const r = byId.get(p.id);
                  return (
                    <tr key={p.id} className="border-b border-line align-top last:border-0">
                      <td className="p-4 text-ink">{p.text}</td>
                      <td className="p-4 text-muted">{label(p.category)}</td>
                      <td className="p-4 text-ink">{p.google_rank ? `#${p.google_rank}` : "—"}</td>
                      <td className="p-4">{r?.answered ? <PresenceBadge recommended={r.youRecommended} mentioned={r.youMentioned} /> : <span className="text-muted">Not asked yet</span>}</td>
                      <td className="p-4 text-muted">{r?.competitorsRecommended.join(", ") || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <details className="glass mt-6 rounded-2xl p-5">
            <summary className="cursor-pointer font-semibold text-ink">Add your Google rankings (sharpens opportunity priorities)</summary>
            <RanksForm prompts={all} />
          </details>
        </>
      )}
    </>
  );
}
