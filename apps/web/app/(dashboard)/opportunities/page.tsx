import type { Metadata } from "next";
import Link from "next/link";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader, SeverityBadge, StatusBadge } from "@/components/dashboard/ui";
import { EngineChips, FilterTabs } from "@/components/dashboard/EngineTabs";
import { RecommendationActions } from "@/components/dashboard/RecommendationActions";
import type { RecStatus } from "@/lib/actions/recommendations";

export const metadata: Metadata = { title: "Opportunities" };

const TABS = {
  review: { label: "To review", statuses: ["pending"] },
  active: { label: "In progress", statuses: ["approved", "in_progress"] },
  done: { label: "Implemented", statuses: ["implemented"] },
  dismissed: { label: "Dismissed", statuses: ["rejected", "skipped"] },
  all: { label: "All", statuses: [] as string[] },
} as const;
type Tab = keyof typeof TABS;

const IMPACT_ORDER = { high: 0, medium: 1, low: 2 } as const;
const STATUS_ORDER: Record<string, number> = { pending: 0, approved: 1, in_progress: 2, implemented: 3, skipped: 4, rejected: 5 };

type Rec = {
  id: string;
  title: string;
  description: string;
  implementation_example: string | null;
  evidence: string | null;
  expected_impact: "high" | "medium" | "low";
  time_estimate_hours: number | null;
  status: string | null;
  implemented_at: string | null;
  implementation_notes: string | null;
  gaps: { gap_type: string; engines: string[] } | null;
};

export default async function OpportunitiesPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const company = await requireCompany();
  const supabase = await createClient();
  const { data } = await supabase
    .from("recommendations")
    .select("id, title, description, implementation_example, evidence, expected_impact, time_estimate_hours, status, implemented_at, implementation_notes, gaps(gap_type, engines)")
    .eq("company_id", company.id);

  const recs = ((data ?? []) as unknown as Rec[]).sort(
    (a, b) => STATUS_ORDER[a.status ?? "pending"] - STATUS_ORDER[b.status ?? "pending"] || IMPACT_ORDER[a.expected_impact] - IMPACT_ORDER[b.expected_impact],
  );
  const inTab = (t: Tab, r: Rec) => t === "all" || (TABS[t].statuses as readonly string[]).includes(r.status ?? "pending");
  const count = (t: Tab) => recs.filter((r) => inTab(t, r)).length;
  const tab: Tab = sp.status && sp.status in TABS ? (sp.status as Tab) : count("review") ? "review" : "all";
  const shown = recs.filter((r) => inTab(tab, r));

  return (
    <>
      <PageHeader title="Opportunities" subtitle="Where AI recommends competitors instead of you — and the evidence-backed action to fix each one." />

      <ol className="glass mb-6 grid gap-4 rounded-2xl p-5 text-sm text-ink md:grid-cols-3">
        <li>
          <span className="font-semibold">1. Approve</span> the actions you plan to take. Approving doesn&apos;t change anything on your website — it&apos;s your to-do list.
        </li>
        <li>
          <span className="font-semibold">2. Make the change</span> on your website. &ldquo;How&rdquo; says what to do; &ldquo;Evidence&rdquo; shows the AI answer that prompted it.
        </li>
        <li>
          <span className="font-semibold">3. Mark it implemented.</span> Neptune re-asks the same questions 14 days later — the time AI assistants need to notice website
          changes — and shows the before/after in <Link href="/reports" className="font-semibold text-forest-700 underline">Reports</Link>.
        </li>
      </ol>

      {!recs.length ? (
        <EmptyState title="No opportunities yet" body="Opportunities are found once your first analysis compares your AI visibility against competitors." />
      ) : (
        <>
          <FilterTabs
            label="Status"
            items={(Object.keys(TABS) as Tab[]).map((t) => ({ label: TABS[t].label, href: t === "all" ? "/opportunities?status=all" : `/opportunities?status=${t}`, active: t === tab, count: count(t) }))}
          />
          <ul className="space-y-4">
            {shown.map((r) => (
              <li key={r.id} className="glass rounded-2xl p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <SeverityBadge level={r.expected_impact} />
                  <StatusBadge status={r.status ?? "pending"} />
                  {r.gaps?.gap_type && <span className="text-xs font-semibold capitalize text-forest-700">{r.gaps.gap_type.replace(/_/g, " ")}</span>}
                  {r.time_estimate_hours != null && <span className="text-xs text-muted">~{r.time_estimate_hours}h of work</span>}
                  {!!r.gaps?.engines?.length && <span className="ml-auto"><EngineChips engines={r.gaps.engines} /></span>}
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
          {!shown.length && <p className="glass rounded-2xl p-6 text-center text-muted">Nothing here.</p>}
        </>
      )}
    </>
  );
}
