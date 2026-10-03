import type { Metadata } from "next";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { ENGINE_LABEL, loadLatest, type PromptResult } from "@/lib/insights";
import { EmptyState, PageHeader, PresenceBadge } from "@/components/dashboard/ui";
import { EngineTabs, FilterTabs } from "@/components/dashboard/EngineTabs";
import { AnswerText } from "@/components/dashboard/AnswerText";

export const metadata: Metadata = { title: "AI Answers" };

const FILTERS = { all: "All", recommended: "Recommended", mentioned: "Mentioned", missing: "Missing" } as const;
type Filter = keyof typeof FILTERS;

const matches = (f: Filter, p: PromptResult) =>
  f === "all" || (f === "recommended" ? p.youRecommended : f === "mentioned" ? p.youMentioned && !p.youRecommended : !p.youMentioned);

export default async function AnswersPage({ searchParams }: { searchParams: Promise<{ engine?: string; filter?: string }> }) {
  const sp = await searchParams;
  const company = await requireCompany();
  const supabase = await createClient();
  const { last, engine, engines, breakdown } = await loadLatest(supabase, company.id, sp.engine);

  const ai = ENGINE_LABEL[engine];
  const filter: Filter = sp.filter && sp.filter in FILTERS ? (sp.filter as Filter) : "all";
  const rows = breakdown.filter((p) => p.answered);
  const shown = rows.filter((p) => matches(filter, p));
  const href = (f: Filter) => {
    const q = new URLSearchParams({ ...(engines.length > 1 ? { engine } : {}), ...(f !== "all" ? { filter: f } : {}) }).toString();
    return q ? `/answers?${q}` : "/answers";
  };

  return (
    <>
      <PageHeader
        title="AI Answers"
        subtitle={last ? `Every question Neptune asked ${ai} in round ${last.round_number}, with the full answer.` : "The questions Neptune asks AI assistants, with their full answers."}
      />
      {!last ? (
        <EmptyState title="No answers yet" body="Answers appear here once your first analysis finishes." />
      ) : (
        <>
          <EngineTabs engines={engines} engine={engine} path="/answers" />
          <FilterTabs
            items={(Object.keys(FILTERS) as Filter[]).map((f) => ({ label: FILTERS[f], href: href(f), active: f === filter, count: rows.filter((p) => matches(f, p)).length }))}
          />
          <ul className="space-y-3">
            {shown.map((p) => (
              <li key={p.id} className="glass rounded-2xl">
                <details className="p-5">
                  <summary className="flex cursor-pointer list-none items-start justify-between gap-3 [&::-webkit-details-marker]:hidden">
                    <span className="font-medium text-ink">{p.text}</span>
                    <PresenceBadge recommended={p.youRecommended} mentioned={p.youMentioned} />
                  </summary>
                  <div className="mt-4 space-y-3 text-sm">
                    <p className="text-muted">
                      <span className="capitalize">{p.category.replace(/_/g, " ")}</span>
                      {p.google_rank != null && ` · Google rank #${p.google_rank}`}
                    </p>
                    {p.cited.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-muted">Brands:</span>
                        {p.cited.map((c, i) => (
                          <span
                            key={i}
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.kind === "you" ? "bg-terracotta-400/15 text-terracotta-600" : "bg-forest-500/10 text-forest-700"}`}
                          >
                            {c.name} · {c.context}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.sources.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-muted">Sources:</span>
                        {p.sources.map((d) => (
                          <span key={d} className="rounded-full bg-cream-200 px-2.5 py-1 text-xs text-ink">{d}</span>
                        ))}
                      </div>
                    )}
                    <div className="max-h-[32rem] overflow-y-auto rounded-xl bg-cream-100 p-4 text-ink/85">
                      <AnswerText text={p.answer ?? ""} />
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
          {!shown.length && <p className="glass rounded-2xl p-6 text-center text-muted">No answers in this group.</p>}
        </>
      )}
    </>
  );
}
