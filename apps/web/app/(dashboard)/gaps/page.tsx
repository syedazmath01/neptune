import type { Metadata } from "next";
import { requireCompany } from "@/lib/company";
import { createClient } from "@/lib/supabase/server";
import { EmptyState, PageHeader, SeverityBadge } from "@/components/dashboard/ui";
import { RanksForm } from "@/components/dashboard/RanksForm";

export const metadata: Metadata = { title: "Gaps" };

export default async function GapsPage() {
  const company = await requireCompany();
  const supabase = await createClient();
  const [{ data: gaps }, { data: prompts }] = await Promise.all([
    supabase
      .from("gaps")
      .select("id, gap_type, description, priority, competitor_citation_count, own_citation_count, google_rank")
      .eq("company_id", company.id)
      .eq("status", "open")
      .order("priority_score", { ascending: false, nullsFirst: false }),
    supabase.from("prompts").select("id, text, google_rank").eq("company_id", company.id).eq("active", true).order("category"),
  ]);

  return (
    <>
      <PageHeader title="Gaps" subtitle="Where AI answers recommend competitors instead of you." />

      {!!prompts?.length && (
        <details className="glass mb-6 rounded-2xl p-5">
          <summary className="cursor-pointer font-semibold text-ink">Add your Google rankings (improves gap priority)</summary>
          <RanksForm prompts={prompts} />
        </details>
      )}

      {!gaps?.length ? (
        <EmptyState title="No gaps identified yet" body="Gaps appear after your first analysis compares your AI visibility against competitors." />
      ) : (
        <ul className="grid gap-4 lg:grid-cols-2">
          {gaps.map((g) => (
            <li key={g.id} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm font-semibold capitalize text-forest-700">{g.gap_type.replace(/_/g, " ")}</span>
                <SeverityBadge level={g.priority as "high" | "medium" | "low"} />
              </div>
              <p className="mt-3 text-ink">{g.description}</p>
              <p className="mt-3 text-sm text-muted">
                Competitors cited {g.competitor_citation_count}× · You cited {g.own_citation_count}×
                {g.google_rank != null && ` · Google #${g.google_rank}`}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
